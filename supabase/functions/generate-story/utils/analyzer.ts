import { getModelConfig } from './modelConfig.ts';

const defaultAnalysis = {
  emotions: ["curious", "interested"],
  category: "general",
  characteristics: ["informative", "educational", "engaging"]
};

export async function analyzeTopicEmotions(topic: string) {
  const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!googleApiKey) {
    console.warn("GOOGLE_API_KEY not found, returning default analysis");
    return defaultAnalysis;
  }

  try {
    const modelConfig = getModelConfig('analysis');
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

    const currentModel = modelConfig.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${googleApiKey}`;

    console.log(`Analysis attempt for topic "${topic}" using ${currentModel}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `You are an educational assistant that analyzes topics.\n\n${prompt}` }] }
        ],
        generationConfig: {
          temperature: modelConfig.temperature,
          topP: modelConfig.top_p,
          maxOutputTokens: modelConfig.max_tokens,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      console.warn(`Gemini API error for analysis: ${response.status}`);
      return defaultAnalysis;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log(`Raw analysis response: ${text.substring(0, 150)}...`);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error("JSON parsing failed for analysis:", err.message);
      }
    } else {
      console.warn("⚠️ No JSON found in API response");
    }

    return defaultAnalysis;
  } catch (err) {
    console.error("Analysis process failed:", err);
    return defaultAnalysis;
  }
}
