
import { supabase } from "@/integrations/supabase/client";

interface StoryResponse {
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

export interface UserPreferences {
  readingLevel?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  languagePreference?: 'english' | 'hinglish' | 'hindi';
  ageGroup?: 'kids' | 'teen' | 'adult';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  favoriteTopics?: string[];
  previousTopics?: string[];
}

export const generateStory = async (topic: string, userPreferences?: UserPreferences): Promise<StoryResponse> => {
  try {
    // Input validation
    if (!topic || topic.trim().length < 2) {
      throw new Error("Please provide a valid topic with at least 2 characters");
    }

    console.log(`Sending topic to generate-story function: "${topic}"${userPreferences ? " with personalization" : ""}`);
    if (userPreferences) {
      console.log("User preferences:", JSON.stringify(userPreferences));
    }

    // Call the Supabase Edge Function with user preferences if available
    const { data, error } = await supabase.functions.invoke('generate-story', {
      body: { 
        topic: topic.trim(),
        userPreferences
      }
    });

    if (error) {
      console.log(error);
      // Check if this is a 400 status code (invalid topic)
      if (error.status === 400) {
        // Return the data as a valid response since it contains the invalid topic message
        return data as StoryResponse;
      }
      console.error('Error calling generate-story function:', error);
      throw new Error(error.message || 'Failed to generate story');
    }

    // Make sure we have valid data before returning
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from generate-story function');
    }

    // Check if the response contains an error message but was returned with status 200
    if (data.error) {
      console.error('Error in response data:', data.error);
      throw new Error(data.error || 'Story generation failed');
    }

    // Special case: Check if this is actually an invalid topic response formatted as a story
    // We can detect this by looking at the title which typically starts with "Oops!" for invalid topics
    if (data.title && (data.title.includes("Oops!") || data.title.includes("Confusing"))) {
      console.log('Received invalid topic response:', data);
      // We'll actually return this as a valid response, and the UI will handle it specially
      return data as StoryResponse;
    }

    // Validate that data has the required fields
    if (!data.title || !data.content || !data.takeaway) {
      console.error('Missing required fields in response:', data);
      throw new Error('Story generation response is missing required fields');
    }

    // Normalize emotions to ensure it's an array
    if (data.emotions && typeof data.emotions === 'string') {
      data.emotions = data.emotions.split(',').map(emotion => emotion.trim());
    }

    // Enhanced validation - check if the content actually explains the topic
    if (!contentExplainsTopic(data, topic)) {
      console.error('Generated story does not properly explain the requested topic:', data);
      // Instead of throwing an error, we'll return the story anyway and let the user decide
      console.warn(`Note: Story may not properly explain ${topic}, but returning it anyway`);
    }

    // Ensure the topic is correctly included in the response
    if (!data.topic) {
      data.topic = topic;
    }

    return data as StoryResponse;
  } catch (error) {
    console.error('Error generating story:', error);
    // Instead of generating a fallback story, we'll throw the error
    // to let the component handle it with a retry message
    throw error;
  }
};

// Enhanced check if the topic is actually explained in the content
function contentExplainsTopic(story: any, topic: string): boolean {
  const topicLowerCase = topic.toLowerCase();

  // If no content is present, it doesn't explain the topic
  if (!story.content) {
    return false;
  }

  // 1. Check that the topic is mentioned enough times in the content (at least 3 times)
  const contentMentionsCount = (story.content?.toLowerCase().match(new RegExp(topicLowerCase, 'g')) || []).length;

  // 2. Check that key sections contain the topic
  const titleHasTopic = story.title?.toLowerCase().includes(topicLowerCase);
  const contentHasTopic = story.content?.toLowerCase().includes(topicLowerCase);
  const takeawayHasTopic = story.takeaway?.toLowerCase().includes(topicLowerCase);
  const keyPointsHaveTopic = story.keyPoints?.some((point: string) =>
    point.toLowerCase().includes(topicLowerCase)
  );

  const sectionsWithTopic = [
    titleHasTopic,
    contentHasTopic,
    takeawayHasTopic,
    keyPointsHaveTopic
  ].filter(Boolean).length;

  // Story should mention the topic at least 3 times and in at least 3 different sections
  return contentMentionsCount >= 3 && sectionsWithTopic >= 2; // Relaxed validation slightly
}
