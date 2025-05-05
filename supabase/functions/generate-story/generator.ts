
import { analyzeTopicEmotions } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";
import { getModelConfig } from "./utils/modelConfig.ts";

// Define types for user preferences to improve personalization
interface UserPreferences {
  readingLevel?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  languagePreference?: 'english' | 'hinglish' | 'hindi';
  ageGroup?: 'kids' | 'teen' | 'adult';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  favoriteTopics?: string[];
  previousTopics?: string[];
}

// Create a more detailed error response for JSON parsing failures
function createErrorStory(topic: string, error: string, retryCount: number) {
  return {
    title: `Story about ${topic}`,
    content: `We couldn't generate a detailed story about "${topic}" due to an issue with our AI system (${error}). ${
      retryCount >= 3 ? "We've tried multiple times but encountered technical difficulties." : "Please try again!"
    }`,
    takeaway: retryCount >= 3 ? "Sometimes technology needs a break. Please try again later!" : "Sometimes technology needs a retry!",
    emotions: [
      "curious",
      "educational"
    ],
    keyPoints: [
      `Learn more about ${topic}`,
      "Try again for a better story"
    ],
    retryCount: retryCount
  };
}

export async function generateStoryWithLLM(topic: string, userPreferences?: UserPreferences) {
  const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterApiKey) {
    console.log("🔑 Missing API key");
    throw new Error("API key missing in environment");
  }
  
  try {
    console.log("Starting story generation for topic:", topic);
    if (userPreferences) {
      console.log("With user preferences:", JSON.stringify(userPreferences));
    }
    
    const topicAnalysis = await analyzeTopicEmotions(topic);
    console.log("✅ Topic analysis done");
    
    const character = generateCharacter(topic, topicAnalysis.category);
    
    // Select the appropriate model configuration
    const modelConfig = userPreferences 
      ? getModelConfig('personalized') 
      : getModelConfig('story');
    
    // Build personalization context if user preferences are provided
    let personalizationContext = "";
    if (userPreferences) {
      personalizationContext = `
      USER PREFERENCES (IMPORTANT - TAILOR THE STORY USING THESE):
      - Reading Level: ${userPreferences.readingLevel || 'intermediate'}
      - Interests: ${userPreferences.interests?.join(', ') || 'general'}
      - Language Style: ${userPreferences.languagePreference || 'hinglish'}
      - Age Group: ${userPreferences.ageGroup || 'teen to adult'}
      - Learning Style: ${userPreferences.learningStyle || 'reading'}
      ${userPreferences.previousTopics?.length ? `- Previous Topics: ${userPreferences.previousTopics.join(', ')}` : ''}
      ${userPreferences.favoriteTopics?.length ? `- Favorite Topics: ${userPreferences.favoriteTopics.join(', ')}` : ''}
      `;
    }
    
    const prompt = `
CRITICAL INSTRUCTION: Return ONLY a clean JSON object parseable by JSON.parse(). Do NOT include markdown, backticks, explanations, or any text outside the JSON. Any deviation will break the system.

Generate a ${userPreferences?.languagePreference || 'Hinglish'} story SPECIFICALLY about "${topic}" that:
- Explains "${topic}" in detail with clear examples
- Is educational and uses real-life scenarios
- Mentions "${topic}" EXACTLY as written at least 5 times in the content and once in the title
- Fully focuses on "${topic}"

Character: ${character.name}, who is ${character.traits}
Emotions: ${topicAnalysis.emotions.join(", ")}

${personalizationContext}

Output JSON must include:
- title (must include "${topic}")
- content (must mention "${topic}" at least 5 times)
- takeaway (summarize importance of "${topic}")
- emotions (array of strings)
- keyPoints (array of strings, each mentioning "${topic}")
${userPreferences ? '- difficulty (string indicating the reading level used)' : ''}
${userPreferences ? '- personalizedFor (array of strings indicating which user preferences were considered)' : ''}

Example format:
{
  "title": "${topic} Story",
  "content": "This is about ${topic}. ${topic} helps... ${topic} is used in...",
  "takeaway": "${topic} is important because...",
  "emotions": ["curious", "excited"],
  "keyPoints": ["${topic} is key for...", "${topic} enables..."]
  ${userPreferences ? ',"difficulty": "intermediate",' : ''}
  ${userPreferences ? '"personalizedFor": ["interests in technology", "visual learning style"]' : ''}
}
`;

    // Track retries and errors
    let retryCount = 0;
    let lastError = "";
    let storyJson = null;
    
    while (retryCount < modelConfig.maxRetries && !storyJson) {
      try {
        const currentModel = retryCount >= modelConfig.maxRetries - 1 && modelConfig.fallbackModel 
          ? modelConfig.fallbackModel 
          : modelConfig.model;
          
        console.log(`🚀 Attempt ${retryCount + 1}/${modelConfig.maxRetries} - Sending request to model ${currentModel} with temperature: ${modelConfig.temperature}`);
        
        const response = await fetch(modelConfig.apiEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://story-tales-teach.me/",
            "X-Title": "Story Tales Teach"
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              {
                role: "system",
                content: `You are an educational ${userPreferences?.languagePreference || 'Hinglish'} storyteller that outputs strictly valid JSON.`
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
        
        if (!response.ok) {
          const err = await response.text();
          console.log(`❌ API error on attempt ${retryCount + 1}:`, err);
          lastError = `API error: ${err.substring(0, 50)}...`;
          retryCount++;
          continue;
        }
        
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "";
        console.log(`📝 AI Model raw JSON output (attempt ${retryCount + 1}):\n`, text.substring(0, 200) + "...");
        
        // Clean the output
        let clean = text.trim();
        clean = clean.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "").trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          clean = jsonMatch[0];
        }
        
        try {
          storyJson = JSON.parse(clean);
          console.log(`✅ Successfully parsed JSON on attempt ${retryCount + 1}`);
        } catch (parseErr) {
          console.error(`🛑 JSON parse failed on attempt ${retryCount + 1} for cleaned output:`, clean.substring(0, 200), "\nError:", parseErr.message);
          lastError = `JSON parse error: ${parseErr.message}`;
          retryCount++;
          
          // Add a small delay between retries
          if (retryCount < modelConfig.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (requestErr) {
        console.error(`🛑 Request error on attempt ${retryCount + 1}:`, requestErr.message);
        lastError = `Request error: ${requestErr.message}`;
        retryCount++;
        
        // Add a small delay between retries
        if (retryCount < modelConfig.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // If all attempts failed, return an error story
    if (!storyJson) {
      console.error(`🛑 All ${modelConfig.maxRetries} attempts failed. Last error: ${lastError}`);
      return {
        ...createErrorStory(topic, lastError, retryCount),
        character: {
          name: character.name,
          emoji: character.emoji,
          traits: character.traits
        },
        topic
      };
    }
    
    // Normalize emotions
    if (typeof storyJson.emotions === "string") {
      storyJson.emotions = storyJson.emotions.split(",").map((e) => e.trim());
    }
    
    if (!Array.isArray(storyJson.emotions)) {
      storyJson.emotions = [
        "educational",
        "inspiring"
      ];
    }
    
    // Validate content
    if (!storyContainsTopic(storyJson, topic)) {
      console.error("🛑 Story validation failed:", `Topic: "${topic}"`, `Normalized topic: "${normalizeTopic(topic)}"`, `Content includes topic: ${storyJson.content?.toLowerCase().includes(normalizeTopic(topic))}`, `Title includes topic: ${storyJson.title?.toLowerCase().includes(normalizeTopic(topic))}`, `Content length: ${storyJson.content?.length || 0}`, `Raw content: "${storyJson.content?.substring(0, 200)}..."`);
      
      // Instead of throwing an error, we'll return a story with a warning
      storyJson.content = `${storyJson.content}\n\nNote: This story might not fully explain "${topic}" as requested. If you'd like a more focused explanation, please try again.`;
      storyJson.qualityWarning = true;
    }
    
    // Add retry info
    if (retryCount > 0) {
      storyJson.retryCount = retryCount;
      if (retryCount >= modelConfig.maxRetries - 1 && modelConfig.fallbackModel) {
        storyJson.usedFallbackModel = true;
      }
    }
    
    return {
      ...storyJson,
      character: {
        name: character.name,
        emoji: character.emoji,
        traits: character.traits
      },
      topic
    };
  } catch (err) {
    console.log("🛑 Fatal error in story generation:", err.message);
    throw err;
  }
}

// Alias the function for backward compatibility
export const generateStoryWithGemini = generateStoryWithLLM;

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
