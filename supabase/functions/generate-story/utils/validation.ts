
import { corsHeaders } from "./cors.ts";

// Helper for validating topics with Gemini
export async function validateTopic(topic: string) {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    console.log("GEMINI_API_KEY not found, skipping validation");
    return { isValid: true, reason: "Skipping validation" }; // Default to valid if API key is missing
  }

  // Basic validation first
  if (!topic || topic.trim().length < 2) {
    return { isValid: false, reason: "Topic is too short" };
  }

  const sanitizedTopic = topic.trim().toLowerCase();
  // Check for common invalid inputs
  if (
    sanitizedTopic === "a" || 
    sanitizedTopic === "test" || 
    sanitizedTopic === "hi" ||
    sanitizedTopic === "hello"
  ) {
    return { isValid: false, reason: "Please provide a real topic, not just a test word" };
  }

  try {
    console.log(`Validating topic: "${topic}"`);
    
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
            5. Not too vague or ambiguous
            6. A topic that can be taught or explained
            
            Output ONLY JSON in this exact format:
            {
              "isValid": boolean,
              "reason": "short explanation if invalid or 'valid topic' if valid",
              "suggestedTopic": "if the topic is not valid but is close to something valid, suggest a similar valid topic otherwise null"
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
    
    // Use default values instead of logging errors
    if (!data.candidates || data.candidates.length === 0) {
      return { isValid: true, reason: "Validation defaulting to valid" };
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      // Extract JSON from response (handling cases where there might be markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return { isValid: true, reason: "Defaulting to valid" };
      }
    } catch (e) {
      return { isValid: true, reason: "Defaulting to valid" };
    }
  } catch (error) {
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
