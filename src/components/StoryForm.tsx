import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen, TrendingUp, AlertCircle, RefreshCw, Settings, UserCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserPreferences } from "../services/storyService";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title="Personalization Settings">
                <UserCircle className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personalization Settings</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="use-personalization" className="text-sm">Use personalization</Label>
                    <Switch 
                      id="use-personalization" 
                      checked={usePersonalization}
                      onCheckedChange={setUsePersonalization}
                    />
                  </div>
                  
                  {userPreferences?.previousTopics?.length ? (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Previous topics</Label>
                      <div className="flex flex-wrap gap-1">
                        {userPreferences.previousTopics.map((topic, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {userPreferences?.favoriteTopics?.length ? (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Favorite topics</Label>
                      <div className="flex flex-wrap gap-1">
                        {userPreferences.favoriteTopics.map((topic, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reading-level">Reading Level</Label>
                  <Select 
                    value={userPreferences?.readingLevel || 'intermediate'} 
                    onValueChange={(value) => handlePreferenceChange('readingLevel', value)}
                  >
                    <SelectTrigger id="reading-level">
                      <SelectValue placeholder="Select reading level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language-preference">Language Style</Label>
                  <Select 
                    value={userPreferences?.languagePreference || 'hinglish'} 
                    onValueChange={(value) => handlePreferenceChange('languagePreference', value)}
                  >
                    <SelectTrigger id="language-preference">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hinglish">Hinglish</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="learning-style">Learning Style</Label>
                  <Select 
                    value={userPreferences?.learningStyle || 'reading'} 
                    onValueChange={(value) => handlePreferenceChange('learningStyle', value)}
                  >
                    <SelectTrigger id="learning-style">
                      <SelectValue placeholder="Select learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
                      <SelectItem value="kinesthetic">Practical/Examples</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
              Generate {usePersonalization && userPreferences ? "Personalized" : ""} Learning Story
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
