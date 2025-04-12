import React, { useState } from "react";
import { generateStory } from "../services/storyService";
import StoryForm from "../components/StoryForm";
import StoryDisplay from "../components/StoryDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const Index = () => {
  const [story, setStory] = useState<{
    title: string;
    content: string;
    takeaway: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevTopic, setPrevTopic] = useState<string | null>(null);

  const handleSubmitTopic = async (topic: string) => {
    setIsLoading(true);
    setPrevTopic(topic);
    try {
      const generatedStory = await generateStory(topic);
      setStory(generatedStory);
      toast.success("Story created successfully!");
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Failed to create story. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Story Tales Teach
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Learn any concept through engaging Hinglish stories. Enter a topic below and let the magic of storytelling make learning fun and memorable.
          </p>
        </header>

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

          <StoryDisplay story={story} />

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
        </div>

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
