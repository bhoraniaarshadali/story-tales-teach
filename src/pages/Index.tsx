import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../auth/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
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
import { getStoryIdFromUrl, getSourceDomain } from "../utils/shareUtils";
import { toast } from "sonner";
import { analyzePopularTopics } from "../utils/llmWrapper";

// Re-export the Story type for backward compatibility
export type { Story } from "../hooks/useStoryManager";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [popularTopics, setPopularTopics] = useState<{topic: string, count: number}[]>([]);

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

  // Load popular topics on component mount
  useEffect(() => {
    const loadPopularTopics = async () => {
      try {
        const topics = await analyzePopularTopics();
        setPopularTopics(topics);
        console.log("Popular topics loaded:", topics);
      } catch (error) {
        console.error("Error loading popular topics:", error);
      }
    };
    
    loadPopularTopics();
  }, []);

  // Check for story ID in URL and source domain when component mounts
  useEffect(() => {
    const checkForSharedStory = async () => {
      try {
        const storyId = getStoryIdFromUrl();
        if (storyId) {
          console.log(`Detected shared story ID: ${storyId}`);
          
          // Track the source domain for analytics
          const sourceDomain = getSourceDomain();
          if (sourceDomain) {
            console.log(`Story was shared from: ${sourceDomain}`);
            // You could record this in analytics here
          }

          // Check if the story exists in history
          const existsInHistory = storyHistory.some(s => s.id === storyId);

          if (existsInHistory) {
            // If it exists locally, just view it
            console.log("Story found in local history, displaying");
            viewHistoryStory(storyId);
            // Scroll to story after a short delay to ensure rendering
            setTimeout(() => {
              const storyElement = document.getElementById('story-display');
              if (storyElement) {
                storyElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          } else {
            // If not in local history, redirect to the share page
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
    // We only want this to run once on mount and when storyHistory changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyHistory.length]);

  // Handle URL changes during navigation (browser back/forward)
  useEffect(() => {
    if (initialLoadComplete) {
      const handleLocationChange = () => {
        const storyId = getStoryIdFromUrl();
        if (storyId && storyHistory.some(s => s.id === storyId)) {
          viewHistoryStory(storyId);
        } else if (!storyId && story) {
          // User navigated back to root, clear current story if needed
          // This could be optional behavior
        }
      };

      handleLocationChange();
    }
  }, [location.pathname, initialLoadComplete, storyHistory, viewHistoryStory, story]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* User menu for authenticated users */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.name || user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

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
            popularTopics={popularTopics}
          />
          {isLoading && (
            <div className="mt-8">
              <LoadingSpinner
                topic={prevTopic}
                isPersonalized={!!userPreferences && Object.keys(userPreferences).length > 0}
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
          {!error && story && (
            <div id="story-display">
              <StoryDisplay
                story={story}
                onToggleFavorite={story?.id ? () => toggleFavorite(story.id as string) : undefined}
              />
            </div>
          )}
          {story && !error && <ScrollToTopButton />}
        </div>
        <PageFooter />
      </div>
    </div>
  );
};

export default Index;
