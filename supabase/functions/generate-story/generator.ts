
import { analyzeTopicEmotions, personalizeContentForUser } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";

// Predefined fallback stories for when the API returns invalid data
const fallbackStories = {
  technology: {
    title: "Tech Tales: Understanding Technology Concepts",
    content: "Technology is constantly evolving around us. From smartphones to cloud computing, technology shapes how we work and communicate. Learning about technology helps us navigate our digital world better.\n\nIn the world of technology, concepts build upon each other like building blocks. Understanding the fundamentals makes advanced topics easier to grasp.\n\nMastering technology takes practice, but each small step forward opens new possibilities.",
    takeaway: "Technology may seem complex, but breaking it down into small concepts makes it accessible to everyone.",
    emotions: ["curious", "interested", "inspired"],
    keyPoints: ["Start with basic concepts", "Practice regularly", "Build on knowledge incrementally"]
  }
};

export async function generateStoryWithMixtral(topic, userPreferences = null) {
  const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterApiKey) {
    console.log("🔑 Missing API key");
    throw new Error("API key missing in environment");
  }
  try {
    // Enhanced topic analysis with BERT-like classification
    const topicAnalysis = await analyzeTopicEmotions(topic);
    console.log("✅ Topic analysis done", topicAnalysis);
    
    // Personalize content based on user preferences if available
    const personalizedAnalysis = await personalizeContentForUser(topic, userPreferences, topicAnalysis);
    console.log("✅ Personalization applied", personalizedAnalysis);
    
    // Generate character based on topic and personalized category
    const character = generateCharacter(topic, personalizedAnalysis.category);
    
    // Craft a more personalized prompt based on user preferences
    let readingLevelInstruction = "";
    if (personalizedAnalysis.readingLevel) {
      readingLevelInstruction = `Use a ${personalizedAnalysis.readingLevel} reading level that's suitable for ${personalizedAnalysis.recommendedAge}.`;
    }
    
    // Include related favorite topics if available
    let relatedTopicsInstruction = "";
    if (personalizedAnalysis.relatedFavoriteTopics && personalizedAnalysis.relatedFavoriteTopics.length > 0) {
      relatedTopicsInstruction = `Make connections to these related topics if possible: ${personalizedAnalysis.relatedFavoriteTopics.join(", ")}.`;
    }
    
    const prompt = `
CRITICAL INSTRUCTION: Return ONLY a clean JSON object parseable by JSON.parse(). Do NOT include markdown, backticks, explanations, or any text outside the JSON. Any deviation will break the system.

Generate a Hinglish story SPECIFICALLY about "${topic}" that:
- Explains "${topic}" in detail with clear examples
- Is educational and uses real-life scenarios
- Mentions "${topic}" EXACTLY as written at least 5 times in the content and once in the title
- Fully focuses on "${topic}"
${readingLevelInstruction}
${relatedTopicsInstruction}

Character: ${character.name}, who is ${character.traits}
Emotions: ${personalizedAnalysis.emotions.join(", ")}

Output JSON must include:
- title (must include "${topic}")
- content (must mention "${topic}" at least 5 times)
- takeaway (summarize importance of "${topic}")
- emotions (array of strings)
- keyPoints (array of strings, each mentioning "${topic}")
- readingLevel: "${personalizedAnalysis.readingLevel}"

Example format:
{
  "title": "${topic} Story",
  "content": "This is about ${topic}. ${topic} helps... ${topic} is used in...",
  "takeaway": "${topic} is important because...",
  "emotions": ["curious", "excited"],
  "keyPoints": ["${topic} is key for...", "${topic} enables..."],
  "readingLevel": "${personalizedAnalysis.readingLevel}"
}
`;
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://story-tales-teach.me/",
          "X-Title": "Story Tales Teach"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "system",
              content: "You are an educational Hinglish storyteller that outputs strictly valid JSON. Tailor your stories to the appropriate reading level."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: {
            type: "json_object"
          },
          temperature: 0.9,
          max_tokens: 1500
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const err = await response.text();
        console.log("❌ API error:", err);
        throw new Error("Failed to fetch from OpenRouter");
      }
      
      const data = await response.json();
      
      if (!data || !data.choices || !data.choices.length) {
        console.error("🚫 Empty response from API:", data);
        throw new Error("Empty response from API");
      }
      
      const text = data.choices[0]?.message?.content || "";
      console.log("📝 AI Model raw JSON output:\n", text);
      
      if (!text || text.trim() === "") {
        console.error("🚫 Empty content from API");
        throw new Error("Empty content from API");
      }
      
      // Enhanced JSON parsing with multiple fallback strategies
      const generatedStory = parseJsonWithFallbacks(text, topic, character);
      
      // Add personalization metadata
      generatedStory.personalized = !!userPreferences;
      generatedStory.readingLevel = personalizedAnalysis.readingLevel;
      generatedStory.recommendedAge = personalizedAnalysis.recommendedAge;
      
      return generatedStory;
    } catch (fetchError) {
      if (fetchError.name === "AbortError") {
        console.error("⏱️ OpenRouter API call timed out");
        throw new Error("API request timed out");
      }
      throw fetchError;
    }
  } catch (err) {
    console.log("🛑 Fatal error in story generation:", err.message);
    
    // Create a default story about the topic
    const defaultStory = createDefaultStory(topic);
    console.log("🔄 Using default story format");
    return defaultStory;
  }
}

// Enhanced JSON parsing with multiple fallback strategies
function parseJsonWithFallbacks(text, topic, character) {
  // Clean the output
  let clean = text.trim();
  
  // Try direct parsing first
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.log("❓ Direct JSON parsing failed, trying cleanup");
  }
  
  // Remove markdown code blocks
  clean = clean.replace(/```json\s+/g, "").replace(/```\s*/g, "");
  
  // Try parsing again
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.log("❓ Post-cleanup parsing failed, trying regex extraction");
  }
  
  // Try to extract JSON using regex
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const extracted = JSON.parse(jsonMatch[0]);
      console.log("✅ Successfully extracted JSON with regex");
      return extracted;
    } catch (err) {
      console.error("❌ Regex extraction failed:", err.message);
    }
  }
  
  console.error("🛑 All JSON parsing attempts failed for:", clean);
  
  // Return a default story as the last resort
  return createDefaultStory(topic, character);
}

// Function to create a default high-quality story about any topic
function createDefaultStory(topic, character = null) {
  // If no character was provided, create a default one
  const defaultCharacter = character || {
    name: "Professor Wisdom",
    emoji: "🧠",
    traits: "knowledgeable and friendly"
  };
  
  // Generate a title with the topic
  const title = `Learning About ${topic}: A Simple Guide`;
  
  // Generate content that references the topic multiple times
  const content = `
Let me tell you about ${topic}! ${topic} is an important concept that many people find interesting.

When we first learn about ${topic}, we might find it confusing. But with practice and exploration, ${topic} becomes easier to understand.

The beauty of ${topic} is how it connects to our daily lives. We can see examples of ${topic} all around us if we look carefully.

Understanding ${topic} helps us make better decisions and solve problems more effectively. That's why learning about ${topic} is so valuable!
  `.trim();
  
  // Generate a meaningful takeaway
  const takeaway = `${topic} might seem complex at first, but breaking it down into smaller concepts makes it easier to understand and apply in real life.`;
  
  // Create key points that mention the topic
  const keyPoints = [
    `${topic} provides valuable skills for problem-solving`,
    `Regular practice helps master ${topic} concepts`,
    `${topic} connects to many other important areas of knowledge`,
    `Understanding ${topic} can improve daily decision making`
  ];
  
  return {
    title,
    content,
    takeaway,
    character: defaultCharacter,
    emotions: ["curious", "interested", "educational"],
    keyPoints,
    topic,
    readingLevel: "intermediate",
    recommendedAge: "all-ages"
  };
}

// Normalize topic for flexible matching
function normalizeTopic(topic) {
  return topic.toLowerCase().replace(/[^a-z0-9]/g, " ") // Remove special characters
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

function storyContainsTopic(story, topic) {
  const normalizedTopic = normalizeTopic(topic);
  const topicWords = normalizedTopic.split(" "); // Split into words
  const content = story.content?.toLowerCase() || "";
  const title = story.title?.toLowerCase() || "";
  // Check if any topic word or the full topic is present
  const contentMatch = topicWords.some((word) => content.includes(word)) || content.includes(normalizedTopic);
  const titleMatch = topicWords.some((word) => title.includes(word)) || title.includes(normalizedTopic);
  const isValid = contentMatch && titleMatch && content.length > 30;
  if (!isValid) {
    console.log("Validation details:", {
      contentMatch,
      titleMatch,
      contentLength: content.length,
      topicWords,
      normalizedTopic
    });
  }
  return isValid;
}
