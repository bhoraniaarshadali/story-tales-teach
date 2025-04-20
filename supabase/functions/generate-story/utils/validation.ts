import { corsHeaders } from "./cors.ts";

// Smart topic validator using Mixtral
export async function validateTopic(topic: string) {
  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterKey) {
    console.log("🔑 OPENROUTER_API_KEY not found, skipping validation");
    return { isValid: true, reason: "Skipping validation (no key found)" };
  }

  const cleanedTopic = topic?.trim();

  if (!cleanedTopic || cleanedTopic.length < 3) {
    return {
      isValid: false,
      reason: "Topic bahut chhota hai ya blank hai",
      suggestedTopic: null,
    };
  }

  const invalidExamples = ["a", "test", "hi", "hello"];
  if (invalidExamples.includes(cleanedTopic.toLowerCase())) {
    return {
      isValid: false,
      reason: "Topic sirf test word lag raha hai",
      suggestedTopic: null,
    };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", //mistralai/mixtral-8x7b-instruct
        messages: [
          {
            role: "system",
            content: "You are an assistant validating user input for an educational story generator app.",
          },
          {
            role: "user",
            content: `Please check if this topic is suitable for generating an educational story:\n"${cleanedTopic}"\n\nValidation Checklist:\n- It should be an explainable concept\n- Not offensive, harmful, or illegal\n- Not gibberish or random\n- Not too vague (like just one word)\n- Casual or question-style phrasing is OK\n\nRespond in EXACT JSON format:\n{\n  "isValid": boolean,\n  "reason": "brief explanation",\n  "suggestedTopic": "alternate if invalid, else null"\n}`,
          }
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
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
        suggestedTopic: null,
      };
    }
  } catch (err) {
    console.error("❌ Validation API error:", err);
    return {
      isValid: true,
      reason: "Validation API failed, defaulting to valid",
      suggestedTopic: null,
    };
  }
}

// Return custom response if topic is invalid
export function createInvalidTopicResponse(topic: string, reason: string, suggestedTopic?: string) {
  const suggestionText = suggestedTopic
    ? `\n\nShayad aap "${suggestedTopic}" ke baare mein poochhna chaah rahe the? Yeh ek better topic ho sakta hai.`
    : "";

  return new Response(
    JSON.stringify({
      title: "Oops! Topic Thoda Confusing Hai",
      content: `Aapne jo topic diya: "${topic}", wo samajhne mein thoda mushkil ho raha hai.\n\nReason: ${reason}${suggestionText}\n\nKya aap ise thoda aur clearly likh sakte hain?`,
      takeaway: "Ek specific aur meaningful topic dein jise story mein samjhaya ja sake.",
      emotions: ["confused", "curious"],
      topic
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}
