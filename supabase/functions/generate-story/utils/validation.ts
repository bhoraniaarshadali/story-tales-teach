import { corsHeaders } from "./cors.ts";
// Smart topic validator using Mixtral
export async function validateTopic(topic) {
  console.log("function called");
  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterKey) {
    console.log("🔑 OPENROUTER_API_KEY not found, skipping validation");
    return {
      isValid: true,
      reason: "Skipping validation (no key found)"
    };
  }
  const cleanedTopic = topic?.trim();
  if (!cleanedTopic || cleanedTopic.length < 3) {
    return {
      isValid: false,
      reason: "Topic bahut chhota hai",
      suggestedTopic: null
    };
  }
  // Check for common test inputs or gibberish
  const invalidExamples = [
    "a",
    "test",
    "hi",
    "hello",
    "xyz",
    "abc",
    "123"
  ];
  if (invalidExamples.includes(cleanedTopic.toLowerCase())) {
    return {
      isValid: false,
      reason: "Topic sirf test word lag raha hai",
      suggestedTopic: null
    };
  }
  // Detect gibberish by checking for patterns like repeated characters
  const gibberishPattern = /([a-z])\1{2,}|([a-z]{1,2})(\2){2,}/i;
  if (gibberishPattern.test(cleanedTopic)) {
    return {
      isValid: false,
      reason: "Yeh topic gibberish lag raha hai",
      suggestedTopic: "artificial intelligence" // Default suggestion for gibberish input
    };
  }
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "system",
            content: "You are an assistant validating user input for an educational story generator app."
          },
          {
            role: "user",
            content: `Please check if this topic is suitable for generating an educational story:\n"${cleanedTopic}"\n\nValidation Checklist:\n- It should be an explainable concept\n- Not offensive, harmful, or illegal\n- Not gibberish or random\n- Not too vague (like just one word)\n- Casual or question-style phrasing is OK\n\nRespond in EXACT JSON format:\n{\n  "isValid": boolean,\n  "reason": "brief explanation",\n  "suggestedTopic": "alternate if invalid, else null"\n}`
          }
        ],
        temperature: 0.2,
        max_tokens: 300
      })
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      return {
        isValid: true,
        reason: "No JSON found, assuming valid",
        suggestedTopic: null
      };
    }
  } catch (err) {
    console.error("❌ Validation API error:", err);
    return {
      isValid: true,
      reason: "Validation API failed, defaulting to valid",
      suggestedTopic: null
    };
  }
}
// Return custom response if topic is invalid
export function createInvalidTopicResponse(topic, reason, suggestedTopic) {
  const suggestionText = suggestedTopic ? `\nAap chaahe to "${suggestedTopic}" ke baare mein puch sakte hai, Yeh ek better topic ho sakta hai.` : "";
  const randomSuggestions = [
    "artificial intelligence",
    "cloud computing",
    "data science",
    "clean energy",
    "emotional intelligence"
  ];
  // If no suggestion was provided but we have a gibberish input, provide a random one
  const finalSuggestedTopic = suggestedTopic || (reason.includes("gibberish") ? randomSuggestions[Math.floor(Math.random() * randomSuggestions.length)] : null);
  return new Response(JSON.stringify({
    title: "Oops! Topic Thoda Confusing Hai",
    content: `Aapne jo topic diya: "${topic}", wo samajhne mein thoda mushkil ho raha hai.\n\nReason: ${reason}${suggestionText}\n\nKya aap ise thoda aur clearly likh sakte hain?`,
    takeaway: "Ek specific aur meaningful topic dein jise story mein samjhaya ja sake.",
    emotions: [
      "confused",
      "curious"
    ],
    topic,
    suggestedTopic: finalSuggestedTopic
  }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    },
    status: 200 // We use 200 status so the frontend can handle the display
  });
}
export function normalizeTopic(topic) {
  return topic.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}
