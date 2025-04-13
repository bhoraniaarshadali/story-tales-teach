
// Function to analyze topic and extract potential emotions
export async function analyzeTopicEmotions(topic: string) {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY not found for emotion analysis");
    return { emotions: ["curious", "interested"], category: "general" };
  }
  
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + geminiApiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this topic: "${topic}"
            
            Identify:
            1. The general category it falls into (e.g., "technology", "science", "arts", "business")
            2. 3-5 emotions that someone might feel when learning about this topic
            3. 3 key characteristics of this topic
            
            Output ONLY JSON in this exact format:
            {
              "category": "category name",
              "emotions": ["emotion1", "emotion2", "emotion3"],
              "characteristics": ["characteristic1", "characteristic2", "characteristic3"]
            }`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        }
      })
    });
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in topic analysis response");
      return { emotions: ["curious", "interested"], category: "general" };
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return { emotions: ["curious", "interested"], category: "general" };
      }
    } catch (e) {
      console.error("Error parsing emotion analysis JSON", e);
      return { emotions: ["curious", "interested"], category: "general" };
    }
  } catch (error) {
    console.error("Error analyzing topic emotions:", error);
    return { emotions: ["curious", "interested"], category: "general" };
  }
}
