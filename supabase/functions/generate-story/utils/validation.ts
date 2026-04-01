import { corsHeaders } from "./cors.ts";

const CONFIG = {
  minTopicLength: 3,
  defaultSuggestions: [
    "artificial intelligence", "cloud computing", "data science",
    "clean energy", "emotional intelligence", "digital marketing"
  ],
  invalidExamples: new Set([
    "a", "an", "the", "test", "hi", "hello", "xyz", "abc", "123",
    "aaa", "bbb", "testing", "asdf", "qwerty", "check"
  ])
};

function isGibberish(topic: string) {
  return /([a-z])\1{2,}|([a-z]{1,2})(\2){2,}/i.test(topic);
}

function getRandomSuggestion() {
  return CONFIG.defaultSuggestions[Math.floor(Math.random() * CONFIG.defaultSuggestions.length)];
}

function performBasicValidation(topic: string) {
  const cleaned = topic?.trim() || "";
  if (cleaned.length < CONFIG.minTopicLength) {
    return { isValid: false, reason: "Topic bahut chhota hai", suggestedTopic: null };
  }
  if (CONFIG.invalidExamples.has(cleaned.toLowerCase())) {
    return { isValid: false, reason: "Topic sirf test word lag raha hai", suggestedTopic: null };
  }
  if (isGibberish(cleaned)) {
    return { isValid: false, reason: "Yeh topic gibberish lag raha hai", suggestedTopic: getRandomSuggestion() };
  }
  return null;
}

export function normalizeTopic(topic: string) {
  if (!topic) return "";
  return topic.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

export async function validateTopic(topic: string) {
  if (!topic) {
    return { isValid: false, reason: "Topic missing", suggestedTopic: null };
  }

  const basicValidation = performBasicValidation(topic);
  if (basicValidation) return basicValidation;

  // Basic validation passed — no AI call needed for validation
  return { isValid: true, reason: "Valid topic", suggestedTopic: null };
}

export function createInvalidTopicResponse(topic: string, reason: string, suggestedTopic: string | null) {
  const finalSuggestion = suggestedTopic || (reason.includes("gibberish") ? getRandomSuggestion() : null);
  const suggestionText = finalSuggestion
    ? `\n\nAap chaahe to "${finalSuggestion}" ke baare mein puch sakte hai.`
    : "";

  return new Response(JSON.stringify({
    title: "Oops! Topic Thoda Confusing Hai",
    content: `Aapne jo topic diya wo samajhne mein mushkil ho raha hai.\n\nReason: ${reason}${suggestionText}`,
    takeaway: "Ek specific aur meaningful topic dein jise story mein samjhaya ja sake.",
    emotions: ["confused", "curious"],
    topic,
    suggestedTopic: finalSuggestion
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200
  });
}

export function createCacheKey(topic: string) {
  return normalizeTopic(topic);
}
