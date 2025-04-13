// This is the edge function that generates a story using Gemini API

// Import the necessary packages
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { validateTopic, createInvalidTopicResponse } from "./utils/validation.ts";
import { generateStoryWithGemini, generateFallbackStory } from "./generator.ts";

// Main handler function for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body to get the topic - store it early since we'll need it for error handling
    const requestData = await req.json();
    const topic = requestData.topic;
    
    // Ensure we have the topic before proceeding
    if (!topic || typeof topic !== "string") {
      throw new Error("Invalid or missing topic");
    }
    
    console.log(`Generating story for topic: "${topic}"`);
    
    // Validate the topic using Gemini
    const validationResult = await validateTopic(topic);
    console.log("Topic validation result:", JSON.stringify(validationResult));
    
    if (!validationResult.isValid) {
      return createInvalidTopicResponse(topic, validationResult.reason);
    }

    // Generate the story using Gemini API
    const story = await generateStoryWithGemini(topic);
    console.log("Generated story with title:", story.title);

    // Return the generated story
    return new Response(JSON.stringify(story), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in generate-story function:", error);
    
    let fallbackTopic = "learning";
    
    try {
      // Try to get the original topic from the request even if we're in an error state
      const requestData = await req.clone().json();
      if (requestData && requestData.topic && typeof requestData.topic === "string") {
        fallbackTopic = requestData.topic;
        console.log(`Using fallback with original topic: "${fallbackTopic}"`);
      }
    } catch (parseError) {
      console.error("Could not parse request JSON in error handler:", parseError);
      // Keep the default fallback topic
    }
    
    // Generate a fallback story with the original topic if possible
    const fallbackStory = generateFallbackStory(fallbackTopic);
    
    return new Response(JSON.stringify(fallbackStory), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
