
import React from "react";
import StoryForm from "../components/StoryForm";
import StoryDisplay from "../components/StoryDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import SessionTimer from "../components/SessionTimer";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import ErrorMessage from "../components/ErrorMessage";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useStoryManager } from "../hooks/useStoryManager";

// Re-export the Story type for backward compatibility
export type { Story } from "../hooks/useStoryManager";

const Index = () => {
  const {
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
  } = useStoryManager();

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12">
      <div className="container mx-auto px-4">
        <PageHeader 
          stories={storyHistory} 
          onViewStory={viewHistoryStory}
          onToggleFavorite={toggleFavorite}
          onClearHistory={clearHistory}
        />

        {story && <SessionTimer />}

        <div className="flex flex-col items-center justify-center">
          <StoryForm onSubmit={handleSubmitTopic} isLoading={isLoading} />

          {isLoading && (
            <div className="mt-8">
              <LoadingSpinner />
              <p className="mt-2 text-center text-muted-foreground animate-pulse">
                Creating your story about {prevTopic}...
              </p>
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
