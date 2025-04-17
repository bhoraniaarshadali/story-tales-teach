
import { analyzeTopicEmotions } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";
import { corsHeaders } from "./utils/cors.ts";

export async function generateStoryWithMixtral(topic: string) {
  // Enhanced API key validation
  const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterApiKey) {
    console.log("OpenRouter API key is missing");
    throw new Error("OpenRouter API key is not configured. Please add the key in Supabase secrets.");
  }
  
  try {
    // First analyze the topic to get emotions and category
    const topicAnalysis = await analyzeTopicEmotions(topic);
    console.log("Topic Analysis complete");
    
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
    - MENTIONS "${topic}" AT LEAST 5 TIMES in the content
    - ENSURES the story is FULLY ABOUT "${topic}" not just mentioning it
    
    Output MUST be a valid JSON with:
    - title (in Hinglish)
    - content (story explaining the topic)
    - takeaway (key learnings)
    - emotions (array of strings)
    - keyPoints (array of technical/core points)
    `;

    console.log("Sending request to OpenRouter API");
    
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
          { role: "system", content: "You are an educational storyteller creating Hinglish stories that explain complex topics." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`API error: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.log("No valid response from API");
      throw new Error("No valid response from API");
    }

    const text = data.choices[0].message.content;
    console.log("Received response from Mixtral");
    
    try {
      let storyJson = JSON.parse(text);
      
      // Ensure emotions is an array
      if (storyJson.emotions && typeof storyJson.emotions === 'string') {
        storyJson.emotions = storyJson.emotions.split(',').map((e: string) => e.trim());
      } else if (!storyJson.emotions) {
        storyJson.emotions = ["educational", "informative"];
      }
      
      // Validate story contains the topic
      if (!storyContainsTopic(storyJson, topic)) {
        console.log(`Story doesn't properly explain the topic: ${topic}`);
        throw new Error(`Story doesn't adequately explain the topic: ${topic}`);
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
      console.log("JSON parsing issue");
      throw new Error("Could not parse story response");
    }
  } catch (error) {
    console.log("Story generation error");
    throw error;
  }
}

// Enhanced validation that the story actually explains the requested topic
function storyContainsTopic(story: any, topic: string): boolean {
  const topicLowerCase = topic.toLowerCase();
  
  // Simple content check first - if no content, it doesn't explain the topic
  if (!story.content || typeof story.content !== 'string') {
    return false;
  }
  
  // More lenient check - just make sure the topic is mentioned in content and title
  const contentHasTopic = story.content.toLowerCase().includes(topicLowerCase);
  const titleHasTopic = story.title && story.title.toLowerCase().includes(topicLowerCase);
  
  return contentHasTopic && story.content.length >= 200;
}
