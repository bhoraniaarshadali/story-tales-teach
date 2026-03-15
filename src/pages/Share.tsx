
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStoryIdFromUrl } from "../utils/shareUtils";
import StoryDisplay from "../components/StoryDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import AnimatedCursor from "../components/AnimatedCursor";
import { useStoryManager } from "../hooks/useStoryManager";
import { type Story } from "../hooks/useStoryManager";

const Share = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedStory, setSharedStory] = useState<Story | null>(null);
  const { storyHistory } = useStoryManager();
  
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
          setIsLoading(false);
          return;
        }
        
        // If story isn't found locally, show an error
        // In a production app, you might fetch it from a database instead
        setError("Story not found. It may have been deleted or is not available on this device.");
        
      } catch (error) {
        console.error("Error loading shared story:", error);
        setError("Failed to load the shared story. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSharedStory();
  }, [storyId, storyHistory]);
  
  const handleReturnHome = () => {
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-6 md:py-12">
      <AnimatedCursor />
      <div className="container mx-auto px-4 max-w-full md:max-w-4xl lg:max-w-5xl">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Story Tales Teach
          </h1>
          <button
            onClick={handleReturnHome}
            className="text-primary hover:text-primary/80 underline"
          >
            Return to Home
          </button>
        </header>
        
        {isLoading && (
          <div className="flex justify-center items-center min-h-[40vh]">
            <LoadingSpinner topic="shared story" isPersonalized={false} retryCount={0} />
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <ErrorMessage
              error={error}
              onTryAgain={handleReturnHome}
              onClearError={() => setError(null)}
            />
          </div>
        )}
        
        {!isLoading && !error && sharedStory && (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-xl text-primary">Shared Story</h2>
              <p className="text-muted-foreground">
                You're viewing a shared story. Create your own stories by heading back to the home page!
              </p>
            </div>
            <StoryDisplay story={sharedStory} />
          </>
        )}
      </div>
    </div>
  );
};

export default Share;
