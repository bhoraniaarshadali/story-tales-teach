import { generateCharacter } from "./characters.ts";

const KIE_API_URL = "https://api.kie.ai/gemini-2.5-flash/v1/chat/completions";

function createErrorStory(topic: string, error: string, retryCount: number) {
  return {
    title: `Story about ${topic}`,
    content: `We couldn't generate a detailed story about "${topic}" due to an issue (${error}). ${retryCount >= 3 ? "We've tried multiple times." : "Please try again!"}`,
    takeaway: "Sometimes technology needs a break. Please try again later!",
    emotions: ["curious", "educational"],
    keyPoints: [`Learn more about ${topic}`, "Try again for a better story"],
    retryCount,
  };
}

async function callKieAI(prompt: string, systemPrompt: string) {
  const apiKey = Deno.env.get("KIE_API_KEY");
  if (!apiKey) {
    throw new Error("KIE_API_KEY missing in environment");
  }

  const response = await fetch(KIE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash-openai",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      stream: false,
      include_thoughts: false,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "structured_output",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              content: { type: "string" },
              takeaway: { type: "string" },
              emotions: { type: "array", items: { type: "string" } },
              keyPoints: { type: "array", items: { type: "string" } },
            },
            required: ["title", "content", "takeaway", "emotions", "keyPoints"],
            title: "Story",
            description: "An educational story in JSON format",
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Kie AI error (${response.status}): ${err.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function generateStoryWithLLM(topic: string, userPreferences?: any) {
  try {
    console.log("Starting story generation for topic:", topic);

    const character = generateCharacter(topic, "general");

    let personalizationContext = "";
    if (userPreferences) {
      personalizationContext = `
      USER PREFERENCES:
      - Reading Level: ${userPreferences.readingLevel || 'intermediate'}
      - Language Style: ${userPreferences.languagePreference || 'hinglish'}
      - Age Group: ${userPreferences.ageGroup || 'teen to adult'}
      `;
    }

    const systemPrompt = `You are an educational ${userPreferences?.languagePreference || 'Hinglish'} storyteller. Output strictly valid JSON.`;

    const prompt = `Generate a ${userPreferences?.languagePreference || 'Hinglish'} educational story about "${topic}".

Character: ${character.name}, who is ${character.traits}

Requirements:
- Explain "${topic}" in detail with clear examples
- Educational with real-life scenarios
- Mention "${topic}" at least 5 times in content and once in title
- Story should be 150-200 words

${personalizationContext}

Return JSON with: title, content, takeaway, emotions (array), keyPoints (array)`;

    let retryCount = 0;
    const maxRetries = 3;
    let lastError = "";
    let storyJson = null;

    while (retryCount < maxRetries && !storyJson) {
      try {
        console.log(`🚀 Attempt ${retryCount + 1}/${maxRetries}`);
        const text = await callKieAI(prompt, systemPrompt);
        console.log(`📝 Raw output (attempt ${retryCount + 1}):`, text.substring(0, 200));

        let clean = text.trim();
        clean = clean.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "").trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) clean = jsonMatch[0];

        storyJson = JSON.parse(clean);
        console.log(`✅ Parsed JSON on attempt ${retryCount + 1}`);
      } catch (err) {
        console.error(`🛑 Attempt ${retryCount + 1} failed:`, err.message);
        lastError = err.message;
        retryCount++;
        if (retryCount < maxRetries) await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!storyJson) {
      return {
        ...createErrorStory(topic, lastError, retryCount),
        character: { name: character.name, emoji: character.emoji, traits: character.traits },
        topic,
      };
    }

    if (typeof storyJson.emotions === "string") {
      storyJson.emotions = storyJson.emotions.split(",").map((e: string) => e.trim());
    }
    if (!Array.isArray(storyJson.emotions)) {
      storyJson.emotions = ["educational", "inspiring"];
    }

    if (retryCount > 0) storyJson.retryCount = retryCount;

    return {
      ...storyJson,
      character: { name: character.name, emoji: character.emoji, traits: character.traits },
      topic,
    };
  } catch (err) {
    console.log("🛑 Fatal error:", err.message);
    throw err;
  }
}

export const generateStoryWithGemini = generateStoryWithLLM;
