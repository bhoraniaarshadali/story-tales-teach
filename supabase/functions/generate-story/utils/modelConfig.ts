
// Global configuration for AI model settings
// This file centralizes all model-related parameters for easy adjustment

export interface ModelConfig {
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  provider: 'openrouter' | 'openai' | 'anthropic' | 'mistral' | 'custom';
  response_format: {
    type: string;
  };
  maxRetries: number;
  fallbackModel?: string;
  lastFallbackModel?: string;
  apiEndpoint: string;
  frequency_penalty: number;
  presence_penalty: number;
  reasoning: boolean;
  // Temperature overrides for fallback models
  fallbackTemperature?: number;
  lastFallbackTemperature?: number;
}

// Default configuration for story generation
export const defaultStoryModelConfig: ModelConfig = {
  model: "z-ai/glm-4.5-air:free",
  temperature: 0.92,
  top_p: 0.9,
  max_tokens: 900,
  provider: 'openrouter',
  response_format: { type: "json_object" },
  maxRetries: 3,
  fallbackModel: "nvidia/nemotron-3-super-120b-a12b:free",
  lastFallbackModel: "stepfun/step-3.5-flash:free",
  apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
  frequency_penalty: 0.6,
  presence_penalty: 0.5,
  reasoning: false,
  fallbackTemperature: 0.88,
  lastFallbackTemperature: 0.85,
};

// More focused configuration for analytical tasks (topic analysis)
export const analyticalModelConfig: ModelConfig = {
  model: "z-ai/glm-4.5-air:free",
  temperature: 0.3,
  top_p: 0.95,
  max_tokens: 300,
  provider: 'openrouter',
  response_format: { type: "json_object" },
  maxRetries: 3,
  fallbackModel: "nvidia/nemotron-3-super-120b-a12b:free",
  lastFallbackModel: "stepfun/step-3.5-flash:free",
  apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
  frequency_penalty: 0.6,
  presence_penalty: 0.5,
  reasoning: false,
};

// Configuration for generating personalized stories
export const personalizedStoryConfig: ModelConfig = {
  model: "z-ai/glm-4.5-air:free",
  temperature: 0.92,
  top_p: 0.92,
  max_tokens: 900,
  provider: 'openrouter',
  response_format: { type: "json_object" },
  maxRetries: 3,
  fallbackModel: "nvidia/nemotron-3-super-120b-a12b:free",
  lastFallbackModel: "stepfun/step-3.5-flash:free",
  apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
  frequency_penalty: 0.6,
  presence_penalty: 0.5,
  reasoning: false,
  fallbackTemperature: 0.88,
  lastFallbackTemperature: 0.85,
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

// Get the correct model and temperature for a given retry attempt
export function getModelForAttempt(config: ModelConfig, attempt: number): { model: string; temperature: number } {
  if (attempt >= 2 && config.lastFallbackModel) {
    return { model: config.lastFallbackModel, temperature: config.lastFallbackTemperature ?? config.temperature };
  }
  if (attempt >= 1 && config.fallbackModel) {
    return { model: config.fallbackModel, temperature: config.fallbackTemperature ?? config.temperature };
  }
  return { model: config.model, temperature: config.temperature };
}
