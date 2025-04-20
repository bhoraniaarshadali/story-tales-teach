import { analyzeTopicEmotions } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";

export async function generateStoryWithMixtral(topic) {
  const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterApiKey) {
    console.log("🔑 Missing API key");
    throw new Error("API key missing in environment");
  }

  try {
    const topicAnalysis = await analyzeTopicEmotions(topic);
    console.log("✅ Topic analysis done");

    const character = generateCharacter(topic, topicAnalysis.category);

    const prompt = `
CRITICAL INSTRUCTION: Return ONLY a clean JSON object. DO NOT include markdown, backticks, or any explanation.

Generate a Hinglish story SPECIFICALLY about "${topic}" that:
- Explains it in detail
- Is educational and uses real-life examples
- Mentions "${topic}" at least 5 times  
- Fully focuses on "${topic}"

Character: ${character.name}, who is ${character.traits}
Emotions: ${topicAnalysis.emotions.join(", ")}

Output JSON must include:
- title
- content
- takeaway
- emotions (array)
- keyPoints (array)
`;

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
          { role: "system", content: "You are an educational Hinglish storyteller." },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.log("❌ API error:", err);
      throw new Error("Failed to fetch from OpenRouter");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    console.log("📝 Mixtral raw output:\n", text);

    // Soft cleanup: remove markdown/code fences, then try parse
    let clean = text.trim();
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    // Try to parse entire block OR first JSON-looking substring
    let storyJson;
    try {
      storyJson = JSON.parse(clean);
    } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("Mixtral output does not contain valid JSON");
      }
      storyJson = JSON.parse(match[0]);
    }

    // Normalize
    if (typeof storyJson.emotions === "string") {
      storyJson.emotions = storyJson.emotions.split(",").map((e) => e.trim());
    }
    if (!Array.isArray(storyJson.emotions)) {
      storyJson.emotions = ["educational", "inspiring"];
    }

    // Validate content
    if (!storyContainsTopic(storyJson, topic)) {
      throw new Error("Generated story doesn’t properly explain the topic.");
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

function storyContainsTopic(story, topic) {
  const t = topic.toLowerCase();
  return (
    story.content?.toLowerCase().includes(t) &&
    story.title?.toLowerCase().includes(t) &&
    story.content.length > 100
  );
}