import { analyzeTopicEmotions } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";
import { getModelConfig } from "./utils/modelConfig.ts";

function createErrorStory(topic: string, error: string, retryCount: number) {
  return {
    title: `Story about ${topic}`,
    content: `We couldn't generate a detailed story about "${topic}" due to an issue with our AI system (${error}). ${retryCount >= 3 ? "We've tried multiple times but encountered technical difficulties." : "Please try again!"}`,
    takeaway: retryCount >= 3 ? "Sometimes technology needs a break. Please try again later!" : "Sometimes technology needs a retry!",
    emotions: ["curious", "educational"],
    keyPoints: [`Learn more about ${topic}`, "Try again for a better story"],
    retryCount: retryCount,
  };
}

async function callGeminiAPI(model: string, prompt: string, systemPrompt: string, config: any) {
  const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!googleApiKey) {
    throw new Error("GOOGLE_API_KEY missing in environment");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleApiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }
      ],
      generationConfig: {
        temperature: config.temperature,
        topP: config.top_p,
        maxOutputTokens: config.max_tokens,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

export async function generateStoryWithLLM(topic: string, userPreferences?: any) {
  try {
    console.log("Starting story generation for topic:", topic);
    if (userPreferences) {
      console.log("With user preferences:", JSON.stringify(userPreferences));
    }

    const topicAnalysis = await analyzeTopicEmotions(topic);
    console.log("✅ Topic analysis done");

    const character = generateCharacter(topic, topicAnalysis.category);
    const modelConfig = userPreferences ? getModelConfig('personalized') : getModelConfig('story');

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

    const systemPrompt = `You are an educational ${userPreferences?.languagePreference || 'Hinglish'} storyteller that outputs strictly valid JSON.`;

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

    console.log("Prompt prepared, calling Gemini API...");

    let retryCount = 0;
    let lastError = "";
    let storyJson = null;

    while (retryCount < modelConfig.maxRetries && !storyJson) {
      try {
        const currentModel = retryCount >= modelConfig.maxRetries - 1 && modelConfig.fallbackModel
          ? modelConfig.fallbackModel
          : modelConfig.model;

        console.log(`🚀 Attempt ${retryCount + 1}/${modelConfig.maxRetries} - Using model ${currentModel}`);

        const text = await callGeminiAPI(currentModel, prompt, systemPrompt, modelConfig);
        console.log(`📝 Raw output (attempt ${retryCount + 1}):`, text.substring(0, 200) + "...");

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
          console.error(`🛑 JSON parse failed on attempt ${retryCount + 1}:`, parseErr.message);
          lastError = `JSON parse error: ${parseErr.message}`;
          retryCount++;
          if (retryCount < modelConfig.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (requestErr) {
        console.error(`🛑 Request error on attempt ${retryCount + 1}:`, requestErr.message);
        lastError = `Request error: ${requestErr.message}`;
        retryCount++;
        if (retryCount < modelConfig.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    if (!storyJson) {
      console.error(`🛑 All ${modelConfig.maxRetries} attempts failed. Last error: ${lastError}`);
      return {
        ...createErrorStory(topic, lastError, retryCount),
        character: { name: character.name, emoji: character.emoji, traits: character.traits },
        topic,
      };
    }

    // Normalize emotions
    if (typeof storyJson.emotions === "string") {
      storyJson.emotions = storyJson.emotions.split(",").map((e: string) => e.trim());
    }
    if (!Array.isArray(storyJson.emotions)) {
      storyJson.emotions = ["educational", "inspiring"];
    }

    // Validate content
    if (!storyContainsTopic(storyJson, topic)) {
      storyJson.content = `${storyJson.content}\n\nNote: This story might not fully explain "${topic}" as requested. If you'd like a more focused explanation, please try again.`;
      storyJson.qualityWarning = true;
    }

    if (retryCount > 0) {
      storyJson.retryCount = retryCount;
      if (retryCount >= modelConfig.maxRetries - 1 && modelConfig.fallbackModel) {
        storyJson.usedFallbackModel = true;
      }
    }

    // Add personalization info
    if (userPreferences) {
      const personalizedFor: string[] = [];
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
      character: { name: character.name, emoji: character.emoji, traits: character.traits },
      topic,
    };
  } catch (err) {
    console.log("🛑 Fatal error in story generation:", err.message);
    throw err;
  }
}

export const generateStoryWithGemini = generateStoryWithLLM;

function normalizeTopic(topic: string) {
  return topic.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function storyContainsTopic(story: any, topic: string) {
  const normalizedTopic = normalizeTopic(topic);
  const topicWords = normalizedTopic.split(" ");
  const content = story.content?.toLowerCase() || "";
  const title = story.title?.toLowerCase() || "";
  const contentMatch = topicWords.some((word: string) => content.includes(word)) || content.includes(normalizedTopic);
  const titleMatch = topicWords.some((word: string) => title.includes(word)) || title.includes(normalizedTopic);
  return contentMatch && titleMatch && content.length > 30;
}
