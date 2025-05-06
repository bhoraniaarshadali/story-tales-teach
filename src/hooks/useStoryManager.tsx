import { useState, useEffect } from "react";
import { generateStory, UserPreferences } from "../services/storyService";
import { toast } from "sonner";

export interface Story {
  title: string;
  content: string;
  takeaway: string;
  id?: string;
  isFavorite?: boolean;
  timestamp?: string;
  topic?: string;
  character?: {
    name: string;
    emoji: string;
    traits?: string;
  };
  emotions?: string[] | string;
  keyPoints?: string[];
  difficulty?: string;
  personalizedFor?: string[];
  retryCount?: number;
  usedFallbackModel?: boolean;
  qualityWarning?: boolean;
}

// Default user preferences
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  readingLevel: "intermediate",
  languagePreference: "hinglish",
  learningStyle: "reading",
  previousTopics: [],
  favoriteTopics: []
};

export const useStoryManager = () => {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevTopic, setPrevTopic] = useState<string | null>(null);
  const [storyHistory, setStoryHistory] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Load story history from localStorage
  useEffect(() => {
    const savedStories = localStorage.getItem("storyHistory");
    if (savedStories) {
      setStoryHistory(JSON.parse(savedStories));
    }
    
    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    } else {
      // Initialize with defaults if nothing is saved
      setUserPreferences(DEFAULT_USER_PREFERENCES);
    }
  }, []);

  // Save story history to localStorage
  useEffect(() => {
    localStorage.setItem("storyHistory", JSON.stringify(storyHistory));
  }, [storyHistory]);

  // Save user preferences to localStorage
  useEffect(() => {
    if (userPreferences) {
      localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
    }
  }, [userPreferences]);

  // Update user preferences
  const updateUserPreferences = (newPreferences: UserPreferences) => {
    setUserPreferences(prev => ({
      ...(prev || DEFAULT_USER_PREFERENCES),
      ...newPreferences
    }));
    
    toast.success("Your preferences have been updated!");
  };

  // Reset user preferences to defaults but keep history
  const resetUserPreferences = () => {
    const currentHistory = {
      previousTopics: userPreferences?.previousTopics || [],
      favoriteTopics: userPreferences?.favoriteTopics || []
    };
    
    setUserPreferences({
      ...DEFAULT_USER_PREFERENCES,
      ...currentHistory
    });
    
    toast.success("Preferences reset to defaults");
  };

  // Track user's previous topics
  const updatePreviousTopics = (topic: string) => {
    if (!userPreferences) return;
    
    const previousTopics = userPreferences.previousTopics || [];
    
    // Add the new topic to the beginning of the list and keep only the last 5
    const updatedTopics = [
      topic,
      ...previousTopics.filter(t => t !== topic)
    ].slice(0, 5);
    
    setUserPreferences(prev => ({
      ...(prev || DEFAULT_USER_PREFERENCES),
      previousTopics: updatedTopics
    }));
  };

  const handleSubmitTopic = async (topic: string, usePersonalization = true) => {
    setIsLoading(true);
    setPrevTopic(topic);
    setError(null); // Clear previous errors
    
    // If it's not a retry of the same topic, reset the retry counter
    if (topic !== prevTopic) {
      setRetryCount(0);
    }

    try {
      console.log(`Generating story for topic: "${topic}"${usePersonalization ? " with personalization" : ""}`);
      
      // If personalization is enabled and we have preferences, use them
      const preferences = usePersonalization && userPreferences ? userPreferences : undefined;
      
      // Log preferences to help debug
      if (preferences) {
        console.log("Sending preferences to API:", JSON.stringify(preferences));
      }
      
      const generatedStory = await generateStory(topic, preferences);

      // Verify that the story is actually about the requested topic
      if (!generatedStory.content.toLowerCase().includes(topic.toLowerCase()) && generatedStory.title.toLowerCase().includes("Oops!")) {
        console.error(`Generated story doesn't contain topic "${topic}"`);
        toast.error(`Story generation failed for topic "${topic}". Please try again.`);
        setError(`We couldn't create a story about "${topic}". Please try again or try a different topic.`);
        setIsLoading(false);
        return;
      }

      // Ensure the topic is saved in the story
      const storyWithMeta: Story = {
        ...generatedStory,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        topic: topic, // Make sure we set the topic explicitly here
        isFavorite: false
      };

      console.log(`Story generated for topic: "${topic}", title: "${storyWithMeta.title}"`);
      console.log(`Personalization applied:`, storyWithMeta.personalizedFor || "none");
      
      // Update previous topics if personalization is enabled
      if (usePersonalization) {
        updatePreviousTopics(topic);
      }
      
      setStory(storyWithMeta);
      setStoryHistory(prev => [storyWithMeta, ...prev]);
      
      // Show appropriate toast based on generation information
      if (storyWithMeta.retryCount && storyWithMeta.retryCount > 0) {
        if (storyWithMeta.usedFallbackModel) {
          toast.info("We had to use our backup system to create your story due to technical issues.");
        } else if (storyWithMeta.retryCount >= 3) {
          toast.warning("We encountered some challenges generating your story, but succeeded after multiple attempts.");
        } else if (storyWithMeta.qualityWarning) {
          toast.info("Your story is ready, but may not fully cover the topic. Feel free to try again.");
        }
      } else if (usePersonalization && userPreferences && storyWithMeta.personalizedFor?.length) {
        toast.success("Personalized story created just for you!");
      } else {
        toast.success("Story created successfully!");
      }
    } catch (error) {
      console.error("Error generating story:", error);
      setRetryCount(prevRetry => prevRetry + 1);
      
      if (retryCount >= 2) {
        toast.error("Multiple generation attempts failed. We're having technical difficulties.");
        setError(`We're having trouble creating stories at the moment. Please try again later or try a different topic.`);
      } else {
        toast.error("Failed to create story. Please try again.");
        setError(`We couldn't create a story about "${topic}". Please try again or try a different topic.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (storyId: string) => {
    let isNowFavorite = false;
    if (story && story.id === storyId) {
      isNowFavorite = !story.isFavorite;
      setStory({
        ...story,
        isFavorite: isNowFavorite
      });
    } else {
      const found = storyHistory.find(item => item.id === storyId);
      if (found) {
        isNowFavorite = !found.isFavorite;
      }
    }

    setStoryHistory(prevHistory =>
      prevHistory.map(item =>
        item.id === storyId
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      )
    );

    // Update favorites in user preferences
    if (isNowFavorite && story?.topic) {
      const currentFavorites = userPreferences?.favoriteTopics || [];
      if (!currentFavorites.includes(story.topic)) {
        updateUserPreferences({
          ...userPreferences,
          favoriteTopics: [...currentFavorites, story.topic].slice(0, 10) // Keep only 10 favorites
        });
      }
    }

    if (isNowFavorite) {
      toast.success("Story added to favorites!");
    } else {
      toast.success("Story removed from favorites!");
    }
  };

  const viewHistoryStory = (storyId: string) => {
    const selectedStory = storyHistory.find(item => item.id === storyId);
    if (selectedStory) {
      setStory(selectedStory);
      setError(null); // Clear any errors when viewing history
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your story history? This cannot be undone.")) {
      setStoryHistory([]);
      toast.success("History cleared successfully");
    }
  };

  const handleTryAgain = () => {
    if (prevTopic) {
      handleSubmitTopic(prevTopic);
    }
  };

  return {
    story,
    isLoading,
    error,
    prevTopic,
    storyHistory,
    userPreferences,
    retryCount,
    handleSubmitTopic,
    toggleFavorite,
    viewHistoryStory,
    clearHistory,
    handleTryAgain,
    setError,
    updateUserPreferences,
    resetUserPreferences
  };
};
