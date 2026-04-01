// Simple topic analyzer - no external API calls needed
const defaultAnalysis = {
  emotions: ["curious", "interested"],
  category: "general",
  characteristics: ["informative", "educational", "engaging"]
};

export async function analyzeTopicEmotions(topic: string) {
  // Return default analysis without API call to save credits
  return defaultAnalysis;
}
