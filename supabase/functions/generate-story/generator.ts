import { analyzeTopicEmotions } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";
import { corsHeaders } from "./utils/cors.ts";

export async function generateStoryWithGemini(topic: string) {
  // Enhanced API key validation
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    console.error("❌ CRITICAL: Gemini API key is missing!");
    throw new Error("Gemini API key is not configured. Please add the key in Supabase secrets.");
  }
  
  try {
    // First analyze the topic to get emotions and category
    const topicAnalysis = await analyzeTopicEmotions(topic);
    console.log("📊 Topic Analysis:", JSON.stringify(topicAnalysis));
    
    // Generate a character that fits the topic
    const character = generateCharacter(topic, topicAnalysis.category);

    // Create a more focused and specific prompt for Gemini that forces explaining the actual topic
    const prompt = `
    CRITICAL INSTRUCTION: You MUST create an educational story SPECIFICALLY about "${topic}". 
    The entire story MUST explain the ACTUAL CONCEPT of "${topic}" in detail.
    
    Character: ${character.name}, who is ${character.traits}
    
    Emotions to incorporate: ${topicAnalysis.emotions.join(", ")}
    
    Create a story in Hinglish that:
    - Explains the core concepts of "${topic}"
    - Uses real-life examples
    - Is engaging and educational
    
    Output MUST be in JSON format with:
    - title (in Hinglish)
    - content (story explaining the topic)
    - takeaway (key learnings)
    - emotions
    - keyPoints (technical/core points)
    `;

    console.log("🚀 Sending prompt to Gemini API for topic:", topic);
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + geminiApiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error("❌ No response from Gemini API");
      throw new Error("No valid response from Gemini API");
    }

    const text = data.candidates[0].content.parts[0].text;
    console.log("📝 Received response from Gemini");
    
    // JSON extraction with more robust parsing
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ Could not extract JSON from response");
      throw new Error("Invalid response format from Gemini");
    }

    const storyJson = JSON.parse(jsonMatch[0]);
    
    return {
      ...storyJson,
      character: {
        name: character.name,
        emoji: character.emoji,
        traits: character.traits
      },
      topic: topic
    };
  } catch (error) {
    console.error("🔥 Story Generation Error:", error);
    throw error;
  }
}

// Enhanced validation that the story actually explains the requested topic
function storyContainsTopic(story: any, topic: string): boolean {
  const topicLowerCase = topic.toLowerCase();
  
  const sectionsWithTopic = [
    story.title?.toLowerCase().includes(topicLowerCase),
    story.content?.toLowerCase().includes(topicLowerCase),
    story.takeaway?.toLowerCase().includes(topicLowerCase),
    story.keyPoints?.some((point: string) => point.toLowerCase().includes(topicLowerCase))
  ].filter(Boolean).length;
  
  return sectionsWithTopic >= 3 && story.content.length >= 200;
}
