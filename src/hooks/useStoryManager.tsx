import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateStory, UserPreferences, type StoryResponse } from "../services/storyService";
import { supabase } from "@/integrations/supabase/client";
import { storeStoryInDatabase, fetchStories } from "../utils/llmWrapper";
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
  likes?: number;
  dislikes?: number;
}

export const useStoryManager = () => {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevTopic, setPrevTopic] = useState<string | null>(null);
  const [storyHistory, setStoryHistory] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isDatabaseSynced, setIsDatabaseSynced] = useState<boolean>(false);

  // Load story history from localStorage and database
  useEffect(() => {
    const loadStoriesFromLocalStorage = async () => {
      const savedStories = localStorage.getItem("storyHistory");
      let localStories: Story[] = savedStories ? JSON.parse(savedStories) : [];

      // Migrate stories with old "local-" IDs to UUIDs
      const migratedStories = await Promise.all(localStories.map(async (story) => {
        if (story.id && story.id.includes('local-')) {
          const newId = uuidv4();
          const storyData = {
            title: story.title,
            content: story.content,
            takeaway: story.takeaway,
            topic: story.topic || "",
            character: story.character,
            emotions: story.emotions,
            keyPoints: story.keyPoints,
            difficulty: story.difficulty,
            is_public: false,
            likes: story.likes || 0,
            dislikes: story.dislikes || 0
          };

          try {
            await storeStoryInDatabase(storyData);
            console.log(`Migrated story "${story.title}" to UUID: ${newId}`);
            return { ...story, id: newId };
          } catch (error: any) {
            console.error(`Failed to migrate story "${story.title}":`, error.message, error);
            return story;
          }
        }
        return story;
      }));

      setStoryHistory(migratedStories);
      localStorage.setItem("storyHistory", JSON.stringify(migratedStories));
    };

    const loadStoriesFromDatabase = async () => {
      try {
        const data = await fetchStories({ limit: 50, isPublic: false });

        if (data && data.length > 0) {
          const dbStories = data.map(dbStory => ({
            title: dbStory.title || "Untitled Story",
            content: dbStory.content || "No content available.",
            takeaway: dbStory.takeaway || "",
            id: dbStory.id,
            timestamp: dbStory.created_at,
            topic: dbStory.topic || "",
            character: dbStory.character || { name: "Unknown", emoji: "👤" },
            emotions: dbStory.emotions || [],
            keyPoints: dbStory.keyPoints || [],
            difficulty: dbStory.difficulty || "beginner",
            isFavorite: false,
            likes: dbStory.likes || 0,
            dislikes: dbStory.dislikes || 0
          }));

          const localStories = JSON.parse(localStorage.getItem("storyHistory") || "[]");
          const mergedStories = mergeStories(localStories, dbStories);

          setStoryHistory(mergedStories);
          localStorage.setItem("storyHistory", JSON.stringify(mergedStories));
          console.log(`Loaded ${dbStories.length} stories from database and merged with local stories`);
          setIsDatabaseSynced(true);
        } else {
          await loadStoriesFromLocalStorage();
        }
      } catch (error: any) {
        console.error('Error loading stories from database:', error.message, error);
        await loadStoriesFromLocalStorage();
      }
    };

    const loadUserPreferences = () => {
      const savedPreferences = localStorage.getItem("userPreferences");
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
      }
    };

    loadUserPreferences();
    loadStoriesFromDatabase();
  }, []);

  useEffect(() => {
    if (storyHistory.length > 0) {
      localStorage.setItem("storyHistory", JSON.stringify(storyHistory));

      if (isDatabaseSynced) {
        const syncStories = async () => {
          for (const story of storyHistory) {
            if (story.id && !story.id.includes('local-')) {
              continue;
            }

            try {
              const storyData = {
                title: story.title,
                content: story.content,
                takeaway: story.takeaway,
                topic: story.topic || "",
                character: story.character,
                emotions: story.emotions,
                keyPoints: story.keyPoints,
                difficulty: story.difficulty,
                is_public: false,
                likes: story.likes || 0,
                dislikes: story.dislikes || 0
              };

              const newStoryId = await storeStoryInDatabase(storyData);
              console.log(`Story "${story.title}" saved to database with ID: ${newStoryId}`);

              setStoryHistory(prev => prev.map(s =>
                s.id === story.id ? { ...s, id: newStoryId } : s
              ));

              if (story.id === story.id) {
                setStory(prev => prev ? { ...prev, id: newStoryId } : prev);
              }
            } catch (error: any) {
              console.error('Error syncing story to database:', error.message, error);
            }
          }
        };

        syncStories();
      }
    }
  }, [storyHistory, isDatabaseSynced]);

  useEffect(() => {
    if (userPreferences) {
      localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
    }
  }, [userPreferences]);

  const mergeStories = (localStories: Story[], dbStories: Story[]): Story[] => {
    const titleMap = new Map<string, Story>();

    localStories.forEach(story => {
      if (story.title) {
        titleMap.set(story.title, story);
      }
    });

    dbStories.forEach(story => {
      if (story.title) {
        titleMap.set(story.title, story);
      }
    });

    return Array.from(titleMap.values())
      .sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA;
      });
  };

  const updateUserPreferences = (newPreferences: UserPreferences) => {
    setUserPreferences(prev => ({
      ...(prev || {}),
      ...newPreferences
    }));

    toast.success("Your preferences have been updated!");
  };

  const updatePreviousTopics = (topic: string) => {
    if (!userPreferences) return;

    const previousTopics = userPreferences.previousTopics || [];

    const updatedTopics = [
      topic,
      ...previousTopics.filter(t => t !== topic)
    ].slice(0, 5);

    setUserPreferences(prev => ({
      ...(prev || {}),
      previousTopics: updatedTopics
    }));
  };

  const handleSubmitTopic = async (topic: string, usePersonalization = true) => {
    setIsLoading(true);
    setPrevTopic(topic);
    setError(null);

    if (topic !== prevTopic) {
      setRetryCount(0);
    }

    try {
      console.log(`Generating story for topic: "${topic}"${usePersonalization ? " with personalization" : ""}`);

      const preferences = usePersonalization && userPreferences ? userPreferences : undefined;

      if (preferences) {
        console.log("Sending preferences to API:", JSON.stringify(preferences));
      }

      const generatedStory = await generateStory(topic, preferences);

      if (!generatedStory.content.toLowerCase().includes(topic.toLowerCase()) && generatedStory.title.toLowerCase().includes("Oops!")) {
        console.error(`Generated story doesn't contain topic "${topic}"`);
        toast.error(`Story generation failed for topic "${topic}". Please try again.`);
        setError(`We couldn't create a story about "${topic}". Please try again or try a different topic.`);
        setIsLoading(false);
        return;
      }

      const storyWithMeta: Story = {
        ...generatedStory,
        id: `local-${Date.now().toString()}`,
        timestamp: new Date().toISOString(),
        topic: topic,
        isFavorite: false,
        character: generatedStory.character || { name: "Unknown", emoji: "👤" },
        emotions: generatedStory.emotions || [],
        keyPoints: generatedStory.keyPoints || [],
        difficulty: generatedStory.difficulty || "beginner",
        likes: generatedStory.likes || 0,
        dislikes: generatedStory.dislikes || 0
      };

      console.log(`Story generated for topic: "${topic}", title: "${storyWithMeta.title}"`);
      console.log(`Personalization applied:`, storyWithMeta.personalizedFor || "none");

      let newStoryId: string | undefined;
      try {
        const storyData = {
          title: storyWithMeta.title,
          content: storyWithMeta.content,
          takeaway: storyWithMeta.takeaway,
          topic: storyWithMeta.topic,
          character: storyWithMeta.character,
          emotions: storyWithMeta.emotions,
          keyPoints: storyWithMeta.keyPoints,
          difficulty: storyWithMeta.difficulty,
          is_public: false,
          likes: storyWithMeta.likes,
          dislikes: storyWithMeta.dislikes
        };
        newStoryId = await storeStoryInDatabase(storyData);
        console.log('Story saved to database successfully with ID:', newStoryId);
      } catch (dbError: any) {
        console.error('Failed to store story in database:', dbError.message, dbError);
        setError(`Failed to save story to database: ${dbError.message}`);
        toast.error(`Failed to save story to database: ${dbError.message}`);
      }

      if (newStoryId) {
        storyWithMeta.id = newStoryId;
      }

      if (usePersonalization) {
        updatePreviousTopics(topic);
      }

      setStory(storyWithMeta);
      setStoryHistory(prev => [storyWithMeta, ...prev]);

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
    } catch (error: any) {
      console.error("Error generating story:", error.message, error);
      setRetryCount(prevRetry => prevRetry + 1);

      if (retryCount >= 2) {
        toast.error("Multiple generation attempts failed. We're having technical difficulties.");
        setError(`We're having trouble creating stories at the moment. Please try again later or try a different topic. If the issue persists, consider checking your internet connection or contacting support.`);
        const fallbackStory: Story = {
          title: `A Story About ${topic}`,
          content: `We're sorry, but we couldn't generate a story about "${topic}" at this time. Please try again later or choose a different topic.`,
          takeaway: "Sometimes, even the best technology needs a break. Keep exploring!",
          id: `local-${Date.now().toString()}`,
          timestamp: new Date().toISOString(),
          topic: topic,
          isFavorite: false,
          character: { name: "Narrator", emoji: "📖" },
          emotions: ["Apology"],
          keyPoints: [],
          difficulty: "beginner",
          likes: 0,
          dislikes: 0
        };
        setStory(fallbackStory);
        setStoryHistory(prev => [fallbackStory, ...prev]);
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

      if (isNowFavorite) {
        toast.success("Added to favorites!", {
          icon: "❤️"
        });
      } else {
        toast.success("Removed from favorites");
      }
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

    if (isNowFavorite && story?.topic) {
      const currentFavorites = userPreferences?.favoriteTopics || [];
      if (!currentFavorites.includes(story.topic)) {
        updateUserPreferences({
          ...userPreferences,
          favoriteTopics: [...currentFavorites, story.topic].slice(0, 10)
        });
      }
    }
  };

  const viewHistoryStory = (storyId: string) => {
    const selectedStory = storyHistory.find(item => item.id === storyId);
    if (selectedStory) {
      setStory(selectedStory);
      setError(null);
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your story history? This cannot be undone.")) {
      setStoryHistory([]);
      localStorage.setItem("storyHistory", JSON.stringify([]));
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
    updateUserPreferences
  };
};