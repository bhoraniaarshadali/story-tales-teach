import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StoryFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  error?: Error | null;
  invalidTopicResponse?: any; // For handling custom error responses
}

const StoryForm: React.FC<StoryFormProps> = ({
  onSubmit,
  isLoading,
  error,
  invalidTopicResponse
}) => {
  const [topic, setTopic] = useState("");
  const popularTopics = [
    "Artificial Intelligence",
    "Docker",
    "Cloud Computing",
    "Machine Learning",
    "Kubernetes",
    "Android Activity"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
    }
  };

  const handleTopicClick = (selectedTopic: string) => {
    setTopic(selectedTopic);
    onSubmit(selectedTopic);
  };

  const handleTryAgain = () => {
    if (topic.trim()) {
      onSubmit(topic);
    }
  };

  const handleSuggestedTopic = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    onSubmit(suggestedTopic);
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6 bg-card">
      <div>
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-primary" />
          What would you like to learn about?
        </h2>
        <p className="text-muted-foreground text-sm">
          Enter any topic and get a fun Hinglish story that explains it
        </p>
      </div>

      {/* Error handling section */}
      {(error || invalidTopicResponse) && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-medium">
            {invalidTopicResponse?.title || "Oops! Topic Problem"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {invalidTopicResponse ? (
              <div className="space-y-2">
                <p>{invalidTopicResponse.content}</p>
                {invalidTopicResponse.suggestedTopic && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedTopic(invalidTopicResponse.suggestedTopic)}
                    className="mt-2"
                  >
                    Try "{invalidTopicResponse.suggestedTopic}" instead
                  </Button>
                )}
              </div>
            ) : (
              <p>
                {error?.message || "We couldn't create a story about that topic. Please try again or try a different topic."}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTryAgain}
                disabled={isLoading}
                className="flex items-center"
              >
                <RefreshCw className="mr-1 h-3 w-3" /> Try Again
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setTopic("")}
                className="bg-primary"
              >
                Try Another Topic
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Enter any topic (e.g., 'Photosynthesis', 'Time management', 'Empathy')"
          className="w-full"
          disabled={isLoading}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={!topic.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Creating Story...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Learning Story
            </>
          )}
        </Button>
      </form>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground flex items-center">
          <TrendingUp className="mr-1 h-4 w-4" />
          Popular topics:
        </p>
        <div className="flex flex-wrap gap-2">
          {popularTopics.map(popularTopic => (
            <Button
              key={popularTopic}
              variant="outline"
              size="sm"
              onClick={() => handleTopicClick(popularTopic)}
              disabled={isLoading}
              className="text-xs"
            >
              {popularTopic}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default StoryForm;