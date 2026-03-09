import { corsHeaders } from "./cors.ts";

const CONFIG = {
  minTopicLength: 3,
  validationTimeout: 5000,
  defaultSuggestions: [
    "artificial intelligence", "cloud computing", "data science",
    "clean energy", "emotional intelligence", "digital marketing", "sustainable development"
  ],
  invalidExamples: new Set([
    "a", "an", "the", "test", "hi", "hello", "xyz", "abc", "123",
    "aaa", "bbb", "testing", "asdf", "qwerty", "check"
  ])
};

const MESSAGES = {
  tooShort: "Topic bahut chhota hai",
  gibberish: "Yeh topic gibberish lag raha hai",
  testWord: "Topic sirf test word lag raha hai",
  noApiKey: "Skipping validation (no API key found)",
  apiError: "Validation API error occurred, defaulting to valid",
  noJsonFound: "No valid JSON response found, assuming valid",
  validationSkipped: "Validation skipped, defaulting to valid"
};

export function normalizeTopic(topic: string) {
  if (!topic) return "";
  return topic.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function isGibberish(topic: string) {
  const repeatedPattern = /([a-z])\1{2,}|([a-z]{1,2})(\2){2,}/i;
  return repeatedPattern.test(topic);
}

function performBasicValidation(topic: string) {
  const cleanedTopic = topic?.trim() || "";
  if (cleanedTopic.length < CONFIG.minTopicLength) {
    return { isValid: false, reason: MESSAGES.tooShort, suggestedTopic: null };
  }
  if (CONFIG.invalidExamples.has(cleanedTopic.toLowerCase())) {
    return { isValid: false, reason: MESSAGES.testWord, suggestedTopic: null };
  }
  if (isGibberish(cleanedTopic)) {
    return { isValid: false, reason: MESSAGES.gibberish, suggestedTopic: getRandomSuggestion() };
  }
  return null;
}

function getRandomSuggestion() {
  const suggestions = CONFIG.defaultSuggestions;
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

export async function validateTopic(topic: string) {
  if (!topic) {
    return { isValid: false, reason: MESSAGES.tooShort, suggestedTopic: null };
  }

  const basicValidation = performBasicValidation(topic);
  if (basicValidation) return basicValidation;

  const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!googleApiKey) {
    console.log("🔑 GOOGLE_API_KEY not found, skipping AI validation");
    return { isValid: true, reason: MESSAGES.noApiKey, suggestedTopic: null };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.validationTimeout);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${googleApiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: `You are an assistant validating user input for a story generator app.

Please check if this topic is suitable for generating a story:
"${topic}"

Validation Checklist:
- It should be an explainable concept
- Not offensive, harmful, or illegal
- Not gibberish or random characters
- Not too vague (like just one word)
- Casual or question-style phrasing is OK

Respond in EXACT JSON format:
{
  "isValid": boolean,
  "reason": "brief explanation",
  "suggestedTopic": "alternate if invalid, else null"
}` }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Validation API error: ${response.status}`);
      return { isValid: true, reason: MESSAGES.apiError, suggestedTopic: null };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        return {
          isValid: Boolean(parsedResult.isValid),
          reason: parsedResult.reason || "No reason provided",
          suggestedTopic: parsedResult.suggestedTopic || null
        };
      } else {
        console.warn("⚠️ No JSON found in API response");
        return { isValid: true, reason: MESSAGES.noJsonFound, suggestedTopic: null };
      }
    } catch (jsonError) {
      console.error("❌ Error parsing JSON:", jsonError);
      return { isValid: true, reason: MESSAGES.noJsonFound, suggestedTopic: null };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.error("❌ Validation timed out");
      return { isValid: true, reason: "Validation timed out, defaulting to valid", suggestedTopic: null };
    }
    console.error("❌ Validation error:", err);
    return { isValid: true, reason: MESSAGES.apiError, suggestedTopic: null };
  }
}

export function createInvalidTopicResponse(topic: string, reason: string, suggestedTopic: string | null) {
  const finalSuggestedTopic = suggestedTopic || (reason.includes("gibberish") ? getRandomSuggestion() : null);
  const suggestionText = finalSuggestedTopic
    ? `\n\nAap chaahe to "${finalSuggestedTopic}" ke baare mein puch sakte hai, Yeh ek better topic ho sakta hai.`
    : "";

  const responseBody = {
    title: "Oops! Topic Thoda Confusing Hai",
    content: `Aapne jo topic diya wo samajhne mein thoda mushkil ho raha hai.\n\nReason: ${reason}${suggestionText}\n\nKya aap ise thoda aur clearly likh sakte hain?`,
    takeaway: "Ek specific aur meaningful topic dein jise story mein samjhaya ja sake.",
    emotions: ["confused", "curious"],
    topic,
    suggestedTopic: finalSuggestedTopic
  };

  return new Response(JSON.stringify(responseBody), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200
  });
}

export function createCacheKey(topic: string) {
  return normalizeTopic(topic);
}
