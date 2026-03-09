import { getModelConfig } from './modelConfig.ts';

const defaultAnalysis = {
  emotions: ["curious", "interested"],
  category: "general",
  characteristics: ["informative", "educational", "engaging"]
};

export async function analyzeTopicEmotions(topic: string) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    console.warn("LOVABLE_API_KEY not found, returning default analysis");
    return defaultAnalysis;
  }

  try {
    const modelConfig = getModelConfig('analysis');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are an educational assistant. Respond in JSON only." },
          { role: "user", content: `Analyze this topic: "${topic}"

Return JSON:
{
  "category": "category name",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "characteristics": ["characteristic1", "characteristic2", "characteristic3"]
}` }
        ],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.max_tokens,
      }),
    });

    if (!response.ok) {
      console.warn(`Analysis API error: ${response.status}`);
      return defaultAnalysis;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        console.error("JSON parsing failed for analysis");
      }
    }

    return defaultAnalysis;
  } catch (err) {
    console.error("Analysis failed:", err);
    return defaultAnalysis;
  }
}
