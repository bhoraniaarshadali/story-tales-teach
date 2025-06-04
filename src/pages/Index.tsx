
import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { LogOut, User, Sparkles, Star, BookOpen, TrendingUp } from "lucide-react";
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
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Re-export the Story type for backward compatibility
export type { Story } from "../hooks/useStoryManager";

const Index = () => {
  const { user, signOut } = useAuth();
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

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut]);

  const favoriteCount = storyHistory.filter(s => s.isFavorite).length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Gradient Mesh */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Glass Morphism Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-purple-400 h-8 w-8" />
              <span className="text-2xl font-bold text-white">Story Tales Teach</span>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm"
              >
                <User className="h-4 w-4 text-purple-300" />
                <span className="text-sm text-white/90">
                  {user?.name || user?.email}
                </span>
              </motion.div>
              
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {!isMobile && "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatedCursor />
      
      {/* Main Content */}
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center py-16 md:py-24"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-6"
            >
              <Sparkles className="h-16 w-16 text-yellow-400 mx-auto" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Learn Through
              </span>
              <br />
              <span className="text-white">Stories</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              Transform any topic into an engaging, personalized story. 
              Experience unforgettable learning through immersive storytelling in Hindi, English, and Hinglish.
            </p>

            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  <span className="text-white font-semibold">{storyHistory.length} Stories</span>
                </div>
              </motion.div>
              
              {favoriteCount > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-semibold">{favoriteCount} Favorites</span>
                  </div>
                </motion.div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-white font-semibold">AI Powered</span>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Story Generation Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <StoryForm
                  onSubmit={handleSubmitTopic}
                  isLoading={isLoading}
                  userPreferences={userPreferences}
                  onUpdatePreferences={updateUserPreferences}
                  retryCount={retryCount}
                  popularTopics={popularTopics}
                />
              </CardContent>
            </Card>
          </motion.section>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-16"
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardContent className="p-8">
                  <LoadingSpinner
                    topic={prevTopic}
                    isPersonalized={!!userPreferences && Object.keys(userPreferences).length > 0}
                    retryCount={retryCount}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-16"
            >
              <ErrorMessage
                error={error}
                onTryAgain={handleTryAgain}
                onClearError={() => setError(null)}
              />
            </motion.div>
          )}

          {/* Story Display */}
          {!error && story && (
            <motion.div
              id="story-display"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <StoryDisplay
                    story={story}
                    onToggleFavorite={story?.id ? () => toggleFavorite(story.id as string) : undefined}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Session Timer */}
          <SessionTimer />
          
          {/* Header Component for History Management */}
          <PageHeader
            stories={storyHistory}
            onViewStory={viewHistoryStory}
            onToggleFavorite={toggleFavorite}
            onClearHistory={clearHistory}
          />

          {story && !error && <ScrollToTopButton />}
        </div>
        
        <PageFooter />
      </div>
    </div>
  );
};

export default Index;
