
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-6 md:py-12">
      <AnimatedCursor />
      <div className="container mx-auto px-4 max-w-full md:max-w-4xl lg:max-w-5xl">
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
            <div className="mt-8">
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
              onToggleFavorite={story?.id ? () => toggleFavorite(story.id) : undefined}
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
