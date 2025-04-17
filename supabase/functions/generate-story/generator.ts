
import { analyzeTopicEmotions } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";
import { corsHeaders } from "./utils/cors.ts";

export async function generateStoryWithGemini(topic: string) {
  // Enhanced API key validation
  const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterApiKey) {
    console.error("❌ CRITICAL: OpenRouter API key is missing!");
    throw new Error("OpenRouter API key is not configured. Please add the key in Supabase secrets.");
  }
  
  try {
    // First analyze the topic to get emotions and category
    const topicAnalysis = await analyzeTopicEmotions(topic);
    console.log("📊 Topic Analysis:", JSON.stringify(topicAnalysis));
    
    // Generate a character that fits the topic
    const character = generateCharacter(topic, topicAnalysis.category);

    // Create a more focused and specific prompt for Mixtral
    const prompt = `
    CRITICAL INSTRUCTION: You MUST create an educational story SPECIFICALLY about "${topic}". 
    The entire story MUST explain the ACTUAL CONCEPT of "${topic}" in detail.
    
    Character: ${character.name}, who is ${character.traits}
    
    Emotions to incorporate: ${topicAnalysis.emotions.join(", ")}
    
    Create a story in Hinglish that:
    - Explains the core concepts of "${topic}"
    - Uses real-life examples
    - Is engaging and educational
    
    Output MUST be a valid JSON with:
    - title (in Hinglish)
    - content (story explaining the topic)
    - takeaway (key learnings)
    - emotions
    - keyPoints (technical/core points)
    `;

    console.log("🚀 Sending prompt to OpenRouter API for topic:", topic);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://storytalesteach.lovable.app", // Optional: helps track usage
        "X-Title": "Story Tales Teach"
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          { role: "system", content: "You are an educational storyteller creating Hinglish stories that explain complex topics." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("❌ No response from OpenRouter API");
      throw new Error("No valid response from OpenRouter API");
    }

    const text = data.choices[0].message.content;
    console.log("📝 Received response from Mixtral");
    
    try {
      const storyJson = JSON.parse(text);
      
      // Validate story contains the topic
      if (!storyContainsTopic(storyJson, topic)) {
        console.error(`❌ Generated story does not explain "${topic}" sufficiently`);
        throw new Error(`Story does not adequately explain the topic: ${topic}`);
      }
      
      return {
        ...storyJson,
        character: {
          name: character.name,
          emoji: character.emoji,
          traits: character.traits
        },
        topic: topic
      };
    } catch (parseError) {
      console.error("❌ JSON Parsing Error:", parseError);
      console.error("Raw Text:", text);
      throw new Error("Could not parse story JSON");
    }
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

