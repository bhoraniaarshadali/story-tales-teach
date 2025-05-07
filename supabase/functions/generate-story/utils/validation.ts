import { corsHeaders } from "./cors.ts";
// Configuration that can be easily modified
const CONFIG = {
  minTopicLength: 3,
  validationTimeout: 5000,
  defaultSuggestions: [
    "artificial intelligence",
    "cloud computing",
    "data science",
    "clean energy",
    "emotional intelligence",
    "digital marketing",
    "sustainable development"
  ],
  invalidExamples: new Set([
    "a",
    "an",
    "the",
    "test",
    "hi",
    "hello",
    "xyz",
    "abc",
    "123",
    "aaa",
    "bbb",
    "testing",
    "asdf",
    "qwerty",
    "check"
  ])
};
// Improved messages for better user experience
const MESSAGES = {
  tooShort: "Topic bahut chhota hai",
  gibberish: "Yeh topic gibberish lag raha hai",
  testWord: "Topic sirf test word lag raha hai",
  noApiKey: "Skipping validation (no API key found)",
  apiError: "Validation API error occurred, defaulting to valid",
  noJsonFound: "No valid JSON response found, assuming valid",
  validationSkipped: "Validation skipped, defaulting to valid"
};
/**
 * Normalizes a topic string by converting to lowercase, replacing non-alphanumeric characters,
 * and removing extra spaces
 * 
 * @param topic - The topic string to normalize
 * @returns - Normalized topic string
 */ export function normalizeTopic(topic) {
  if (!topic) return "";
  return topic.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}
/**
 * Checks if a topic appears to be gibberish based on patterns
 * 
 * @param topic - The topic to check
 * @returns - Boolean indicating if the topic appears to be gibberish
 */ function isGibberish(topic) {
  // Pattern for repeated characters (aaa) or repeated patterns (hahaha)
  const repeatedPattern = /([a-z])\1{2,}|([a-z]{1,2})(\2){2,}/i;
  // NOTE: Removed the 'noVowelsPattern' check to avoid false positives for technical topics like 'JDBC Connectivity', 'Cryptography', etc.
  return repeatedPattern.test(topic);
}
/**
 * Performs basic validation checks without API calls
 * 
 * @param topic - The topic to validate
 * @returns - Validation result or null if basic checks pass
 */ function performBasicValidation(topic) {
  const cleanedTopic = topic?.trim() || "";
  // Check for minimum length
  if (cleanedTopic.length < CONFIG.minTopicLength) {
    return {
      isValid: false,
      reason: MESSAGES.tooShort,
      suggestedTopic: null
    };
  }
  // Check for common test inputs or gibberish
  if (CONFIG.invalidExamples.has(cleanedTopic.toLowerCase())) {
    return {
      isValid: false,
      reason: MESSAGES.testWord,
      suggestedTopic: null
    };
  }
  // Check for gibberish patterns
  if (isGibberish(cleanedTopic)) {
    return {
      isValid: false,
      reason: MESSAGES.gibberish,
      suggestedTopic: getRandomSuggestion()
    };
  }
  // All basic checks passed
  return null;
}
/**
 * Returns a random topic suggestion from the configured list
 */ function getRandomSuggestion() {
  const suggestions = CONFIG.defaultSuggestions;
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}
/**
 * Validates a topic using AI (via OpenRouter API)
 * 
 * @param topic - The topic to validate
 * @returns - ValidationResult object
 */ export async function validateTopic(topic) {
  // Early return for empty topics
  if (!topic) {
    return {
      isValid: false,
      reason: MESSAGES.tooShort,
      suggestedTopic: null
    };
  }
  // Perform basic validation first to avoid unnecessary API calls
  const basicValidation = performBasicValidation(topic);
  if (basicValidation) {
    return basicValidation;
  }
  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterKey) {
    console.log("🔑 OPENROUTER_API_KEY not found, skipping validation");
    return {
      isValid: true,
      reason: MESSAGES.noApiKey,
      suggestedTopic: null
    };
  }
  // Create a controller to handle timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.validationTimeout);
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": Deno.env.get("APP_URL") || "http://localhost",
        "X-Title": "Story Generator App"
      },
      body: JSON.stringify({
        //old version= mistralai/mistral-small-3.1-24b-instruct
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are an assistant validating user input for a story generator app. Provide concise responses in the requested JSON format."
          },
          {
            role: "user",
            content: `Please check if this topic is suitable for generating a story:
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
}`
          }
        ],
        temperature: 0.2,
        max_tokens: 300
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    // Parse JSON response, handling potential formatting issues
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        // Ensure the response has all required fields
        return {
          isValid: Boolean(parsedResult.isValid),
          reason: parsedResult.reason || "No reason provided",
          suggestedTopic: parsedResult.suggestedTopic || null
        };
      } else {
        console.warn("⚠️ No JSON found in API response");
        return {
          isValid: true,
          reason: MESSAGES.noJsonFound,
          suggestedTopic: null
        };
      }
    } catch (jsonError) {
      console.error("❌ Error parsing JSON from API response:", jsonError);
      return {
        isValid: true,
        reason: MESSAGES.noJsonFound,
        suggestedTopic: null
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    // Handle timeout errors specifically
    if (err.name === "AbortError") {
      console.error("❌ Validation API request timed out");
      return {
        isValid: true,
        reason: "Validation timed out, defaulting to valid",
        suggestedTopic: null
      };
    }
    console.error("❌ Validation API error:", err);
    return {
      isValid: true,
      reason: MESSAGES.apiError,
      suggestedTopic: null
    };
  }
}
/**
 * Creates a response for invalid topics
 * 
 * @param topic - The original topic
 * @param reason - Reason for invalidation
 * @param suggestedTopic - Suggested alternative topic
 * @returns - Response object
 */ export function createInvalidTopicResponse(topic, reason, suggestedTopic) {
  // Determine appropriate suggestion text
  const finalSuggestedTopic = suggestedTopic || (reason.includes("gibberish") ? getRandomSuggestion() : null);
  const suggestionText = finalSuggestedTopic ? `\n\nAap chaahe to "${finalSuggestedTopic}" ke baare mein puch sakte hai, Yeh ek better topic ho sakta hai.` : "";
  const responseBody = {
    title: "Oops! Topic Thoda Confusing Hai",
    content: `Aapne jo topic diya wo samajhne mein thoda mushkil ho raha hai.\n\nReason: ${reason}${suggestionText}\n\nKya aap ise thoda aur clearly likh sakte hain?`,
    takeaway: "Ek specific aur meaningful topic dein jise story mein samjhaya ja sake.",
    emotions: [
      "confused",
      "curious"
    ],
    topic,
    suggestedTopic: finalSuggestedTopic
  };
  return new Response(JSON.stringify(responseBody), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    },
    status: 200 // We use 200 status so the frontend can handle the display
  });
}
/**
 * Utility function to create a cache key from a topic
 * 
 * @param topic - The topic to create a cache key for
 * @returns - Normalized cache key
 */ export function createCacheKey(topic) {
  return normalizeTopic(topic);
}
