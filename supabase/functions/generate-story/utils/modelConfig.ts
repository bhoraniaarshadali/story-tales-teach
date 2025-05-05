
// Global configuration for AI model settings
// This file centralizes all model-related parameters for easy adjustment

export interface ModelConfig {
  // Model selection options
  model: string;
  // Temperature controls randomness: 0.0 = deterministic, 1.0 = creative
  temperature: number;
  // Controls diversity via nucleus sampling
  top_p: number;
  // Maximum number of tokens to generate
  max_tokens: number;
  // Model provider (openrouter, openai, anthropic, etc.)
  provider: 'openrouter' | 'openai' | 'anthropic' | 'mistral' | 'custom';
  // Format for output
  response_format: {
    type: string;
  };
  // Maximum number of retries for failed requests
  maxRetries: number;
  // Fallback model to use if primary model fails repeatedly
  fallbackModel?: string;
  // API endpoint for the model provider
  apiEndpoint: string;
}

// Default configuration for story generation
export const defaultStoryModelConfig: ModelConfig = {
  model: "google/gemini-2.0-flash-exp:free", // Default model
  temperature: 0.9,
  top_p: 0.9,
  max_tokens: 1024,
  provider: 'openrouter',
  response_format: {
    type: "json_object"
  },
  maxRetries: 3,
  fallbackModel: "mistralai/mistral-small-3.1-24b-instruct:free",
  apiEndpoint: "https://openrouter.ai/api/v1/chat/completions"
};

// More focused configuration for analytical tasks (topic analysis)
export const analyticalModelConfig: ModelConfig = {
  model: "google/gemini-2.0-flash-exp:free",
  temperature: 0.3,
  top_p: 0.95,
  max_tokens: 300,
  provider: 'openrouter',
  response_format: {
    type: "json_object"
  },
  maxRetries: 3,
  fallbackModel: "mistralai/mistral-small-3.1-24b-instruct:free",
  apiEndpoint: "https://openrouter.ai/api/v1/chat/completions"
};

// Configuration for generating personalized stories
export const personalizedStoryConfig: ModelConfig = {
  model: "google/gemini-2.0-flash-exp:free",
  temperature: 0.85, // Slightly lower temperature for personalization
  top_p: 0.92,
  max_tokens: 1500, // Increased for more detailed personalized content
  provider: 'openrouter',
  response_format: {
    type: "json_object"
  },
  maxRetries: 3,
  fallbackModel: "mistralai/mistral-small-3.1-24b-instruct:free",
  apiEndpoint: "https://openrouter.ai/api/v1/chat/completions"
};

// Get appropriate configuration based on task type
export function getModelConfig(task: 'story' | 'analysis' | 'personalized' = 'story'): ModelConfig {
  switch (task) {
    case 'analysis':
      return analyticalModelConfig;
    case 'personalized':
      return personalizedStoryConfig;
    case 'story':
    default:
      return defaultStoryModelConfig;
  }
}
