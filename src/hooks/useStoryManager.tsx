import { useState, useEffect } from "react";
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

  // Predefined story to ensure it’s available
  const predefinedStory: Story = {
    id: "solar-system-1",
    title: "Discovering the Wonders of the Solar System",
    content: `
**Discovering the Wonders of the Solar System**

*Dhruv*  
*Emotions: Curiosity, Awe, Determination*

### A Spark in the Night Sky  
Dhruv had always felt small under the vast night sky. On a chilly evening, wrapped in a blanket, he sat on his rooftop with his grandfather, staring at the twinkling stars. “Baba, what are those lights?” he asked, his eyes wide with wonder.  
“They’re stars, Dhruv,” his grandfather replied with a warm smile. “And our Sun is a star too—the heart of our Solar System, holding a family of planets in its gravitational embrace.”  
Dhruv’s curiosity ignited like a rocket. “A family of planets?” he whispered, imagining himself as an astronaut soaring through space. He decided then and there to uncover the secrets of the Solar System.

### A Journey Through the Cosmos  
The next day, Dhruv dove into his books, his imagination transforming his room into a spaceship cockpit. He learned that the Solar System is a grand orchestra of eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Each planet was a unique character in this cosmic story.  
Mercury, the smallest, zipped around the Sun like a speedy messenger, while Jupiter, a colossal gas giant, swirled with fiery storms, its Great Red Spot a raging hurricane bigger than Earth itself. Dhruv’s jaw dropped when he read that the Sun, a blazing ball of fire, made up 99.8% of the Solar System’s mass. “It’s like the Sun is the parent, and the planets are its children!” he exclaimed.  
But understanding the vast distances between planets was hard. Dhruv felt overwhelmed, thinking, *“How can something so big even exist?”* His friend Rohan noticed his frustration and suggested, “Why don’t we make a model of the Solar System? It might help!”  

### A Model That Brings It All Together  
Dhruv and Rohan gathered marbles, balls, and string to create a scale model in Dhruv’s backyard. They placed a basketball as the Sun and used a tiny bead for Mercury, a tennis ball for Jupiter, and a glowing sticker for Earth. As they laid out the planets, Dhruv began to see the Solar System come to life. “Look, Rohan! Venus spins the opposite way—like it’s dancing to its own beat!” Dhruv said, his earlier frustration melting into excitement.  
Rohan grinned. “And did you know Saturn’s rings are made of ice and rock? It’s like the Solar System’s jewelry!”  
As they worked, Dhruv realized the planets reminded him of his own family. “Jupiter is like my big brother, always taking up space,” he laughed, “and Mercury is like my little cousin, always running around!” This connection made the Solar System feel closer, like a family he could understand.

> *"The universe is a pretty big place. If it’s just us, it seems like an awful waste of space."* — Dhruv whispered, feeling the weight of the cosmos.

### A New Perspective  
That night, Dhruv looked up at the stars again, but this time, he felt different. The Solar System wasn’t just a collection of facts—it was a story of harmony, where every planet played its part around the Sun. Dhruv thought, *“Just like the planets, I have my own place in the universe. I need to keep exploring, keep learning, and live in balance with the world around me.”*  
Filled with awe, Dhruv whispered to the stars, “This is just the beginning. I’ll keep discovering the wonders of the cosmos!”

**Try This:** Create your own Solar System model using everyday objects. How does it help you understand the distances and sizes of the planets?
    `,
    takeaway: "Exploring the Solar System teaches us about our place in the universe and inspires us to live in harmony with nature.",
    timestamp: new Date().toISOString(),
    topic: "Solar System",
    character: {
      name: "Dhruv",
      emoji: "🚀",
      traits: "curious, imaginative, determined"
    },
    emotions: ["Curiosity", "Awe", "Determination"],
    keyPoints: [
      "The Solar System includes eight planets, each with unique traits, orbiting the Sun.",
      "The Sun’s gravity holds the Solar System together, just like a family bond.",
      "Building a model can make the vastness of space feel more relatable.",
      "The Solar System reminds us to find balance and wonder in our own lives."
    ],
    difficulty: "beginner",
    isFavorite: false,
    likes: 0,
    dislikes: 0
  };

  // Load story history from localStorage and database
  useEffect(() => {
    const loadStoriesFromLocalStorage = () => {
      const savedStories = localStorage.getItem("storyHistory");
      if (savedStories) {
        const parsedStories = JSON.parse(savedStories);
        // Ensure the predefined story is included
        const hasPredefinedStory = parsedStories.some((s: Story) => s.id === predefinedStory.id);
        if (!hasPredefinedStory) {
          parsedStories.push(predefinedStory);
        }
        setStoryHistory(parsedStories);
      } else {
        // If no stories in localStorage, initialize with predefined story
        setStoryHistory([predefinedStory]);
        localStorage.setItem("storyHistory", JSON.stringify([predefinedStory]));
      }
    };

    const loadStoriesFromDatabase = async () => {
      try {
        // Fetch stories from the database
        const data = await fetchStories({ limit: 50, isPublic: false });

        if (data && data.length > 0) {
          // Convert database stories to the format expected by the app
          const dbStories = data.map(dbStory => ({
            title: dbStory.title,
            content: dbStory.content,
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

          // Merge with any local stories, ensuring predefined story is included
          const localStories = JSON.parse(localStorage.getItem("storyHistory") || "[]");
          const hasPredefinedStory = localStories.some((s: Story) => s.id === predefinedStory.id);
          if (!hasPredefinedStory) {
            localStories.push(predefinedStory);
          }
          const mergedStories = mergeStories(localStories, dbStories);

          setStoryHistory(mergedStories);
          localStorage.setItem("storyHistory", JSON.stringify(mergedStories));
          console.log(`Loaded ${dbStories.length} stories from database and merged with local stories`);
          setIsDatabaseSynced(true);
        } else {
          // If no stories in database, ensure predefined story is in localStorage
          loadStoriesFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading stories from database:', error);
        loadStoriesFromLocalStorage();
      }
    };

    // Load user preferences from localStorage
    const loadUserPreferences = () => {
      const savedPreferences = localStorage.getItem("userPreferences");
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
      }
    };

    loadUserPreferences();
    loadStoriesFromDatabase();
  }, []);

  // Save story history to localStorage and sync with database
  useEffect(() => {
    if (storyHistory.length > 0) {
      localStorage.setItem("storyHistory", JSON.stringify(storyHistory));

      if (isDatabaseSynced) {
        storyHistory.forEach(async (story) => {
          if (story.id && !story.id.includes('local-') && story.id !== predefinedStory.id) {
            return; // Skip stories already in database or the predefined story
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
            await storeStoryInDatabase(storyData);
            console.log(`Story "${story.title}" saved to database successfully`);
          } catch (error) {
            console.error('Error syncing story to database:', error);
          }
        });
      }
    }
  }, [storyHistory, isDatabaseSynced]);

  // Save user preferences to localStorage
  useEffect(() => {
    if (userPreferences) {
      localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
    }
  }, [userPreferences]);

  // Helper to merge stories from different sources avoiding duplicates
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

  // Update user preferences
  const updateUserPreferences = (newPreferences: UserPreferences) => {
    setUserPreferences(prev => ({
      ...(prev || {}),
      ...newPreferences
    }));

    toast.success("Your preferences have been updated!");
  };

  // Track user's previous topics
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
        likes: 0,
        dislikes: 0
      };

      console.log(`Story generated for topic: "${topic}", title: "${storyWithMeta.title}"`);
      console.log(`Personalization applied:`, storyWithMeta.personalizedFor || "none");

      try {
        await storeStoryInDatabase({
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
        });
        console.log('Story saved to database successfully');
      } catch (dbError) {
        console.error('Failed to store story in database:', dbError);
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
      setStoryHistory([predefinedStory]); // Keep the predefined story
      localStorage.setItem("storyHistory", JSON.stringify([predefinedStory]));
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