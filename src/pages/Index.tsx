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
      : 'bg-gradient-to-b from-blue-50 to-indigo-100'
      }`}>
      <AnimatedCursor />

      {/* Enhanced Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/6 w-96 h-96 rounded-full 
          ${theme === 'dark' ? 'bg-purple-700' : 'bg-pink-300'} 
          opacity-20 blur-3xl animate-pulse-slow`}></div>
        <div className={`absolute bottom-1/3 right-1/5 w-64 h-64 rounded-full 
          ${theme === 'dark' ? 'bg-blue-700' : 'bg-indigo-300'} 
          opacity-20 blur-3xl animate-float`}></div>
        <div className={`absolute top-2/3 left-1/3 w-80 h-80 rounded-full 
          ${theme === 'dark' ? 'bg-teal-700' : 'bg-violet-200'} 
          opacity-10 blur-3xl animate-pulse-slow delay-2`}></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8 max-w-full md:max-w-5xl lg:max-w-6xl">

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
          {/* Story Form Container */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 30 }}
            animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`w-full max-w-3xl p-8 rounded-2xl shadow-lg backdrop-blur-sm 
              ${theme === 'dark'
                ? 'bg-gray-800/60 border border-gray-700/50'
                : 'bg-white/80 border border-white/50'}`}
          >
            <StoryForm
              onSubmit={handleSubmitTopic}
              onTopicClick={handleTopicClick}
              isLoading={isLoading}
              userPreferences={userPreferences}
              onUpdatePreferences={updateUserPreferences}
              retryCount={retryCount}
              popularTopics={popularTopics}
              theme={theme}
            />
          </motion.div>

          {/* Loading Spinner */}
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

          {/* Improved Error Message Section - Centered with better styling */}
          <AnimatePresence mode="wait">
            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-10 w-full max-w-md mx-auto"
              >
                <div className={`p-8 rounded-2xl shadow-md text-center ${
                  theme === 'dark' 
                    ? 'bg-gray-800/80 border border-red-500/30' 
                    : 'bg-white/90 border border-red-300/50'
                }`}>
                  <div className="mx-auto w-20 h-20 mb-4">
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-500'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-red-300' : 'text-red-600'
                  }`}>
                    Oops! Something Went Wrong
                  </h3>
                  
                  <p className={`mb-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    We couldn't create a story about "{prevTopic}". Please try again or try a different topic.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={handleTryAgain}
                      className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                        theme === 'dark' 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      Try Again
                    </button>
                    
                    <button 
                      onClick={() => setError(null)}
                      className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Try Another Topic
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story Display */}
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
                    ? 'bg-gray-800/70 border border-gray-700/50'
                    : 'bg-white/80 border border-white/60'}`}
              >
                <StoryDisplay
                  story={story}
                  onToggleFavorite={story?.id ? () => toggleFavorite(story.id as string) : undefined}
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll To Top Button */}
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

        {/* Footer */}
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