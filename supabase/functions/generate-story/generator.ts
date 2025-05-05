
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

export async function generateStoryWithGemini(topic, userPreferences?: UserPreferences) {
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

    console.log("🚀 Sending request to model with temperature:", modelConfig.temperature);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://story-tales-teach.me/",
        "X-Title": "Story Tales Teach"
      },
      body: JSON.stringify({
        model: modelConfig.model,
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
      console.log("❌ API error:", err);
      throw new Error("Failed to fetch from model provider");
    }
    
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    console.log("📝 AI Model raw JSON output:\n", text.substring(0, 200) + "...");
    
    // Clean the output
    let clean = text.trim();
    clean = clean.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    let storyJson;
    
    if (jsonMatch) {
      clean = jsonMatch[0];
    }
    
    try {
      storyJson = JSON.parse(clean);
    } catch (err) {
      console.error("🛑 JSON parse failed for cleaned output:", clean.substring(0, 200), "\nError:", err.message);
      storyJson = {
        title: `Story about ${topic}`,
        content: `We couldn't generate a detailed story about "${topic}" due to an issue with the response format. Please try again!`,
        takeaway: "Sometimes technology needs a retry!",
        emotions: [
          "curious",
          "educational"
        ],
        keyPoints: [
          `Learn more about ${topic}`,
          "Try again for a better story"
        ]
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
      throw new Error("Topic not properly explained");
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
