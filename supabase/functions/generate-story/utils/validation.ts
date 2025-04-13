
import { corsHeaders } from "./cors.ts";

// Helper for validating topics with Gemini
export async function validateTopic(topic: string) {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY not found in environment");
    return { isValid: true, reason: "Skipping validation, API key not found" }; // Default to valid if API key is missing
  }

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + geminiApiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are validating user input for a learning story generator app.
            
            Analyze this topic: "${topic}"
            
            Check if it's:
            1. A real concept that can be explained
            2. Not offensive or harmful
            3. Not complete gibberish
            4. Not purely random characters
            
            Output ONLY JSON in this exact format:
            {
              "isValid": boolean,
              "reason": "short explanation if invalid or 'valid topic' if valid"
            }`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in Gemini validation response", data);
      return { isValid: true, reason: "Validation error, defaulting to valid" };
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      // Extract JSON from response (handling cases where there might be markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return { isValid: true, reason: "JSON parsing failed, defaulting to valid" };
      }
    } catch (e) {
      console.error("Error parsing validation JSON", e);
      return { isValid: true, reason: "JSON parse error, defaulting to valid" };
    }
  } catch (error) {
    console.error("Error calling Gemini validation API", error);
    return { isValid: true, reason: "API error, defaulting to valid" };
  }
}

// Create invalid topic response
export function createInvalidTopicResponse(topic: string, reason: string) {
  return new Response(
    JSON.stringify({
      title: "Thoda Confusion Hai",
      content: `Yeh topic thoda ajeeb lag raha hai: ${reason}\n\nKya aap koi aur topic try karna chahenge? Ya ise thoda aur clearly explain kar sakte hain?`,
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
