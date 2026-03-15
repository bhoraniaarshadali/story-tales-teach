
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStoryIdFromUrl } from "../utils/shareUtils";
import StoryDisplay from "../components/StoryDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import AnimatedCursor from "../components/AnimatedCursor";
import { useStoryManager } from "../hooks/useStoryManager";
import { type Story } from "../hooks/useStoryManager";
import { motion } from "framer-motion"; 
import { Helmet } from "react-helmet";
import { generateSocialMetaTags } from "../utils/shareUtils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// New components for enhanced UI
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

const ShareBadge = () => (
  <motion.div
    className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
  >
    Shared Story
  </motion.div>
);

const SuccessConfetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: `hsl(${Math.random() * 360}, 80%, 60%)`,
            top: `${Math.random() * 20}%`,
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: -20, opacity: 1 }}
          animate={{
            y: `${Math.random() * 100 + 100}vh`,
            opacity: 0
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random(),
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

const BackToHomeButton = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="group flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-all duration-300"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="group-hover:-translate-x-1 transition-transform duration-300">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
    <span>Return Home</span>
  </motion.button>
);

const StoryLoadingState = ({ topic, isPersonalized, retryCount }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-16"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <LoadingSpinner topic={topic} isPersonalized={isPersonalized} retryCount={retryCount} />
    <motion.div
      className="mt-8 text-center max-w-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <p className="text-muted-foreground text-lg">Preparing an amazing story experience...</p>
      <p className="text-muted-foreground mt-2">This magical moment will be worth the wait!</p>
    </motion.div>
  </motion.div>
);

const Share = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedStory, setSharedStory] = useState<Story | null>(null);
  const { storyHistory } = useStoryManager();
  const [showConfetti, setShowConfetti] = useState(false);
  const [metaTags, setMetaTags] = useState("");

  useEffect(() => {
    const loadSharedStory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Allow both URL params and route params
        const resolvedStoryId = storyId || getStoryIdFromUrl();

        if (!resolvedStoryId) {
          setError("No story ID found in URL. This link may be invalid.");
          setIsLoading(false);
          return;
        }

        console.log(`Loading shared story with ID: ${resolvedStoryId}`);

        // First check if the story exists in local history
        const localStory = storyHistory.find(story => story.id === resolvedStoryId);

        if (localStory) {
          console.log("Found story in local history:", localStory.title);
          setSharedStory(localStory);
          // Generate meta tags for social sharing
          const tags = generateSocialMetaTags(localStory);
          setMetaTags(tags);
          setShowConfetti(true);
          setIsLoading(false);
          return;
        }

        // If not found locally, try to fetch from the database
        const { data: dbStory, error: fetchError } = await supabase
          .from("stories")
          .select("*")
          .eq("id", resolvedStoryId)
          .single();

        if (fetchError) {
          console.error("Error fetching story from database:", fetchError);
          setError("Story not found. It may have been deleted or is not available.");
          setIsLoading(false);
          return;
        }

        if (dbStory) {
          // Convert the database story to the format expected by the app
          const storyData: Story = {
            id: dbStory.id,
            title: dbStory.title,
            content: dbStory.content,
            takeaway: dbStory.takeaway || "",
            topic: dbStory.topic || "",
            timestamp: dbStory.created_at,
            likes: dbStory.likes ?? 0,
            dislikes: dbStory.dislikes ?? 0
          };

          console.log("Found story in database:", storyData.title);
          setSharedStory(storyData);
          // Generate meta tags for social sharing
          const tags = generateSocialMetaTags(storyData);
          setMetaTags(tags);
          setShowConfetti(true);
          setIsLoading(false);
          return;
        }

        // If story isn't found anywhere
        setError("Story not found. It may have been deleted or is not available on this device.");

      } catch (error) {
        console.error("Error loading shared story:", error);
        setError("Failed to load the shared story. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedStory();

    // Hide confetti after 4 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => clearTimeout(confettiTimer);
  }, [storyId, storyHistory]);

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-primary/5 overflow-hidden">
      {/* Add meta tags for social sharing */}
      <Helmet>
        <title>{sharedStory?.title || "Shared Story"} | Story Tales Teach</title>
        <meta name="description" content={sharedStory?.takeaway || "Read this amazing shared story!"} />
        <div dangerouslySetInnerHTML={{ __html: metaTags }} />
      </Helmet>

      <AnimatedCursor />
      {showConfetti && <SuccessConfetti />}

      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-full md:max-w-4xl lg:max-w-5xl">
          <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 relative">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Story Tales Teach
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent rounded-full mt-2"></div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <BackToHomeButton onClick={handleReturnHome} />
            </motion.div>
          </header>

          {isLoading && (
            <StoryLoadingState topic="shared story" isPersonalized={false} retryCount={0} />
          )}

          {error && !isLoading && (
            <motion.div
              className="rounded-xl bg-background shadow-lg border border-destructive/20 p-8 my-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="text-destructive/80">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </motion.div>
                <ErrorMessage
                  error={error}
                  onTryAgain={handleReturnHome}
                  onClearError={() => setError(null)}
                />
                <motion.p
                  className="mt-6 text-muted-foreground max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  You can create your own amazing stories by returning to the home page!
                </motion.p>
              </div>
            </motion.div>
          )}

          {!isLoading && !error && sharedStory && (
            <div className="relative">
              <ShareBadge />

              <motion.div
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {sharedStory.title}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  You're viewing a shared story. Create your own personalized stories by heading back to the home page!
                </p>
                <div className="flex justify-center mt-4">
                  <div className="inline-flex items-center space-x-1 text-sm text-muted-foreground bg-background/50 px-3 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12.01" y2="15" />
                    </svg>
                    <span>Shared with you</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="bg-background rounded-xl shadow-lg border border-accent/20 p-6 md:p-8"
              >
                <StoryDisplay story={sharedStory} />
              </motion.div>

              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="bg-primary text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                      onClick={handleReturnHome}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <span>Create Your Own Story</span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}

          <footer className="mt-16 py-6 bg-background/80 backdrop-blur-sm border-t border-accent/10">
            <div className="container mx-auto px-4 text-center text-muted-foreground">
              <p>©2025 Story Tales Teach - Inspiring young minds with personalized tales</p>
            </div>
          </footer>
        </div>
      </PageTransition>
    </div>
  );
};

export default Share;
