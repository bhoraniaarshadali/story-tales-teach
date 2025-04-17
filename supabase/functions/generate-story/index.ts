
// This is the edge function that generates a story using Mixtral API via OpenRouter

// Import the necessary packages
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { validateTopic, createInvalidTopicResponse } from "./utils/validation.ts";
import { generateStoryWithMixtral } from "./generator.ts";

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
      console.log(`Topic "${topic}" was rejected: ${validationResult.reason}`);
      return createInvalidTopicResponse(
        topic, 
        validationResult.reason, 
        validationResult.suggestedTopic
      );
    }

    // Generate the story using Mixtral API via OpenRouter
    console.log(`Validated topic "${topic}", generating story...`);
    const story = await generateStoryWithMixtral(topic);
    console.log(`Generated story with title: "${story.title}" for topic: "${topic}"`);

    // Additional validation to ensure topic is properly explained in the story
    if (!story.content.toLowerCase().includes(topic.toLowerCase())) {
      console.error("Generated story doesn't contain the topic in content");
      return new Response(JSON.stringify({ 
        error: "Generated story doesn't properly explain the topic. Please try again." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Count how many times the topic is mentioned in the content
    const topicMentions = (story.content.toLowerCase().match(new RegExp(topic.toLowerCase(), 'g')) || []).length;
    
    // If the topic is only mentioned 1-2 times, it's likely not properly explained
    if (topicMentions < 3) {
      console.error(`Generated story only mentions "${topic}" ${topicMentions} times`);
      return new Response(JSON.stringify({ 
        error: "Generated story doesn't properly explain the topic. Please try again." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Ensure the topic is set correctly in the story object
    if (!story.topic) {
      story.topic = topic;
    }

    // Return the generated story
    return new Response(JSON.stringify(story), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in generate-story function:", error);
    
    return new Response(JSON.stringify({ 
      error: "Failed to generate story. Please try again with a different topic."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
