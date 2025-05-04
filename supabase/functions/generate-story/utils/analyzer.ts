
// Default fallback values in case OpenRouter API doesn't respond or parse correctly
const defaultAnalysis = {
  emotions: [
    "curious",
    "interested"
  ],
  category: "general",
  characteristics: [
    "informative",
    "educational",
    "engaging"
  ]
};
// Function to analyze topic and extract potential emotions
export async function analyzeTopicEmotions(topic) {
  const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterApiKey) {
    console.warn("OPENROUTER_API_KEY not found, returning default analysis");
    return defaultAnalysis;
  }
  try {
    const prompt = `
    Analyze this topic: "${topic}"

    Identify:
    1. The general category it falls into (e.g., "technology", "science", "arts", "business")
    2. 3-5 emotions that someone might feel when learning about this topic
    3. 3 key characteristics of this topic

    Output ONLY JSON in this exact format:
    {
      "category": "category name",
      "emotions": ["emotion1", "emotion2", "emotion3"],
      "characteristics": ["characteristic1", "characteristic2", "characteristic3"]
    }
    `;
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.story-tales-teach.me/",
          "X-Title": "Story Tales Teach"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "system",
              content: "You are an educational assistant that analyzes topics to extract educationally useful emotional and categorical metadata."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: {
            type: "json_object"
          },
          temperature: 0.3,
          max_tokens: 300
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (!data.choices || data.choices.length === 0) {
        console.warn("OpenRouter API returned no choices, using default");
        return defaultAnalysis;
      }
      const text = data.choices[0].message.content;
      
      // Try direct parsing first
      try {
        return JSON.parse(text);
      } catch (err) {
        // If direct parsing fails, try to extract JSON with regex
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed;
          } catch (parseErr) {
            console.error("JSON parsing failed, falling back to default", parseErr);
            return defaultAnalysis;
          }
        } else {
          console.warn("No JSON structure found in response, using default");
          return defaultAnalysis;
        }
      }
    } catch (fetchError) {
      if (fetchError.name === "AbortError") {
        console.warn("OpenRouter API call timed out, using default");
        return defaultAnalysis;
      }
      console.error("OpenRouter API call failed, using default", fetchError);
      return defaultAnalysis;
    }
  } catch (err) {
    console.error("OpenRouter API call failed, using default", err);
    return defaultAnalysis;
  }
}
