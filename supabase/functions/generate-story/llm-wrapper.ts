
// LLM Wrapper for story generation
// This file abstracts the LLM implementation details to make it easy to switch providers

import { corsHeaders } from "./utils/cors.ts";

// Supported LLM providers
type LLMProvider = "openai" | "gemini" | "mixtral" | "claude" | "local";

interface LLMOptions {
  provider: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

interface UserPreferences {
  readingLevel?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  languagePreference?: 'english' | 'hinglish' | 'hindi';
  ageGroup?: 'kids' | 'teen' | 'adult';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  favoriteTopics?: string[];
  previousTopics?: string[];
}

// Default options if none specified
const defaultOptions: LLMOptions = {
  provider: "openai", // Use OpenAI by default
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  maxTokens: 2000,
  topP: 0.9,
};

/**
 * Generates a story using the configured LLM provider
 * Designed to work with multiple LLM providers through a common interface
 */
export async function generateStoryWithLLM(
  topic: string, 
  userPreferences?: UserPreferences,
  options: Partial<LLMOptions> = {}
) {
  // Merge default options with provided options
  const mergedOptions: LLMOptions = { ...defaultOptions, ...options };
  
  console.log(`Generating story using provider: ${mergedOptions.provider}`);
  console.log(`Topic: "${topic}"`);
  
  try {
    // Based on the provider, call the appropriate implementation
    switch (mergedOptions.provider) {
      case "openai":
        return await generateWithOpenAI(topic, userPreferences, mergedOptions);
      case "gemini":
        return await generateWithGemini(topic, userPreferences, mergedOptions);
      case "mixtral":
        return await generateWithMixtral(topic, userPreferences, mergedOptions);
      case "claude":
        return await generateWithClaude(topic, userPreferences, mergedOptions);
      case "local":
        return await generateWithLocalModel(topic, userPreferences, mergedOptions);
      default:
        throw new Error(`Unsupported LLM provider: ${mergedOptions.provider}`);
    }
  } catch (error) {
    console.error(`Error generating story with ${mergedOptions.provider}:`, error);
    
    // Fall back to OpenAI if the primary provider fails and it's not already OpenAI
    if (mergedOptions.provider !== "openai") {
      console.log("Falling back to OpenAI...");
      return await generateWithOpenAI(topic, userPreferences, {
        ...mergedOptions,
        provider: "openai",
        model: "gpt-3.5-turbo",
      });
    }
    
    throw error;
  }
}

/**
 * Generate a story using OpenAI
 */
async function generateWithOpenAI(
  topic: string,
  userPreferences?: UserPreferences,
  options?: Partial<LLMOptions>
) {
  // Get OpenAI API key from environment
  const apiKey = Deno.env.get("OPENROUTER_API_KEY") || Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }
  
  // Create the system prompt
  const systemPrompt = createSystemPrompt(topic, userPreferences);
  
  // Make API request to OpenAI
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      ...corsHeaders,
    },
    body: JSON.stringify({
      model: options?.model || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create an educational story about: ${topic}` }
      ],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
      top_p: options?.topP || 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenAI API Error:", error);
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const storyText = data.choices[0].message.content;
  
  // Parse the story response
  return parseStoryResponse(storyText, topic, userPreferences);
}

/**
 * Generate a story using Google's Gemini
 * Placeholder implementation - replace with actual Gemini API call
 */
async function generateWithGemini(
  topic: string,
  userPreferences?: UserPreferences,
  options?: Partial<LLMOptions>
) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("Gemini API key not found");
  }
  
  // Implementation for Gemini would go here
  // For now, throw error to trigger fallback to OpenAI
  throw new Error("Gemini implementation not available");
}

/**
 * Generate a story using Mixtral
 * Placeholder implementation - replace with actual Mixtral API call
 */
async function generateWithMixtral(
  topic: string,
  userPreferences?: UserPreferences,
  options?: Partial<LLMOptions>
) {
  throw new Error("Mixtral implementation not available");
}

/**
 * Generate a story using Claude
 * Placeholder implementation - replace with actual Claude API call
 */
async function generateWithClaude(
  topic: string,
  userPreferences?: UserPreferences,
  options?: Partial<LLMOptions>
) {
  throw new Error("Claude implementation not available");
}

/**
 * Generate a story using a local model
 * Placeholder implementation - replace with actual local model call
 */
async function generateWithLocalModel(
  topic: string,
  userPreferences?: UserPreferences,
  options?: Partial<LLMOptions>
) {
  throw new Error("Local model implementation not available");
}

/**
 * Create a system prompt based on the topic and user preferences
 */
function createSystemPrompt(topic: string, userPreferences?: UserPreferences): string {
  let prompt = `
You are an expert educational story creator. Your task is to create an engaging and informative story about ${topic}.
The story should be educational, informative, and engaging.

Your response should be in JSON format with the following structure:
{
  "title": "Story title",
  "content": "The full story content",
  "takeaway": "The main lesson or takeaway from the story",
  "character": {
    "name": "Main character name",
    "emoji": "An emoji representing the character",
    "traits": "Brief description of character traits"
  },
  "emotions": ["emotion1", "emotion2"],
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "difficulty": "beginner/intermediate/advanced"
}
`;

  // Personalize the prompt based on user preferences
  if (userPreferences) {
    prompt += "\nPersonalize the story based on the following user preferences:";
    
    if (userPreferences.readingLevel) {
      prompt += `\n- Reading level: ${userPreferences.readingLevel}`;
    }
    
    if (userPreferences.languagePreference) {
      prompt += `\n- Language preference: ${userPreferences.languagePreference}`;
      
      if (userPreferences.languagePreference === 'hinglish') {
        prompt += "\n  (Mix Hindi and English naturally, use roman script for Hindi words)";
      }
    }
    
    if (userPreferences.ageGroup) {
      prompt += `\n- Age group: ${userPreferences.ageGroup}`;
    }
    
    if (userPreferences.learningStyle) {
      prompt += `\n- Learning style: ${userPreferences.learningStyle}`;
    }
    
    if (userPreferences.interests && userPreferences.interests.length > 0) {
      prompt += `\n- Interests: ${userPreferences.interests.join(", ")}`;
    }
    
    if (userPreferences.favoriteTopics && userPreferences.favoriteTopics.length > 0) {
      prompt += `\n- Favorite topics: ${userPreferences.favoriteTopics.join(", ")}`;
    }
    
    if (userPreferences.previousTopics && userPreferences.previousTopics.length > 0) {
      prompt += `\n- Previously explored topics: ${userPreferences.previousTopics.join(", ")}`;
    }
    
    // Ask to track personalization
    prompt += "\n\nIn addition to the JSON structure above, include a 'personalizedFor' array in the response that lists which user preferences were incorporated into the story.";
  }

  return prompt;
}

/**
 * Parse the response text from the LLM into a structured story object
 */
function parseStoryResponse(responseText: string, topic: string, userPreferences?: UserPreferences) {
  try {
    // Extract JSON if it's wrapped in markdown code blocks or other text
    let jsonStr = responseText;
    
    // Handle markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1];
    }
    
    // Parse the JSON
    const story = JSON.parse(jsonStr);
    
    // Ensure all required fields are present
    const result = {
      title: story.title || `Story about ${topic}`,
      content: story.content || responseText,
      takeaway: story.takeaway || "Learning is a journey of discovery.",
      character: story.character || {
        name: "Curious Explorer",
        emoji: "🧠",
        traits: "Curiosity, Intelligence"
      },
      emotions: story.emotions || ["educational", "informative"],
      keyPoints: story.keyPoints || [],
      difficulty: story.difficulty || "intermediate",
      topic: topic,
      personalizedFor: story.personalizedFor || [],
      retryCount: 0,
      usedFallbackModel: false,
      qualityWarning: false
    };
    
    return result;
  } catch (error) {
    console.error("Error parsing story response:", error);
    
    // Fallback to returning a basic story structure
    return {
      title: `Learning about ${topic}`,
      content: responseText,
      takeaway: "Sometimes knowledge comes in unexpected formats.",
      character: {
        name: "Curious Explorer",
        emoji: "🧠",
        traits: "Adaptability"
      },
      emotions: ["educational"],
      keyPoints: [],
      difficulty: "intermediate",
      topic: topic,
      personalizedFor: [],
      retryCount: 0,
      usedFallbackModel: false,
      qualityWarning: true
    };
  }
}
