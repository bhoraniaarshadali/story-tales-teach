
import React, { useEffect } from "react";
import StoryForm from "../components/StoryForm";
import StoryDisplay from "../components/StoryDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import SessionTimer from "../components/SessionTimer";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import ErrorMessage from "../components/ErrorMessage";
import ScrollToTopButton from "../components/ScrollToTopButton";
import AnimatedCursor from "../components/AnimatedCursor";
import { useStoryManager } from "../hooks/useStoryManager";
import { getStoryIdFromUrl } from "../utils/shareUtils";
import { motion } from "framer-motion";

// Re-export the Story type for backward compatibility
export type { Story } from "../hooks/useStoryManager";

const Index = () => {
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

  // Check for story ID in URL when component mounts
  useEffect(() => {
    const storyId = getStoryIdFromUrl();
    if (storyId) {
      console.log(`Loading shared story with ID: ${storyId}`);
      viewHistoryStory(storyId);
    }
  }, [viewHistoryStory]);

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-6 md:py-12"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      <AnimatedCursor />
      <motion.div 
        className="container mx-auto px-4 max-w-full md:max-w-4xl lg:max-w-5xl"
        variants={pageVariants}
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader
            stories={storyHistory}
            onViewStory={viewHistoryStory}
            onToggleFavorite={toggleFavorite}
            onClearHistory={clearHistory}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SessionTimer />
        </motion.div>

        <div className="flex flex-col items-center justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StoryForm 
              onSubmit={handleSubmitTopic} 
              isLoading={isLoading}
              userPreferences={userPreferences}
              onUpdatePreferences={updateUserPreferences}
              retryCount={retryCount}
            />
          </motion.div>

          {isLoading && (
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingSpinner 
                topic={prevTopic}
                isPersonalized={!!userPreferences}
                retryCount={retryCount}
              />
            </motion.div>
          )}

          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ErrorMessage
                error={error}
                onTryAgain={handleTryAgain}
                onClearError={() => setError(null)}
              />
            </motion.div>
          )}

          {!error && (
            <StoryDisplay
              story={story}
              onToggleFavorite={story?.id ? () => toggleFavorite(story.id) : undefined}
            />
          )}

          {story && !error && <ScrollToTopButton />}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <PageFooter />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Index;
