
// index.tsx
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
import { toast } from "sonner";

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
      
      // Find the story in the history
      const foundStory = storyHistory.find(s => s.id === storyId);
      
      if (foundStory) {
        viewHistoryStory(storyId);
        toast.success("Shared story loaded successfully!");
      } else {
        // Attempt to load the story if it's not in the history
        // This could happen if the story is in the database but not in the local history
        viewHistoryStory(storyId);
        toast.info("Attempting to load shared story...");
      }
    }
  }, [viewHistoryStory, storyHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-8 sm:py-12">
      <AnimatedCursor />
      <div className="container mx-auto px-4">
        <PageHeader
          stories={storyHistory}
          onViewStory={viewHistoryStory}
          onToggleFavorite={toggleFavorite}
          onClearHistory={clearHistory}
        />

        <SessionTimer />

        <div className="flex flex-col items-center justify-center">
          <StoryForm 
            onSubmit={handleSubmitTopic} 
            isLoading={isLoading}
            userPreferences={userPreferences}
            onUpdatePreferences={updateUserPreferences}
            retryCount={retryCount}
          />

          {isLoading && (
            <div className="mt-6 sm:mt-8">
              <LoadingSpinner 
                topic={prevTopic}
                isPersonalized={!!userPreferences}
                retryCount={retryCount}
              />
            </div>
          )}

          {error && !isLoading && (
            <ErrorMessage
              error={error}
              onTryAgain={handleTryAgain}
              onClearError={() => setError(null)}
            />
          )}

          {!error && (
            <StoryDisplay
              story={story}
              onToggleFavorite={story?.id ? () => toggleFavorite(story.id!) : undefined}
            />
          )}

          {story && !error && <ScrollToTopButton />}
        </div>

        <PageFooter />
      </div>
    </div>
  );
};

export default Index;
