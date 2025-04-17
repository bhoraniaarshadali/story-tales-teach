
import { useState, useEffect } from "react";
import { generateStory } from "../services/storyService";
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
}

export const useStoryManager = () => {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevTopic, setPrevTopic] = useState<string | null>(null);
  const [storyHistory, setStoryHistory] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedStories = localStorage.getItem("storyHistory");
    if (savedStories) {
      setStoryHistory(JSON.parse(savedStories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("storyHistory", JSON.stringify(storyHistory));
  }, [storyHistory]);

  const handleSubmitTopic = async (topic: string) => {
    setIsLoading(true);
    setPrevTopic(topic);
    setError(null); // Clear previous errors
    
    try {
      console.log(`Generating story for topic: "${topic}"`);
      const generatedStory = await generateStory(topic);
      
      // Verify that the story is actually about the requested topic
      if (!generatedStory.content.toLowerCase().includes(topic.toLowerCase())) {
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
      setStory(storyWithMeta);
      setStoryHistory(prev => [storyWithMeta, ...prev]);
      toast.success("Story created successfully!");
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Failed to create story. Please try again.");
      setError(`We couldn't create a story about "${topic}". Please try again or try a different topic.`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (storyId: string) => {
    if (story && story.id === storyId) {
      setStory({
        ...story,
        isFavorite: !story.isFavorite
      });
    }
    
    setStoryHistory(prevHistory => 
      prevHistory.map(item => 
        item.id === storyId 
          ? { ...item, isFavorite: !item.isFavorite } 
          : item
      )
    );
    
    toast.success("Story updated!");
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
    handleSubmitTopic,
    toggleFavorite,
    viewHistoryStory,
    clearHistory,
    handleTryAgain,
    setError
  };
};
