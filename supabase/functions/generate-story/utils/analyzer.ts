import { getModelConfig } from './modelConfig.ts';
// Default fallback values in case API doesn't respond or parse correctly
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
    let retries = 0;
    let response;
    let data;
    let success = false;
    while (retries < modelConfig.maxRetries && !success) {
      try {
        console.log(`Analysis attempt ${retries + 1} for topic "${topic}"`);
        response = await fetch(modelConfig.apiEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.story-tales-teach.me/",
            "X-Title": "Story Tales Teach"
          },
          body: JSON.stringify({
            model: retries >= modelConfig.maxRetries - 1 && modelConfig.fallbackModel ? modelConfig.fallbackModel : modelConfig.model,
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
            response_format: modelConfig.response_format,
            temperature: modelConfig.temperature,
            max_tokens: modelConfig.max_tokens
          })
        });
        data = await response.json();
        if (!data.choices || data.choices.length === 0) {
          console.warn(`API returned no choices on attempt ${retries + 1}, retrying...`);
          retries++;
          continue;
        }
        const text = data.choices[0].message.content;
        console.log(`Raw analysis response: ${text.substring(0, 150)}...`);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            success = true;
            return parsed;
          } catch (err) {
            console.error(`JSON parsing failed on attempt ${retries + 1}:`, err.message);
            console.error(`Failed JSON content: ${jsonMatch[0].substring(0, 200)}`);
            retries++;
          }
        } else {
          console.warn(`No JSON structure found in response on attempt ${retries + 1}, retrying...`);
          retries++;
        }
      } catch (requestError) {
        console.error(`API request failed on attempt ${retries + 1}:`, requestError);
        retries++;
      }
      // Add a small delay between retries
      if (retries < modelConfig.maxRetries && !success) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    if (retries >= modelConfig.maxRetries) {
      console.warn(`All ${modelConfig.maxRetries} analysis attempts failed, using default analysis`);
    }
    return defaultAnalysis;
  } catch (err) {
    console.error("Analysis process failed completely:", err);
    return defaultAnalysis;
  }
}
