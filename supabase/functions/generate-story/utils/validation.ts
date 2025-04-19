import { corsHeaders } from "./cors.ts";

// Helper for validating topics with OpenRouter using Mixtral model
export async function validateTopic(topic: string) {
  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterKey) {
    console.log("OPENROUTER_API_KEY not found, skipping validation");
    return { isValid: true, reason: "Skipping validation" };
  }

  if (!topic || topic.trim().length < 2) {
    return { isValid: false, reason: "Topic is too short" };
  }

  const sanitizedTopic = topic.trim().toLowerCase();
  const invalidExamples = ["a", "test", "hi", "hello"];
  if (invalidExamples.includes(sanitizedTopic)) {
    return { isValid: false, reason: "Please provide a real topic, not just a test word" };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an assistant validating user input for a learning story generator app.",
          },
          {
            role: "user",
            content: `Analyze this topic: "${topic}"

Check if it's:
1. A real concept that can be explained
2. Not offensive or harmful
3. Not complete gibberish
4. Not purely random characters
5. Not too vague or ambiguous
6. A topic that can be taught or explained

Output ONLY JSON in this exact format:
{
  "isValid": boolean,
  "reason": "short explanation if invalid or 'valid topic' if valid",
  "suggestedTopic": "if the topic is not valid but is close to something valid, suggest a similar valid topic otherwise null"
}`
          }
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    const rawText = data.choices?.[0]?.message?.content || "";

    // Try to extract JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      return { isValid: true, reason: "Defaulting to valid (no JSON found)" };
    }
  } catch (err) {
    console.error("Validation error:", err);
    return { isValid: true, reason: "API error, defaulting to valid" };
  }
}

// Create invalid topic response
export function createInvalidTopicResponse(topic: string, reason: string, suggestedTopic?: string) {
  const suggestionText = suggestedTopic 
    ? `\n\nKya aap "${suggestedTopic}" ke bare mein jaanna chahenge? Yeh ek behtar topic ho sakta hai.` 
    : '';
    
  return new Response(
    JSON.stringify({
      title: "Thoda Confusion Hai",
      content: `Yeh topic "${topic}" thoda ajeeb lag raha hai: ${reason}\n\nKya aap koi aur topic try karna chahenge? Ya ise thoda aur clearly explain kar sakte hain?${suggestionText}`,
      takeaway: "Kripya ek specific aur clear topic dein jiske baare mein aap jaanna chahte hain.",
      emotions: ["confused", "curious"],
      topic: topic
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}
