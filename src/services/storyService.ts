
import { generateEnhancedStory } from '../utils/llmWrapper';

export interface UserPreferences {
  language?: 'english' | 'hindi' | 'hinglish';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  storyType?: 'adventure' | 'mystery' | 'educational' | 'funny' | 'inspirational';
  characterName?: string;
  previousTopics?: string[];
  favoriteTopics?: string[];
  languagePreference?: string;
  readingLevel?: string;
  ageGroup?: string;
}

export interface StoryResponse {
  title: string;
  content: string;
  takeaway: string;
  character?: {
    name: string;
    emoji: string;
    traits?: string;
  };
  emotions?: string[];
  keyPoints?: string[];
  difficulty?: string;
  personalizedFor?: string[];
  retryCount?: number;
  usedFallbackModel?: boolean;
  qualityWarning?: boolean;
  metadata?: {
    provider?: string;
    providerName?: string;
    generatedAt?: string;
  };
}

/**
 * Generates a story using the enhanced LLM wrapper
 * @param topic The topic of the story
 * @param preferences User preferences for the story
 * @returns A promise that resolves to a StoryResponse object
 */
export const generateStory = async (topic: string, preferences?: UserPreferences): Promise<StoryResponse> => {
  try {
    console.log(`🎯 Generating story for topic: "${topic}"`);
    
    if (preferences) {
      console.log("📊 Using preferences:", JSON.stringify(preferences));
    }

    // Use the enhanced story generation with provider selection
    const result = await generateEnhancedStory(topic, preferences, 'gemini');

    if (!result) {
      throw new Error('No story generated');
    }

    console.log(`✅ Story generated successfully: "${result.title}"`);
    return result as StoryResponse;

  } catch (error: any) {
    console.error('❌ Error in story generation:', error);
    
    // Return a fallback error story instead of throwing
    return {
      title: "Oops! Something went wrong",
      content: `We encountered an issue while creating your story about "${topic}". Please try again with a different topic or check your internet connection.`,
      takeaway: "Sometimes technology needs a little patience. Don't give up on your learning journey!",
      retryCount: 1,
      qualityWarning: true
    };
  }
};
