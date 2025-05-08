
/**
 * Platform-agnostic LLM wrapper for story generation
 * This allows easy switching between different AI providers (OpenAI, Mixtral, Claude, etc.)
 */

import { supabase } from "@/integrations/supabase/client";
import { UserPreferences, type StoryResponse } from "../services/storyService";

// Define supported LLM providers
export type LLMProvider = "openrouter" | "openai" | "mixtral" | "claude" | "anthropic" | "gemini";

// Configuration for LLM calls
interface LLMConfig {
  provider: LLMProvider;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate a story using the current LLM provider
 * This function wraps the actual call to the AI service
 */
export async function generateStoryWithLLM(
  topic: string,
  userPreferences?: UserPreferences,
  config: LLMConfig = { provider: "openrouter" }
): Promise<StoryResponse> {
  console.log(`LLM Wrapper: Generating story about "${topic}" using ${config.provider}`);
  
  try {
    // Log the start of story generation with provider info
    console.log(`Starting story generation with ${config.provider} for topic: ${topic}`);
    
    // Call the Supabase Edge Function with user preferences and LLM config
    const { data, error } = await supabase.functions.invoke('generate-story', {
      body: { 
        topic: topic.trim(),
        userPreferences,
        llmConfig: config
      }
    });

    if (error) {
      console.error('Error from LLM service:', error);
      throw new Error(error.message || 'Failed to generate story');
    }

    // Store the successful story in the database
    try {
      await storeStoryInDatabase({
        title: data.title,
        content: data.content,
        takeaway: data.takeaway,
        topic: topic,
        is_public: false
      });
      console.log('Story successfully stored in database');
    } catch (dbError) {
      console.error('Failed to store story in database:', dbError);
      // Continue with the story generation even if database storage fails
    }

    return data as StoryResponse;
  } catch (error) {
    console.error('Error in generateStoryWithLLM:', error);
    throw error;
  }
}

/**
 * Store a generated story in the database
 */
export async function storeStoryInDatabase(story: {
  title: string;
  content: string;
  takeaway: string;
  topic: string;
  is_public?: boolean;
}) {
  const { error } = await supabase.from('stories').insert({
    title: story.title,
    content: story.content,
    takeaway: story.takeaway,
    topic: story.topic,
    is_public: story.is_public || false,
  });

  if (error) {
    console.error('Error storing story in database:', error);
    throw error;
  }
}

/**
 * Fetch stories from the database with various filtering options
 */
export async function fetchStories({
  limit = 10,
  isPublic = true,
  orderBy = 'created_at'
}: {
  limit?: number;
  isPublic?: boolean;
  orderBy?: string;
} = {}) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_public', isPublic)
    .order(orderBy, { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }

  return data;
}

/**
 * Analyze stories to find popular topics
 */
export async function analyzePopularTopics() {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('topic, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error analyzing topics:', error);
      throw error;
    }

    // Count occurrences of each topic
    const topicCounts: Record<string, number> = {};
    data.forEach(story => {
      if (story.topic) {
        topicCounts[story.topic] = (topicCounts[story.topic] || 0) + 1;
      }
    });

    // Sort topics by count
    const sortedTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count }));

    return sortedTopics;
  } catch (error) {
    console.error('Error in analyzePopularTopics:', error);
    // Return empty array as fallback
    return [];
  }
}
