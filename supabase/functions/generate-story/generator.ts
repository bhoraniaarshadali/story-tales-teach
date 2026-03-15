
import { analyzeTopicEmotions } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";
import { getModelConfig, getModelForAttempt } from "./utils/modelConfig.ts";

// Define types for user preferences
interface UserPreferences {
  readingLevel?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  languagePreference?: 'english' | 'hinglish' | 'hindi';
  ageGroup?: 'kids' | 'teen' | 'adult';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  favoriteTopics?: string[];
  previousTopics?: string[];
}

// Random variation styles for unique stories every time
const VARIATION_STYLES = [
  "Start the story with a riddle related to the topic that hooks the reader immediately.",
  "Use a flashback technique — start from the end result, then go back to explain how it happened.",
  "Begin with a funny mistake or misunderstanding that the character makes about the topic.",
  "Frame the entire story as a WhatsApp forward message that went viral.",
  "Use a street food analogy — compare the topic to making chai, golgappe, or biryani.",
  "Start with a conversation between two friends arguing about the topic in a college canteen.",
  "Write it as if a grandmother is explaining the topic to her grandchild at bedtime.",
  "Begin with a cricket match analogy where the topic is explained through batting, bowling, or fielding strategies.",
  "Frame it as a Shark Tank India pitch where someone is presenting the topic as a business idea.",
  "Start with a movie scene — describe the topic as if it's a Bollywood plot twist.",
  "Use a train journey analogy — the character learns about the topic while traveling on Indian Railways.",
  "Begin with a meme reference that young people would relate to.",
  "Frame it as a news reporter doing a breaking news segment about the topic.",
  "Write it as diary entries of someone discovering the topic day by day.",
  "Start with a job interview scene where the candidate explains the topic to impress the interviewer.",
];

function getRandomVariationStyle(): string {
  return VARIATION_STYLES[Math.floor(Math.random() * VARIATION_STYLES.length)];
}

// Check if an error is a rate limit / credit / no-endpoint error
function isExhaustedError(errorText: string, statusCode?: number): boolean {
  if (statusCode === 429 || statusCode === 402) return true;
  const lower = errorText.toLowerCase();
  return lower.includes("no endpoints found") ||
    lower.includes("rate limit") ||
    lower.includes("credit") ||
    lower.includes("quota") ||
    lower.includes("exceeded");
}

// Friendly error for when all models are exhausted
function createExhaustedError(topic: string) {
  return {
    title: "⚠️ Story Generator Thoda Thaka Hua Hai!",
    content: "Abhi hamare AI ke credits khatam ho gaye hain. Thodi der baad phir try karo! 🙏",
    takeaway: "Thodi der baad phir try karo — AI models ko rest chahiye!",
    emotions: ["patient", "hopeful"],
    keyPoints: [
      "AI models ke free credits limited hote hain",
      "Thodi der baad phir try karo",
      "Alag time pe better results milenge"
    ],
    isExhausted: true,
    topic
  };
}

// Create a more detailed error response for JSON parsing failures
function createErrorStory(topic: string, error: string, retryCount: number) {
  return {
    title: `Story about ${topic}`,
    content: `We couldn't generate a detailed story about "${topic}" due to an issue with our AI system (${error}). ${
      retryCount >= 3 ? "We've tried multiple times but encountered technical difficulties." : "Please try again!"
    }`,
    takeaway: retryCount >= 3 ? "Sometimes technology needs a break. Please try again later!" : "Sometimes technology needs a retry!",
    emotions: ["curious", "educational"],
    keyPoints: [`Learn more about ${topic}`, "Try again for a better story"],
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
    
    const modelConfig = userPreferences 
      ? getModelConfig('personalized') 
      : getModelConfig('story');
    
    // Pick a random variation style for this generation
    const variationStyle = getRandomVariationStyle();
    console.log("🎨 Variation style:", variationStyle);
    
    // Build personalization context
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

STORYTELLING STYLE INSTRUCTION: ${variationStyle}

Generate a ${userPreferences?.languagePreference || 'Hinglish'} story SPECIFICALLY about "${topic}" that:
- Explains "${topic}" in detail with clear examples
- Is educational and uses real-life scenarios
- Mentions "${topic}" EXACTLY as written at least 5 times in the content and once in the title
- Fully focuses on "${topic}"
- MUST follow the storytelling style instruction above to make this story unique

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

    let retryCount = 0;
    let lastError = "";
    let storyJson = null;
    let allExhausted = true; // Track if all failures are exhaustion errors
    
    while (retryCount < modelConfig.maxRetries && !storyJson) {
      try {
        const { model: currentModel, temperature: currentTemp } = getModelForAttempt(modelConfig, retryCount);
          
        console.log(`🚀 Attempt ${retryCount + 1}/${modelConfig.maxRetries} - Model: ${currentModel}, Temp: ${currentTemp}`);
        
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
                content: `You are an educational ${userPreferences?.languagePreference || 'Hinglish'} storyteller that outputs strictly valid JSON. You MUST complete your entire JSON response within 800 tokens. Plan your story length accordingly — never leave JSON incomplete. Short and complete is better than long and broken.`
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: modelConfig.response_format,
            temperature: currentTemp,
            max_tokens: modelConfig.max_tokens,
            frequency_penalty: modelConfig.frequency_penalty,
            presence_penalty: modelConfig.presence_penalty,
          })
        });
        
        if (!response.ok) {
          const err = await response.text();
          console.log(`❌ API error on attempt ${retryCount + 1}:`, err);
          
          if (!isExhaustedError(err, response.status)) {
            allExhausted = false;
          }
          
          lastError = `API error (${response.status}): ${err.substring(0, 100)}...`;
          retryCount++;
          if (retryCount < modelConfig.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        // If we got a successful response, it's not an exhaustion issue
        allExhausted = false;
        
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "";
        console.log(`📝 AI output (attempt ${retryCount + 1}):\n`, text.substring(0, 200) + "...");
        
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
          console.error(`🛑 JSON parse failed on attempt ${retryCount + 1}:`, clean.substring(0, 200), "\nError:", parseErr.message);
          lastError = `JSON parse error: ${parseErr.message}`;
          allExhausted = false;
          retryCount++;
          if (retryCount < modelConfig.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (requestErr) {
        console.error(`🛑 Request error on attempt ${retryCount + 1}:`, requestErr.message);
        
        if (!isExhaustedError(requestErr.message || "", undefined)) {
          allExhausted = false;
        }
        
        lastError = `Request error: ${requestErr.message}`;
        retryCount++;
        if (retryCount < modelConfig.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // If all attempts failed
    if (!storyJson) {
      console.error(`🛑 All ${modelConfig.maxRetries} attempts failed. Last error: ${lastError}`);
      
      // If all failures were rate limit / credit / no-endpoint errors
      if (allExhausted) {
        console.log("💤 All models exhausted — returning friendly message");
        return {
          ...createExhaustedError(topic),
          character: {
            name: character.name,
            emoji: character.emoji,
            traits: character.traits
          }
        };
      }
      
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
      storyJson.emotions = ["educational", "inspiring"];
    }
    
    // Validate content
    if (!storyContainsTopic(storyJson, topic)) {
      console.error("🛑 Story validation failed for topic:", topic);
      storyJson.content = `${storyJson.content}\n\nNote: This story might not fully explain "${topic}" as requested. If you'd like a more focused explanation, please try again.`;
      storyJson.qualityWarning = true;
    }
    
    // Add retry info
    if (retryCount > 0) {
      storyJson.retryCount = retryCount;
      if (retryCount >= 1) {
        storyJson.usedFallbackModel = true;
      }
    }
    
    // Add personalization info
    if (userPreferences) {
      const personalizedFor = [];
      if (userPreferences.readingLevel) personalizedFor.push(`${userPreferences.readingLevel} reading level`);
      if (userPreferences.languagePreference) personalizedFor.push(`${userPreferences.languagePreference} language style`);
      if (userPreferences.learningStyle) personalizedFor.push(`${userPreferences.learningStyle} learning style`);
      if (userPreferences.previousTopics?.length) personalizedFor.push(`previous topic knowledge`);
      if (userPreferences.favoriteTopics?.length) personalizedFor.push(`favorite topics`);
      if (personalizedFor.length > 0) storyJson.personalizedFor = personalizedFor;
      if (userPreferences.readingLevel) storyJson.difficulty = userPreferences.readingLevel;
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

export const generateStoryWithGemini = generateStoryWithLLM;

function normalizeTopic(topic) {
  return topic.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function storyContainsTopic(story, topic) {
  const normalizedTopic = normalizeTopic(topic);
  const topicWords = normalizedTopic.split(" ");
  const content = story.content?.toLowerCase() || "";
  const title = story.title?.toLowerCase() || "";
  
  const contentMatch = topicWords.some((word) => content.includes(word)) || content.includes(normalizedTopic);
  const titleMatch = topicWords.some((word) => title.includes(word)) || title.includes(normalizedTopic);
  const isValid = contentMatch && titleMatch && content.length > 30;
  
  if (!isValid) {
    console.log("Validation details:", { contentMatch, titleMatch, contentLength: content.length, topicWords, normalizedTopic });
  }
  
  return isValid;
}
