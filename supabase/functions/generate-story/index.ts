import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { validateTopic, createInvalidTopicResponse } from "./utils/validation.ts";
import { generateStoryWithLLM } from "./generator.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const requestData = await req.json();
    const topic = requestData.topic;
    // Extract user preferences if provided
    const userPreferences = requestData.userPreferences || null;
    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({
        title: "Topic Missing",
        content: "Please provide a valid topic to generate your story.",
        takeaway: "Try typing a real subject, like 'Photosynthesis' or 'Black Holes' 🌌",
        error: "Invalid or missing topic",
        popupMessage: "Topic is missing or not in proper format. Please enter something meaningful.",
        topic: topic || "unknown"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    console.log(`Generating story for topic: "${topic}"${userPreferences ? " with personalization" : ""}`);
    if (userPreferences) {
      console.log("User preferences received:", JSON.stringify(userPreferences));
    }
    const validationResult = await validateTopic(topic);
    console.log("Topic validation result:", JSON.stringify(validationResult));
    if (!validationResult.isValid) {
      console.log(`Topic "${topic}" was rejected: ${validationResult.reason}`);
      const response = createInvalidTopicResponse(topic, validationResult.reason, validationResult.suggestedTopic);
      const responseBody = JSON.parse(await response.text());
      return new Response(JSON.stringify({
        ...responseBody,
        popupMessage: `Hmm... "${topic}" seems a bit off. Try something more educational.`
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    console.log(`Validated topic "${topic}", generating story...`);
    try {
      const story = await generateStoryWithLLM(topic, userPreferences);
      console.log(`Generated story with title: "${story.title}" for topic: "${topic}"`);
      if (userPreferences) {
        console.log("Generated story with personalization:", story.personalizedFor ? story.personalizedFor.join(", ") : "none");
      }
      // Handle retry information in the response
      let popupMessage = userPreferences ? `🎉 Your personalized story for "${topic}" is ready! Tailored just for you.` : `🎉 Your story for "${topic}" is ready! Let's dive in.`;
      // If we had to retry or use a fallback model, add that information to the popup message
      if (story.retryCount && story.retryCount > 0) {
        if (story.retryCount >= 3) {
          popupMessage = `📢 We had some challenges creating your story, but we've managed to deliver one using ${story.usedFallbackModel ? 'our backup system' : 'multiple attempts'}!`;
        } else if (story.qualityWarning) {
          popupMessage = `📝 Your story is ready, but may not cover "${topic}" perfectly. Feel free to try again if needed.`;
        }
      }
      return new Response(JSON.stringify({
        ...story,
        popupMessage
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    } catch (modelError) {
      console.error("Error generating story with model:", modelError);
      return new Response(JSON.stringify({
        title: "Story Generation Failed",
        content: `We couldn't generate a story about "${topic}" at this time. Please try again later or try a different topic.`,
        takeaway: "Sometimes our storytelling system needs a break. Please try again!",
        error: modelError.message || "Model error",
        topic: topic,
        popupMessage: "⚠️ Generation failed. Try again or switch topics."
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    }
  } catch (error) {
    console.error("Error in generate-story function:", error);
    return new Response(JSON.stringify({
      title: "Oops, Something Went Wrong",
      content: "We encountered a technical issue while creating your story. Please try again with a different topic or try again later.",
      takeaway: "Technology sometimes takes unexpected turns, just like good stories!",
      error: error.message || "Unknown error",
      topic: "unknown",
      popupMessage: "Something broke on our side. Give it another go!"
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  }
});
