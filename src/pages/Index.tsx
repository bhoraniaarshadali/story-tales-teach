
import React, { useState, useEffect } from "react";
import { generateStory } from "../services/storyService";
import StoryForm from "../components/StoryForm";
import StoryDisplay from "../components/StoryDisplay";
import StoryHistory from "../components/StoryHistory";
import LoadingSpinner from "../components/LoadingSpinner";
import SessionTimer from "../components/SessionTimer";
import AccessibilityControls from "../components/AccessibilityControls";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowUp, History } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("current");

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
    try {
      console.log(`Generating story for topic: "${topic}"`);
      const generatedStory = await generateStory(topic);
      
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
      setActiveTab("current");
      toast.success("Story created successfully!");
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Failed to create story. Please try again.");
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
      setActiveTab("current");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8 relative">
          <div className="absolute right-0 top-0">
            <AccessibilityControls />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Story Tales Teach
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Learn any concept through engaging Hinglish stories. Enter a topic below and let the magic of storytelling make learning fun and memorable.
          </p>
        </header>

        {story && <SessionTimer />}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="current">Current Story</TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-2 h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="current" className="flex flex-col items-center justify-center">
            <StoryForm onSubmit={handleSubmitTopic} isLoading={isLoading} />

            {isLoading && (
              <div className="mt-8">
                <LoadingSpinner />
                <p className="mt-2 text-center text-muted-foreground animate-pulse">
                  Creating your story about {prevTopic}...
                </p>
              </div>
            )}

            <StoryDisplay 
              story={story} 
              onToggleFavorite={story?.id ? () => toggleFavorite(story.id) : undefined}
            />

            {story && (
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
          </TabsContent>
          
          <TabsContent value="history">
            <StoryHistory 
              stories={storyHistory} 
              onViewStory={viewHistoryStory} 
              onToggleFavorite={toggleFavorite}
            />
          </TabsContent>
        </Tabs>

        <footer className="mt-20 text-center text-muted-foreground">
          <p>
            © 2025 Story Tales Teach - Making learning memorable through Hinglish stories
          </p>
          <p className="mt-2">
            This platform was created by <strong>Arshad ali Bhorania</strong>, who combined education and storytelling in a creative and magical way.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
