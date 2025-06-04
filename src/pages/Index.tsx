
import React, { useEffect, useState } from "react";
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
import UserMenu from "../components/UserMenu";
import { useStoryManager } from "../hooks/useStoryManager";
import { getStoryIdFromUrl, getSourceDomain } from "../utils/shareUtils";
import { toast } from "sonner";
import { analyzePopularTopics } from "../utils/llmWrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

// Re-export the Story type for backward compatibility
export type { Story } from "../hooks/useStoryManager";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-accent/10">
        <AnimatedCursor />
        
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary leading-none">Story Tales</h1>
                <p className="text-xs text-muted-foreground leading-none">Teach</p>
              </div>
            </motion.div>
            <UserMenu />
          </div>
        </header>

        {/* Mobile Content */}
        <main className="pb-20">
          <div className="pt-6">
            <StoryForm
              onSubmit={handleSubmitTopic}
              isLoading={isLoading}
              userPreferences={userPreferences}
              onUpdatePreferences={updateUserPreferences}
              retryCount={retryCount}
              popularTopics={popularTopics}
            />
            
            {isLoading && (
              <div className="px-4 mt-8">
                <LoadingSpinner
                  topic={prevTopic}
                  isPersonalized={!!userPreferences && Object.keys(userPreferences).length > 0}
                  retryCount={retryCount}
                />
              </div>
            )}
            
            {error && !isLoading && (
              <div className="px-4 mt-8">
                <ErrorMessage
                  error={error}
                  onTryAgain={handleTryAgain}
                  onClearError={() => setError(null)}
                />
              </div>
            )}
            
            {!error && story && (
              <div id="story-display" className="mt-8">
                <StoryDisplay
                  story={story}
                  onToggleFavorite={story?.id ? () => toggleFavorite(story.id as string) : undefined}
                />
              </div>
            )}
            
            {story && !error && <ScrollToTopButton />}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t px-4 py-3">
          <PageHeader
            stories={storyHistory}
            onViewStory={viewHistoryStory}
            onToggleFavorite={toggleFavorite}
            onClearHistory={clearHistory}
            isMobile={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-6 md:py-12">
      <AnimatedCursor />
      <div className="container mx-auto px-4 max-w-full md:max-w-4xl lg:max-w-5xl">
        {/* Desktop Header with User Menu */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Story Tales Teach</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Learning Stories</p>
            </div>
          </motion.div>
          <UserMenu />
        </div>

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
