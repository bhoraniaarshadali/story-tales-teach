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
};

export function normalizeTopic(topic: string) {
  if (!topic) return "";
  return topic.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function isGibberish(topic: string) {
  return /([a-z])\1{2,}|([a-z]{1,2})(\2){2,}/i.test(topic);
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
  return CONFIG.defaultSuggestions[Math.floor(Math.random() * CONFIG.defaultSuggestions.length)];
}

export async function validateTopic(topic: string) {
  if (!topic) {
    return { isValid: false, reason: MESSAGES.tooShort, suggestedTopic: null };
  }

  const basicValidation = performBasicValidation(topic);
  if (basicValidation) return basicValidation;

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    console.log("🔑 LOVABLE_API_KEY not found, skipping AI validation");
    return { isValid: true, reason: MESSAGES.noApiKey, suggestedTopic: null };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.validationTimeout);

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are an assistant validating user input for a story generator app. Respond in JSON only." },
          { role: "user", content: `Check if this topic is suitable for generating an educational story: "${topic}"

Validation:
- Must be an explainable concept
- Not offensive, harmful, or illegal
- Not gibberish or random characters
- Casual phrasing is OK

Respond in JSON: {"isValid": boolean, "reason": "brief explanation", "suggestedTopic": "alternate if invalid, else null"}` }
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Validation API error: ${response.status}`);
      return { isValid: true, reason: MESSAGES.apiError, suggestedTopic: null };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isValid: Boolean(parsed.isValid),
          reason: parsed.reason || "No reason provided",
          suggestedTopic: parsed.suggestedTopic || null
        };
      }
      console.warn("⚠️ No JSON found in validation response");
      return { isValid: true, reason: MESSAGES.noJsonFound, suggestedTopic: null };
    } catch {
      return { isValid: true, reason: MESSAGES.noJsonFound, suggestedTopic: null };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return { isValid: true, reason: "Validation timed out", suggestedTopic: null };
    }
    console.error("❌ Validation error:", err);
    return { isValid: true, reason: MESSAGES.apiError, suggestedTopic: null };
  }
}

export function createInvalidTopicResponse(topic: string, reason: string, suggestedTopic: string | null) {
  const finalSuggestedTopic = suggestedTopic || (reason.includes("gibberish") ? getRandomSuggestion() : null);
  const suggestionText = finalSuggestedTopic
    ? `\n\nAap chaahe to "${finalSuggestedTopic}" ke baare mein puch sakte hai.`
    : "";

  return new Response(JSON.stringify({
    title: "Oops! Topic Thoda Confusing Hai",
    content: `Aapne jo topic diya wo samajhne mein mushkil ho raha hai.\n\nReason: ${reason}${suggestionText}`,
    takeaway: "Ek specific aur meaningful topic dein jise story mein samjhaya ja sake.",
    emotions: ["confused", "curious"],
    topic,
    suggestedTopic: finalSuggestedTopic
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200
  });
}

export function createCacheKey(topic: string) {
  return normalizeTopic(topic);
}
