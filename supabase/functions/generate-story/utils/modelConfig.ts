// Global configuration for AI model settings
// This file centralizes all model-related parameters for easy adjustment
// Default configuration for story generation
export const defaultStoryModelConfig = {
  model: "tngtech/deepseek-r1t-chimera:free",
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
export const analyticalModelConfig = {
  model: "mistralai/mistral-7b-instruct:free",
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
export const personalizedStoryConfig = {
  model: "meta-llama/llama-4-maverick:free",
  temperature: 0.85,
  top_p: 0.92,
  max_tokens: 1500,
  provider: 'openrouter',
  response_format: {
    type: "json_object"
  },
  maxRetries: 3,
  fallbackModel: "mistralai/mistral-small-3.1-24b-instruct:free",
  apiEndpoint: "https://openrouter.ai/api/v1/chat/completions"
};
// Get appropriate configuration based on task type
export function getModelConfig(task = 'story') {
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
