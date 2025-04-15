
import React, { useState, useEffect } from "react";
import { generateStory } from "../services/storyService";
import StoryForm from "../components/StoryForm";
import StoryDisplay from "../components/StoryDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import SessionTimer from "../components/SessionTimer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowUp, AlertTriangle } from "lucide-react";
import SettingsDrawer from "../components/SettingsDrawer";
import ThemeToggle from "../components/ThemeToggle";

export interface Story {
  title: string;
  content: string;
  takeaway: string;
  id?: string;
  isFavorite?: boolean;
  timestamp?: string;
  topic?: string;
  character?: {
    name: string;
    emoji: string;
    traits?: string;
  };
  emotions?: string[];
  keyPoints?: string[];
}

const Index = () => {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevTopic, setPrevTopic] = useState<string | null>(null);
  const [storyHistory, setStoryHistory] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedStories = localStorage.getItem("storyHistory");
    if (savedStories) {
      setStoryHistory(JSON.parse(savedStories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("storyHistory", JSON.stringify(storyHistory));
  }, [storyHistory]);

  const handleSubmitTopic = async (topic: string) => {
    setIsLoading(true);
    setPrevTopic(topic);
    setError(null); // Clear previous errors
    
    try {
      console.log(`Generating story for topic: "${topic}"`);
      const generatedStory = await generateStory(topic);
      
      // Verify that the story is actually about the requested topic
      if (!generatedStory.content.toLowerCase().includes(topic.toLowerCase())) {
        console.error(`Generated story doesn't contain topic "${topic}"`);
        toast.error(`Story generation failed for topic "${topic}". Please try again.`);
        setError(`We couldn't create a story about "${topic}". Please try again or try a different topic.`);
        setIsLoading(false);
        return;
      }
      
      // Ensure the topic is saved in the story
      const storyWithMeta: Story = {
        ...generatedStory,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        topic: topic, // Make sure we set the topic explicitly here
        isFavorite: false
      };
      
      console.log(`Story generated for topic: "${topic}", title: "${storyWithMeta.title}"`);
      setStory(storyWithMeta);
      setStoryHistory(prev => [storyWithMeta, ...prev]);
      toast.success("Story created successfully!");
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Failed to create story. Please try again.");
      setError(`We couldn't create a story about "${topic}". Please try again or try a different topic.`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (storyId: string) => {
    if (story && story.id === storyId) {
      setStory({
        ...story,
        isFavorite: !story.isFavorite
      });
    }
    
    setStoryHistory(prevHistory => 
      prevHistory.map(item => 
        item.id === storyId 
          ? { ...item, isFavorite: !item.isFavorite } 
          : item
      )
    );
    
    toast.success("Story updated!");
  };

  const viewHistoryStory = (storyId: string) => {
    const selectedStory = storyHistory.find(item => item.id === storyId);
    if (selectedStory) {
      setStory(selectedStory);
      setError(null); // Clear any errors when viewing history
    }
  };
  
  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your story history? This cannot be undone.")) {
      setStoryHistory([]);
      toast.success("History cleared successfully");
    }
  };

  const handleTryAgain = () => {
    if (prevTopic) {
      handleSubmitTopic(prevTopic);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8 relative">
          <div className="absolute right-0 top-0 flex gap-2 items-center">
            <ThemeToggle />
            <SettingsDrawer 
              stories={storyHistory} 
              onViewStory={viewHistoryStory} 
              onToggleFavorite={toggleFavorite}
              onClearHistory={clearHistory}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Story Tales Teach
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Learn any concept through engaging Hinglish stories. Enter a topic below and let the magic of storytelling make learning fun and memorable.
          </p>
        </header>

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
            <div className="mt-8 text-center p-6 bg-muted rounded-lg border border-border max-w-md">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">Story Generation Failed</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleTryAgain}>Try Again</Button>
                <Button variant="outline" onClick={() => setError(null)}>
                  Try Another Topic
                </Button>
              </div>
            </div>
          )}

          {!error && <StoryDisplay 
            story={story} 
            onToggleFavorite={story?.id ? () => toggleFavorite(story.id) : undefined}
          />}

          {story && !error && (
            <div className="mt-8 mb-16">
              <Button
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className="flex items-center"
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Learn Something New
              </Button>
            </div>
          )}
        </div>

        <footer className="mt-20 text-center text-muted-foreground">
          <p>
            © 2025 Story Tales Teach - Making learning memorable through Hinglish stories
          </p>
          <p className="mt-2">
            This platform was created by <a href="https://www.linkedin.com/in/arshad-ali-bhorania/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary"><strong>Arshad Ali Bhorania</strong></a>, who combined education and storytelling in a creative and magical way.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
