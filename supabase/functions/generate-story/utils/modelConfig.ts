// Global configuration for AI model settings
// Uses Google Gemini API directly for reliable story generation

export const defaultStoryModelConfig = {
  model: "gemini-2.0-flash",
  temperature: 0.9,
  top_p: 0.9,
  max_tokens: 1024,
  provider: 'google',
  maxRetries: 3,
  fallbackModel: "gemini-2.0-flash-lite",
};

export const analyticalModelConfig = {
  model: "gemini-2.0-flash-lite",
  temperature: 0.3,
  top_p: 0.95,
  max_tokens: 300,
  provider: 'google',
  maxRetries: 3,
  fallbackModel: "gemini-2.0-flash-lite",
};

export const personalizedStoryConfig = {
  model: "gemini-2.0-flash",
  temperature: 0.85,
  top_p: 0.92,
  max_tokens: 1500,
  provider: 'google',
  maxRetries: 3,
  fallbackModel: "gemini-2.0-flash-lite",
};

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
