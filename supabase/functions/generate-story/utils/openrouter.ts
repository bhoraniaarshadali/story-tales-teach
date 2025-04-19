// utils/openrouter.ts

export async function queryOpenRouter({
  prompt,
  model = "mistralai/mixtral-8x7b-instruct",
  temperature = 0.7,
  max_tokens = 500,
  title = "StoryTales AI"
}: {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  title?: string;
}): Promise<string | null> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    console.log("OPENROUTER_API_KEY not found");
    return null;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-Title": title
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("OpenRouter fetch error:", err.message);
    return null;
  }
}
