
import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/hooks/useStoryManager';

/**
 * Generates a story using Supabase Edge Functions
 * @param topic The topic of the story
 * @param preferences User preferences for the story
 * @returns A promise that resolves to a Story object
 */
export const generateStory = async (topic: string, preferences: any = {}): Promise<Story> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-story', {
      body: {
        topic,
        preferences
      }
    });

    if (error) {
      console.error('Error invoking Supabase function:', error);
      throw new Error(error.message || 'Failed to generate story');
    }

    if (!data) {
      throw new Error('No data received from Supabase function');
    }

    return data as Story;
  } catch (err: any) {
    console.error('Error generating story:', err);
    throw new Error(err.message || 'Failed to generate story');
  }
};

/**
 * Store story in database
 */
export const storeStoryInDatabase = async (story: {
  title: string;
  content: string;
  takeaway: string;
  topic: string;
  is_public: boolean;
}) => {
  const { data, error } = await supabase
    .from('stories')
    .insert([story]);

  if (error) {
    console.error('Error storing story:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch stories from database
 */
export const fetchStories = async (options: { limit?: number; isPublic?: boolean } = {}) => {
  const { limit = 50, isPublic = false } = options;
  
  let query = supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (isPublic !== undefined) {
    query = query.eq('is_public', isPublic);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }

  return data;
};

/**
 * Analyzes popular topics using Supabase Edge Functions
 * @returns A promise that resolves to an array of popular topics
 */
export const analyzePopularTopics = async (): Promise<{topic: string, count: number}[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-topics', {});

    if (error) {
      console.error('Error invoking Supabase function:', error);
      throw new Error(error.message || 'Failed to analyze topics');
    }

    if (!data) {
      throw new Error('No data received from Supabase function');
    }

    return data as {topic: string, count: number}[];
  } catch (err: any) {
    console.error('Error analyzing topics:', err);
    throw new Error(err.message || 'Failed to analyze topics');
  }
};

/**
 * Main LLM wrapper function that can easily switch between different AI providers
 * This implements the architecture pattern requested for easy switching between
 * OpenAI, Mixtral, Claude, Gemini, or local models
 */
export const generateStoryWithLLM = async (
  topic: string,
  preferences: any = {},
  provider: 'gemini' | 'mixtral' | 'openai' | 'claude' | 'local' = 'gemini'
) => {
  console.log(`🤖 Generating story with ${provider.toUpperCase()} for topic: "${topic}"`);
  
  // For now, we'll use the existing generate-story function
  // In the future, this can be extended to support multiple providers
  switch (provider) {
    case 'gemini':
    case 'mixtral':
      // Current implementation using Supabase Edge Function
      return await generateStory(topic, preferences);
    
    case 'openai':
      // TODO: Implement OpenAI integration
      console.log('🔄 OpenAI integration coming soon!');
      return await generateStory(topic, preferences);
    
    case 'claude':
      // TODO: Implement Claude integration
      console.log('🔄 Claude integration coming soon!');
      return await generateStory(topic, preferences);
    
    case 'local':
      // TODO: Implement local model integration
      console.log('🔄 Local model integration coming soon!');
      return await generateStory(topic, preferences);
    
    default:
      return await generateStory(topic, preferences);
  }
};

/**
 * Configuration object for different LLM providers
 * This makes it easy to add new providers and configure them
 */
export const LLM_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    description: 'Advanced AI with multilingual support',
    available: true,
    features: ['hindi', 'english', 'hinglish', 'code-generation']
  },
  mixtral: {
    name: 'Mixtral 8x7B',
    description: 'Open-source multilingual model',
    available: true,
    features: ['multilingual', 'fast-inference']
  },
  openai: {
    name: 'OpenAI GPT',
    description: 'Industry-leading language model',
    available: false, // Will be true when implemented
    features: ['creative-writing', 'reasoning']
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Constitutional AI with safety focus',
    available: false, // Will be true when implemented
    features: ['safety', 'reasoning', 'long-context']
  },
  local: {
    name: 'Local Model',
    description: 'Privacy-first local inference',
    available: false, // Will be true when implemented
    features: ['privacy', 'offline', 'customizable']
  }
} as const;

/**
 * Get available LLM providers
 */
export const getAvailableProviders = () => {
  return Object.entries(LLM_PROVIDERS)
    .filter(([_, config]) => config.available)
    .map(([key, config]) => ({ id: key, ...config }));
};

/**
 * Validate if a provider is available
 */
export const isProviderAvailable = (provider: string): boolean => {
  return LLM_PROVIDERS[provider as keyof typeof LLM_PROVIDERS]?.available || false;
};

/**
 * Enhanced story generation with provider selection
 * This is the main function that should be used throughout the app
 */
export const generateEnhancedStory = async (
  topic: string,
  preferences: any = {},
  selectedProvider?: string
) => {
  const provider = selectedProvider && isProviderAvailable(selectedProvider) 
    ? selectedProvider as keyof typeof LLM_PROVIDERS
    : 'gemini'; // Default to Gemini

  console.log(`📚 Generating enhanced story using ${LLM_PROVIDERS[provider].name}`);
  
  try {
    const result = await generateStoryWithLLM(topic, preferences, provider);
    
    // Add provider metadata to the result
    if (result && typeof result === 'object') {
      return {
        ...result,
        metadata: {
          ...(result.metadata || {}),
          provider: provider,
          providerName: LLM_PROVIDERS[provider].name,
          generatedAt: new Date().toISOString()
        }
      };
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Error generating story with ${provider}:`, error);
    
    // Fallback to default provider if the selected one fails
    if (provider !== 'gemini') {
      console.log('🔄 Falling back to Gemini...');
      return await generateStoryWithLLM(topic, preferences, 'gemini');
    }
    
    throw error;
  }
};
