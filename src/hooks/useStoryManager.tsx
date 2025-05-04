
import { useState, useEffect } from "react";
import { generateStory } from "../services/storyService";
import { toast } from "sonner";
import type { UserPreferenceData } from "../components/UserPreferences";

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
  readingLevel?: string;
  recommendedAge?: string;
  personalized?: boolean;
}

export const useStoryManager = () => {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevTopic, setPrevTopic] = useState<string | null>(null);
  const [storyHistory, setStoryHistory] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferenceData | null>(null);

  useEffect(() => {
    const savedStories = localStorage.getItem("storyHistory");
    if (savedStories) {
      setStoryHistory(JSON.parse(savedStories));
    }
    
    // Load user preferences if available
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("storyHistory", JSON.stringify(storyHistory));
  }, [storyHistory]);

  const handleSubmitTopic = async (topic: string, newPreferences?: UserPreferenceData) => {
    setIsLoading(true);
    setPrevTopic(topic);
    setError(null); // Clear previous errors
    
    // Update user preferences if provided
    if (newPreferences) {
      setUserPreferences(newPreferences);
    }

    try {
      console.log(`Generating story for topic: "${topic}"${newPreferences ? " with user preferences" : ""}`);
      const generatedStory = await generateStory(topic, newPreferences || userPreferences);

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
        isFavorite: false,
        personalized: !!generatedStory.personalized
      };

      console.log(`Story generated for topic: "${topic}", title: "${storyWithMeta.title}"`);
      setStory(storyWithMeta);
      setStoryHistory(prev => [storyWithMeta, ...prev]);
      
      if (storyWithMeta.personalized) {
        toast.success("Personalized story created successfully!");
      } else {
        toast.success("Story created successfully!");
      }
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Failed to create story. Please try again.");
      setError(`We couldn't create a story about "${topic}". Please try again or try a different topic.`);
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
      handleSubmitTopic(prevTopic, userPreferences || undefined);
    }
  };
  
  const updateUserPreferences = (newPreferences: UserPreferenceData) => {
    setUserPreferences(newPreferences);
    localStorage.setItem("userPreferences", JSON.stringify(newPreferences));
  };

  return {
    story,
    isLoading,
    error,
    prevTopic,
    storyHistory,
    userPreferences,
    handleSubmitTopic,
    toggleFavorite,
    viewHistoryStory,
    clearHistory,
    handleTryAgain,
    updateUserPreferences,
    setError
  };
};
