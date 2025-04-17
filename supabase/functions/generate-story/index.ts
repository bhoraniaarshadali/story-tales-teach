
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
    
    try {
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
    } catch (modelError) {
      console.error("Error generating story with model:", modelError);
      // Return a friendlier response for model errors
      return new Response(JSON.stringify({
        title: "Story Generation Failed",
        content: `We couldn't generate a story about "${topic}" at this time. Please try again later or try a different topic.`,
        takeaway: "Sometimes our storytelling system needs a break. Please try again!",
        error: modelError.message || "Model error",
        topic: topic
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,  // Return 200 with error content instead of failure status
      });
    }
  } catch (error) {
    console.error("Error in generate-story function:", error);
    
    // Get the topic from the request if possible
    let topic = "unknown";
    try {
      const requestData = await req.json();
      topic = requestData.topic || "unknown";
    } catch {}
    
    // Return a readable error message as a valid story response
    return new Response(JSON.stringify({ 
      title: "Oops, Something Went Wrong",
      content: `We encountered a technical issue while creating your story. Please try again with a different topic or try again later.`,
      takeaway: "Technology sometimes takes unexpected turns, just like good stories!",
      error: error.message || "Unknown error",
      topic: topic
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 with error content instead of 500
    });
  }
});
