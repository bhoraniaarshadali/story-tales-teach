// utils/analyzer.ts

// Default fallback values in case OpenRouter API doesn't respond or parse correctly
const defaultAnalysis = {
  emotions: ["curious", "interested"],
  category: "general",
  characteristics: ["informative", "educational", "engaging"]
};

// Function to analyze topic and extract potential emotions
export async function analyzeTopicEmotions(topic: string) {
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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://storytalesteach.lovable.app",
        "X-Title": "Story Tales Teach"
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct",
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
      })
    });

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      console.warn("OpenRouter API returned no choices, using default");
      return defaultAnalysis;
    }

    const text = data.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      } catch (err) {
        console.error("JSON parsing failed, falling back to default", err);
        return defaultAnalysis;
      }
    } else {
      console.warn("No JSON structure found in response, using default");
      return defaultAnalysis;
    }
  } catch (err) {
    console.error("OpenRouter API call failed, using default", err);
    return defaultAnalysis;
  }
}
