
/**
 * LLM Wrapper - Abstracts story generation across different AI providers
 * 
 * This utility allows switching between different AI models (Mixtral, Gemini, OpenAI, Claude)
 * with consistent interface and fallback mechanisms.
 */

import { UserPreferences } from "../services/storyService";

// Types for AI response structures
export interface LLMResponse {
  title: string;
  content: string;
  takeaway: string;
  character?: {
    name: string;
    emoji: string;
    traits?: string;
  };
  emotions?: string[] | string;
  keyPoints?: string[];
  topic?: string;
  error?: string;
  suggestedTopic?: string;
  difficulty?: string;
  personalizedFor?: string[];
  retryCount?: number;
  usedFallbackModel?: boolean;
  qualityWarning?: boolean;
}

// Provider IDs for easier switching
export enum AIProvider {
  DEFAULT = 'default',    // Uses whatever is configured in Supabase function
  MIXTRAL = 'mixtral',
  GEMINI = 'gemini',
  OPENAI = 'openai',
  CLAUDE = 'claude',
  LOCAL = 'local'         // For future local model support
}

// Configuration for story generation
export interface StoryGenerationConfig {
  provider?: AIProvider;
  fallbackProvider?: AIProvider;
  maxRetries?: number;
  timeout?: number;
  debugMode?: boolean;
}

/**
 * Generates a story using configured LLM providers
 * 
 * @param topic The topic to generate a story about
 * @param userPreferences Optional user preferences for personalization
 * @param config Optional configuration for provider selection and fallback behavior
 * @returns Story response from the AI
 */
export const generateStoryWithLLM = async (
  topic: string, 
  userPreferences?: UserPreferences,
  config: StoryGenerationConfig = {}
): Promise<LLMResponse> => {
  const {
    provider = AIProvider.DEFAULT,
    fallbackProvider,
    maxRetries = 2,
    timeout = 30000,
    debugMode = false
  } = config;

  // Input validation
  if (!topic || topic.trim().length < 2) {
    throw new Error("Please provide a valid topic with at least 2 characters");
  }

  if (debugMode) {
    console.log(`[LLM Wrapper] Generating story about "${topic}" using ${provider}`);
    console.log(`[LLM Wrapper] User preferences:`, userPreferences);
  }

  // Currently, we're using the story generation from Supabase Edge Function
  try {
    // Here we can implement provider-specific logic in the future
    // For now, we use the existing storyService implementation
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ 
        topic,
        preferences: userPreferences,
        provider: provider !== AIProvider.DEFAULT ? provider : undefined
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`[LLM Wrapper] API error: ${error}`);
      throw new Error(`API error: ${error}`);
    }
    
    const data = await response.json();
    
    if (debugMode) {
      console.log(`[LLM Wrapper] Story generated successfully`);
    }

    return data;
    
  } catch (error) {
    console.error(`[LLM Wrapper] Error generating story:`, error);
    
    // If a fallback provider is configured and it's different from the primary provider
    if (fallbackProvider && fallbackProvider !== provider) {
      console.log(`[LLM Wrapper] Attempting fallback to ${fallbackProvider}`);
      
      // Recursive call with fallback provider
      return generateStoryWithLLM(topic, userPreferences, {
        ...config,
        provider: fallbackProvider,
        fallbackProvider: undefined, // Prevent infinite fallback loops
        maxRetries: 1 // Limit retries for fallback
      });
    }
    
    throw error;
  }
};
