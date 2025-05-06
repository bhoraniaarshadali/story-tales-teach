
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen, TrendingUp, AlertCircle, RefreshCw, Settings, UserCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserPreferences } from "../services/storyService";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "../hooks/use-mobile";
import PersonalizationPanel from "./PersonalizationPanel";

interface StoryFormProps {
  onSubmit: (topic: string, usePersonalization: boolean) => void;
  isLoading: boolean;
  error?: Error | null;
  invalidTopicResponse?: any;
  userPreferences?: UserPreferences | null;
  onUpdatePreferences?: (preferences: UserPreferences) => void;
  retryCount?: number;
}

const StoryForm: React.FC<StoryFormProps> = ({
  onSubmit,
  isLoading,
  error,
  invalidTopicResponse,
  userPreferences,
  onUpdatePreferences,
  retryCount = 0
}) => {
  const [topic, setTopic] = useState("");
  const [usePersonalization, setUsePersonalization] = useState(true);
  const popularTopics = [
    "Artificial Intelligence",
    "Docker",
    "Cloud Computing",
    "Machine Learning",
    "Kubernetes",
    "Android Activity"
  ];
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      console.log(`Submitting topic "${topic}" with personalization: ${usePersonalization}`);
      if (usePersonalization && userPreferences) {
        console.log(`User preferences: ${JSON.stringify(userPreferences)}`);
      }
      onSubmit(topic, usePersonalization);
    }
  };

  const handleTopicClick = (selectedTopic: string) => {
    setTopic(selectedTopic);
    console.log(`Selected preset topic "${selectedTopic}" with personalization: ${usePersonalization}`);
    onSubmit(selectedTopic, usePersonalization);
  };

  const handleTryAgain = () => {
    if (topic.trim()) {
      onSubmit(topic, usePersonalization);
    }
  };

  const handleSuggestedTopic = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    onSubmit(suggestedTopic, usePersonalization);
  };
  
  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    if (onUpdatePreferences && userPreferences) {
      console.log(`Updating preference: ${key} = ${value}`);
      onUpdatePreferences({
        ...userPreferences,
        [key]: value
      });
    }
  };

  const resetPreferences = () => {
    if (onUpdatePreferences) {
      onUpdatePreferences({
        readingLevel: "intermediate",
        languagePreference: "hinglish",
        learningStyle: "reading",
        previousTopics: userPreferences?.previousTopics || [],
        favoriteTopics: userPreferences?.favoriteTopics || []
      });
    }
  };

  // Calculate personalization score for the indicator
  const getPersonalizationScore = () => {
    if (!userPreferences) return 0;
    let score = 0;
    if (userPreferences.readingLevel) score++;
    if (userPreferences.languagePreference) score++;
    if (userPreferences.learningStyle) score++;
    if (userPreferences.previousTopics?.length) score++;
    if (userPreferences.favoriteTopics?.length) score++;
    return score;
  };

  // PersonalizationTrigger is a button with visual indicator of active personalization
  const PersonalizationTrigger = () => (
    <Button 
      variant="outline" 
      size="icon" 
      title="Personalization Settings"
      className={usePersonalization ? "relative" : ""}
    >
      <UserCircle className={`h-5 w-5 ${usePersonalization ? "text-primary" : ""}`} />
      {usePersonalization && getPersonalizationScore() > 0 && (
        <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-primary rounded-full" />
      )}
    </Button>
  );

  // Determine which container to use based on device type
  const PersonalizationContainer = () => {
    const panelContent = (
      <PersonalizationPanel
        userPreferences={userPreferences || null}
        usePersonalization={usePersonalization}
        onTogglePersonalization={setUsePersonalization}
        onUpdatePreferences={onUpdatePreferences || (() => {})}
        onReset={resetPreferences}
      />
    );

    if (isMobile) {
      return (
        <Drawer>
          <DrawerTrigger asChild>
            <PersonalizationTrigger />
          </DrawerTrigger>
          <DrawerContent className="max-h-[95vh] px-4 pb-8">
            <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
            <div className="px-1 py-4">
              {panelContent}
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Sheet>
        <SheetTrigger asChild>
          <PersonalizationTrigger />
        </SheetTrigger>
        <SheetContent className="overflow-y-auto w-[350px] sm:max-w-lg">
          {panelContent}
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6 bg-card">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            What would you like to learn about?
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter any topic and get a fun Hinglish story that explains it
          </p>
        </div>
        
        <div className="flex space-x-2">
          {/* Model Information */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Stories are generated using AI models that have been optimized for educational content.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Personalization Settings */}
          <PersonalizationContainer />
        </div>
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
                <RefreshCw className="mr-1 h-3 w-3" /> Try Again {retryCount > 0 ? `(${retryCount + 1})` : ""}
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

      {retryCount >= 3 && !error && !invalidTopicResponse && (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <Info className="h-4 w-4" />
          <AlertTitle className="font-medium">
            Having trouble generating stories
          </AlertTitle>
          <AlertDescription>
            We're experiencing some technical difficulties. If your story doesn't look right, 
            try again later or with a different topic.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Enter any topic (e.g., 'Photosynthesis', 'Time management')"
            className="w-full pr-24"
            disabled={isLoading}
          />
          {usePersonalization && userPreferences && getPersonalizationScore() > 0 && (
            <Badge 
              variant="outline" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary/5 text-primary text-xs"
            >
              Personalized
            </Badge>
          )}
        </div>
        
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
              Generate {usePersonalization && userPreferences && getPersonalizationScore() > 0 ? "Personalized" : ""} Learning Story
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
