import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Components
import StoryForm from "../components/StoryForm";
import StoryDisplay from "../components/StoryDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import SessionTimer from "../components/SessionTimer";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import ErrorMessage from "../components/ErrorMessage";
import ScrollToTopButton from "../components/ScrollToTopButton";
import AnimatedCursor from "../components/AnimatedCursor";
import ThemeToggle from "../components/ThemeToggle";

// Hooks and Utils
import { useStoryManager } from "../hooks/useStoryManager";
import { getStoryIdFromUrl, getSourceDomain } from "../utils/shareUtils";
import { analyzePopularTopics } from "../utils/llmWrapper";
import { useInView } from "react-intersection-observer";

// Re-export the Story type for backward compatibility
export type { Story } from "../hooks/useStoryManager";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [popularTopics, setPopularTopics] = useState<{ topic: string, count: number }[]>([]);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [formRef, formInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [storyRef, storyInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const {
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
  } = useStoryManager();

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const loadPopularTopics = async () => {
      try {
        const topics = await analyzePopularTopics();
        setPopularTopics(topics);
        console.log("Popular topics loaded:", topics);
      } catch (error) {
        console.error("Error loading popular topics:", error);
        toast.error("Couldn't load trending topics. Try refreshing.");
      }
    };

    loadPopularTopics();
  }, []);

  useEffect(() => {
    const checkForSharedStory = async () => {
      try {
        const storyId = getStoryIdFromUrl();
        if (storyId) {
          console.log(`Detected shared story ID: ${storyId}`);

          const sourceDomain = getSourceDomain();
          if (sourceDomain) {
            console.log(`Story was shared from: ${sourceDomain}`);
          }

          const existsInHistory = storyHistory.some(s => s.id === storyId);

          if (existsInHistory) {
            console.log("Story found in local history, displaying");
            viewHistoryStory(storyId);
            setTimeout(() => {
              const storyElement = document.getElementById('story-display');
              if (storyElement) {
                storyElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          } else {
            console.log("Story not found in local history, redirecting to share page");
            navigate(`/share/${storyId}`);
          }
        }
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error processing shared story:", error);
        toast.error("There was a problem loading the shared story.");
        setInitialLoadComplete(true);
      }
    };

    checkForSharedStory();
  }, [storyHistory.length, navigate, viewHistoryStory]);

  useEffect(() => {
    if (initialLoadComplete) {
      const handleLocationChange = () => {
        const storyId = getStoryIdFromUrl();
        if (storyId && storyHistory.some(s => s.id === storyId)) {
          viewHistoryStory(storyId);
        }
      };

      handleLocationChange();
    }
  }, [location.pathname, initialLoadComplete, storyHistory, viewHistoryStory]);

  // Helper function to convert topic to URL-friendly format
  const topicToUrl = (topic: string) => {
    return topic.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  // Callback for navigating to a topic-specific page
  const handleTopicClick = (topic: string) => {
    const urlFriendlyTopic = topicToUrl(topic);
    navigate(`/${urlFriendlyTopic}-story`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
      ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white'
      : 'bg-gradient-to-b from-blue-50 to-violet-50'
      }`}>
      <AnimatedCursor />

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/6 w-96 h-96 rounded-full 
          ${theme === 'dark' ? 'bg-purple-700' : 'bg-pink-300'} 
          opacity-10 blur-3xl`}></div>
        <div className={`absolute bottom-1/3 right-1/5 w-64 h-64 rounded-full 
          ${theme === 'dark' ? 'bg-blue-700' : 'bg-indigo-300'} 
          opacity-10 blur-3xl`}></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8 max-w-full md:max-w-5xl lg:max-w-6xl">
        <div className="flex justify-end mb-4">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader
            stories={storyHistory}
            onViewStory={viewHistoryStory}
            onToggleFavorite={toggleFavorite}
            onClearHistory={clearHistory}
            theme={theme}
          />
        </motion.div>

        <div className="flex justify-end mt-2 mb-4">
          <SessionTimer theme={theme} />
        </div>

        <div className="flex flex-col items-center justify-center">
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 30 }}
            animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`w-full max-w-3xl p-6 rounded-2xl shadow-lg backdrop-blur-sm 
              ${theme === 'dark'
                ? 'bg-gray-800/40 border border-gray-700/50'
                : 'bg-white/60 border border-white/50'}`}
          >
            <StoryForm
              onSubmit={handleSubmitTopic}
              onTopicClick={handleTopicClick} // Pass the navigation callback
              isLoading={isLoading}
              userPreferences={userPreferences}
              onUpdatePreferences={updateUserPreferences}
              retryCount={retryCount}
              popularTopics={popularTopics}
              theme={theme}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-8 w-full flex justify-center"
              >
                <LoadingSpinner
                  topic={prevTopic}
                  isPersonalized={!!userPreferences && Object.keys(userPreferences).length > 0}
                  retryCount={retryCount}
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-8 w-full"
              >
                <ErrorMessage
                  error={error}
                  onTryAgain={handleTryAgain}
                  onClearError={() => setError(null)}
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!error && story && (
              <motion.div
                id="story-display"
                ref={storyRef}
                initial={{ opacity: 0, y: 40 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`mt-12 w-full max-w-4xl p-8 rounded-3xl shadow-xl backdrop-blur-sm
                  ${theme === 'dark'
                    ? 'bg-gray-800/60 border border-gray-700/50'
                    : 'bg-white/70 border border-white/60'}`}
              >
                <StoryDisplay
                  story={story}
                  onToggleFavorite={story?.id ? () => toggleFavorite(story.id as string) : undefined}
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {story && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
            >
              <ScrollToTopButton theme={theme} />
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-16"
        >
          <PageFooter theme={theme} />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;