
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { validateTopic, createInvalidTopicResponse } from "./utils/validation.ts";
import { generateStoryWithMixtral } from "./generator.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const requestData = await req.json();
    const topic = requestData.topic;
    const userPreferences = requestData.userPreferences || null; // Get user preferences if provided
    
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
    
    console.log(`Generating story for topic: "${topic}"${userPreferences ? " with user preferences" : ""}`);
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
      // Pass user preferences to the story generator
      const story = await generateStoryWithMixtral(topic, userPreferences);
      console.log(`Generated story with title: "${story.title}" for topic: "${topic}"`);
      
      // Ensure we have all required fields
      const completeStory = {
        title: story.title || `Learning About ${topic}`,
        content: story.content || `This is a story about ${topic}.`,
        takeaway: story.takeaway || `Understanding ${topic} is important for learning.`,
        character: story.character || { name: "Teacher", emoji: "🧑‍🏫" },
        emotions: Array.isArray(story.emotions) ? story.emotions : ["educational", "informative"],
        keyPoints: Array.isArray(story.keyPoints) ? story.keyPoints : [`Learn more about ${topic}`],
        topic: topic,
        readingLevel: story.readingLevel || "intermediate",
        recommendedAge: story.recommendedAge || "all-ages",
        personalized: story.personalized || false,
        popupMessage: `🎉 Your ${story.personalized ? "personalized" : ""} story for "${topic}" is ready! Let's dive in.`
      };
      
      return new Response(JSON.stringify(completeStory), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    } catch (modelError) {
      console.error("Error generating story with model:", modelError);
      
      // Create a fallback story that's properly formatted
      const fallbackStory = {
        title: `Learning About ${topic}`,
        content: `Let me tell you about ${topic}! ${topic} is an important concept that many people find interesting.\n\nWhen we first learn about ${topic}, we might find it confusing. But with practice and exploration, ${topic} becomes easier to understand.\n\nThe beauty of ${topic} is how it connects to our daily lives. We can see examples of ${topic} all around us if we look carefully.`,
        takeaway: `${topic} might seem complex at first, but breaking it down into smaller concepts makes it easier to understand.`,
        character: { name: "Professor Wisdom", emoji: "🧠", traits: "knowledgeable and friendly" },
        emotions: ["curious", "interested", "educational"],
        keyPoints: [
          `${topic} provides valuable skills for problem-solving`,
          `Regular practice helps master ${topic} concepts`,
          `${topic} connects to many other important areas of knowledge`
        ],
        topic: topic,
        readingLevel: "intermediate",
        recommendedAge: "all-ages",
        personalized: false,
        popupMessage: "⚠️ We had to use a simpler story format. Enjoy learning anyway!"
      };
      
      return new Response(JSON.stringify(fallbackStory), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    }
  } catch (error) {
    console.error("Error in generate-story function:", error);
    
    // Generic fallback response that will always work
    return new Response(JSON.stringify({
      title: "Story Generator",
      content: "We encountered a technical issue while creating your story. But don't worry! Try again with a different topic, and we'll create something amazing for you.",
      takeaway: "Technology sometimes takes unexpected turns, just like good stories!",
      character: { name: "Tech Buddy", emoji: "🤖", traits: "helpful and resilient" },
      emotions: ["hopeful", "curious"],
      keyPoints: ["Try a different topic", "Technology improves with feedback", "Every challenge is a learning opportunity"],
      error: error.message || "Unknown error",
      topic: "technical difficulties",
      readingLevel: "intermediate",
      recommendedAge: "all-ages",
      personalized: false,
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
