import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { validateTopic, createInvalidTopicResponse } from "./utils/validation.ts";
import { generateStoryWithLLM } from "./generator.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { topic, userPreferences } = await req.json();

    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({
        title: "Topic Missing",
        content: "Please provide a valid topic.",
        takeaway: "Try typing a real subject like 'Photosynthesis' or 'Black Holes'",
        error: "Invalid or missing topic",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    const validation = await validateTopic(topic);
    if (!validation.isValid) {
      const response = createInvalidTopicResponse(topic, validation.reason, validation.suggestedTopic);
      return response;
    }

    console.log(`Generating story for: "${topic}"`);

    const story = await generateStoryWithLLM(topic, userPreferences || null);

    return new Response(JSON.stringify(story), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({
      title: "Something Went Wrong",
      content: "We encountered an issue. Please try again.",
      takeaway: "Technology sometimes needs a retry!",
      error: error.message || "Unknown error",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  }
});
