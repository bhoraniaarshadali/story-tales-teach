
import { analyzeTopicEmotions } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";
import { corsHeaders } from "./utils/cors.ts";

// Function to generate a story using Gemini API
export async function generateStoryWithGemini(topic: string) {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY not found in environment");
  }
  
  // First analyze the topic to get emotions and category
  const topicAnalysis = await analyzeTopicEmotions(topic);
  console.log("Topic analysis:", JSON.stringify(topicAnalysis));
  
  // Generate a character that fits the topic
  const character = generateCharacter(topic, topicAnalysis.category);

  // Create a more focused and specific prompt for Gemini that forces explaining the actual topic
  const prompt = `
  CRITICAL INSTRUCTION: You MUST create an educational story SPECIFICALLY about "${topic}". 
  The entire story MUST be explaining the ACTUAL CONCEPT of "${topic}" in detail, not just mentioning the word.
  
  IMPORTANT: DO NOT create a generic story about learning. Create a story that explains what ${topic} actually is, 
  its key concepts, how it works, and real applications.
  
  Kisi ek character ke through ek interesting aur relatable kahani banao jisme wo "${topic}" ko samajhne ki koshish kar raha ho.
  
  Character ka naam "${character.name}" hai, aur woh ${character.traits} hai.
  
  Character ke emotions mein ye shamil hain: ${topicAnalysis.emotions.join(", ")}
  
  Topic "${topic}" ke core concepts ko step-by-step explain karo real-life examples, technical details, aur daily life 
  situations ke through. Kahani engaging ho, funny ho sakti hai, lekin topic "${topic}" ka actual meaning, working mechanism, 
  aur applications zaroor clear karna hai.
  
  For example, if the topic is blockchain, explain how blocks are linked, what cryptography is used, how consensus works, 
  what a distributed ledger is, etc.
  
  Language simple Hindi-English mix (Hinglish) ho, jisme thoda casual touch ho jaise doston ke beech baat hoti hai.
  
  JSON format me output do:
  {
    "title": "Catchy title in Hinglish related directly to ${topic}",
    "content": "The full story with proper paragraph breaks (use \\n\\n for paragraphs) explaining what ${topic} actually is",
    "takeaway": "A summary of what was learned about ${topic} in 3-4 lines",
    "emotions": ${JSON.stringify(topicAnalysis.emotions)},
    "keyPoints": ["key technical point 1 about ${topic}", "key technical point 2 about ${topic}", "key technical point 3 about ${topic}"]
  }`;

  try {
    console.log(`Sending prompt to Gemini for topic: ${topic}`);
    
    // Call the Gemini API to generate content
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + geminiApiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    // Parse the response
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No response from Gemini API");
      throw new Error("No response from Gemini API");
    }

    const text = data.candidates[0].content.parts[0].text;
    console.log("Received response from Gemini, extracting JSON");
    
    try {
      // Extract JSON from the response (handle cases with markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const storyJson = jsonMatch[0];
        // Validate the story to make sure it's about the requested topic
        const story = JSON.parse(storyJson);
        
        // Enhanced validation to catch mismatched stories
        if (!storyContainsTopic(story, topic)) {
          console.error("Generated story doesn't properly explain the requested topic");
          throw new Error(`Generated story doesn't properly explain ${topic}`);
        }
        
        return {
          ...story,
          character: {
            name: character.name,
            emoji: character.emoji,
            traits: character.traits
          },
          topic: topic // Explicitly include the topic in the response
        };
      } else {
        console.error("Could not extract JSON from Gemini response");
        throw new Error("Could not extract JSON from Gemini response");
      }
    } catch (jsonError) {
      console.error("JSON parsing error", jsonError);
      throw new Error("Failed to parse story from Gemini API");
    }
  } catch (error) {
    console.error("Error generating story with Gemini:", error);
    throw error;
  }
}

// Enhanced validation that the story actually explains the requested topic
function storyContainsTopic(story: any, topic: string): boolean {
  const topicLowerCase = topic.toLowerCase();
  
  // Check various aspects of the story
  const titleContainsTopic = story.title?.toLowerCase().includes(topicLowerCase);
  const contentContainsTopic = story.content?.toLowerCase().includes(topicLowerCase);
  const takeawayContainsTopic = story.takeaway?.toLowerCase().includes(topicLowerCase);
  const keyPointsContainTopic = story.keyPoints?.some((point: string) => 
    point.toLowerCase().includes(topicLowerCase)
  );
  
  // Count how many sections contain the topic
  const countSectionsWithTopic = [
    titleContainsTopic,
    contentContainsTopic,
    takeawayContainsTopic,
    keyPointsContainTopic
  ].filter(Boolean).length;
  
  // The story must mention the topic in at least 3 sections 
  // AND must have at least 200 characters to be considered valid
  return countSectionsWithTopic >= 3 && story.content.length >= 200;
}
