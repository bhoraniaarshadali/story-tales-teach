import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen, TrendingUp, AlertCircle, RefreshCw, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InvalidTopicResponse {
  title?: string;
  content: string;
  suggestedTopic?: string;
}

interface StoryFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  error?: Error | null;
  invalidTopicResponse?: InvalidTopicResponse;
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
    <div className="w-full space-y-4">
      {/* Mobile View */}
      <div className="lg:hidden w-full">
        <div className="space-y-4">
          {/* Error handling section */}
          {(error || invalidTopicResponse) && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
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
                    {error?.message || "We couldn't create a story about that topic. Please try again."}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Popular Topics */}
          <div className="space-y-2 px-4">
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

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="sticky bottom-0 bg-background p-4 border-t">
            <div className="flex gap-2">
              <Input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Enter any topic..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!topic.trim() || isLoading}
                className="shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop View */}
      <Card className="hidden lg:block w-full max-w-md mx-auto p-6 space-y-6 bg-card">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            What would you like to learn about?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
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

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <Input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Enter any topic (e.g., 'Photosynthesis', 'Time management', 'Empathy')"
            className="w-full text-sm sm:text-base"
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

        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
            <TrendingUp className="mr-1 h-4 w-4" />
            Popular topics:
          </p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {popularTopics.map(popularTopic => (
              <Button
                key={popularTopic}
                variant="outline"
                size="sm"
                onClick={() => handleTopicClick(popularTopic)}
                disabled={isLoading}
                className="text-xs px-2 sm:px-3"
              >
                {popularTopic}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StoryForm;