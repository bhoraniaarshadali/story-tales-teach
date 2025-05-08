
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPreferences } from "../services/storyService";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Settings, ChevronDown, ChevronRight, ArrowRight, TrendingUp, Star, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface StoryFormProps {
  onSubmit: (topic: string, usePersonalization?: boolean) => void;
  isLoading: boolean;
  retryCount: number;
  userPreferences?: UserPreferences | null;
  onUpdatePreferences: (preferences: UserPreferences) => void;
  popularTopics?: {topic: string, count: number}[];
}

const StoryForm: React.FC<StoryFormProps> = ({
  onSubmit,
  isLoading,
  retryCount,
  userPreferences,
  onUpdatePreferences,
  popularTopics = []
}) => {
  const [topic, setTopic] = useState("");
  const [isPersonalizationEnabled, setIsPersonalizationEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState(userPreferences?.languagePreference || "english");
  const [readingLevel, setReadingLevel] = useState(userPreferences?.readingLevel || "intermediate");
  const [ageGroup, setAgeGroup] = useState(userPreferences?.ageGroup || "adult");
  const [interests, setInterests] = useState<string>(userPreferences?.interests?.join(", ") || "");

  // Load settings from user preferences
  useEffect(() => {
    if (userPreferences) {
      setLanguage(userPreferences.languagePreference || "english");
      setReadingLevel(userPreferences.readingLevel || "intermediate");
      setAgeGroup(userPreferences.ageGroup || "adult");
      setInterests(userPreferences.interests?.join(", ") || "");
    }
  }, [userPreferences]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (topic.trim().length > 0) {
      onSubmit(topic.trim(), isPersonalizationEnabled);
    }
  };

  const handleTopicSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
    onSubmit(suggestion, isPersonalizationEnabled);
  };

  const handleSaveSettings = () => {
    const updatedPreferences: UserPreferences = {
      ...userPreferences,
      languagePreference: language as "english" | "hinglish" | "hindi",
      readingLevel: readingLevel as "beginner" | "intermediate" | "advanced",
      ageGroup: ageGroup as "kids" | "teen" | "adult",
      interests: interests.split(",").map(i => i.trim()).filter(i => i.length > 0),
    };
    
    onUpdatePreferences(updatedPreferences);
    setShowSettings(false);
  };

  const previousTopics = userPreferences?.previousTopics || [];
  const favoriteTopics = userPreferences?.favoriteTopics || [];

  // Define example topic suggestions if no popular topics are available
  const exampleSuggestions = [
    "Quantum Physics",
    "Indian History",
    "Machine Learning",
    "Climate Change",
    "Solar System"
  ];

  // Use popular topics if available, otherwise use example suggestions
  const topicSuggestions = popularTopics.length > 0 
    ? popularTopics.slice(0, 5).map(item => item.topic)
    : exampleSuggestions;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              Generate a Story
            </h2>
            <p className="text-muted-foreground mb-4">
              Enter any topic and let AI create a personalized learning story for you.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Enter any topic you want to learn about..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="pr-10 focus-visible:ring-primary"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="group min-w-32"
              disabled={isLoading || topic.trim().length === 0}
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  Generate Story
                  <Sparkles className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Topics suggestions section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Popular Topics</h3>
            </div>
            
            <div className="flex items-center">
              <Switch
                checked={isPersonalizationEnabled}
                onCheckedChange={setIsPersonalizationEnabled}
                size="sm"
              />
              <span className="ml-2 text-xs text-muted-foreground">
                Personalize
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {topicSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTopicSuggestionClick(suggestion)}
                className="text-xs md:text-sm bg-muted hover:bg-muted/80 text-primary px-3 py-1 rounded-full transition-colors"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Settings collapsible section */}
        <Collapsible
          open={showSettings}
          onOpenChange={setShowSettings}
          className="border rounded-lg bg-card/50 backdrop-blur-sm"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Story Settings</span>
            </div>
            {showSettings ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0">
            <div className="border-t pt-4 mt-1 space-y-4">
              <Tabs defaultValue="preferences" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="preferences">Story Preferences</TabsTrigger>
                  <TabsTrigger value="history">Previous Topics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preferences" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language Style</Label>
                      <Select
                        value={language}
                        onValueChange={setLanguage}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hinglish">Hinglish (Hindi + English)</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reading-level">Reading Level</Label>
                      <Select
                        value={readingLevel}
                        onValueChange={setReadingLevel}
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
                      <Label htmlFor="age-group">Age Group</Label>
                      <Select
                        value={ageGroup}
                        onValueChange={setAgeGroup}
                      >
                        <SelectTrigger id="age-group">
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kids">Children (5-12)</SelectItem>
                          <SelectItem value="teen">Teen (13-18)</SelectItem>
                          <SelectItem value="adult">Adult (19+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interests">Your Interests</Label>
                      <Textarea
                        id="interests"
                        placeholder="Science, History, Music... (comma separated)"
                        className="resize-none"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleSaveSettings}>
                    Save Preferences
                  </Button>
                </TabsContent>

                <TabsContent value="history">
                  <div className="space-y-4">
                    {favoriteTopics.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          Favorite Topics
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {favoriteTopics.map((topic, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleTopicSuggestionClick(topic)}
                              className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full transition-colors"
                              disabled={isLoading}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {previousTopics.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" />
                          Previous Topics
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {previousTopics.map((topic, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleTopicSuggestionClick(topic)}
                              className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full transition-colors"
                              disabled={isLoading}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {favoriteTopics.length === 0 && previousTopics.length === 0 && (
                      <Card className="p-4 text-center text-muted-foreground">
                        <p>No history yet. Generate stories to see your history.</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {retryCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-md"
          >
            Retry attempt #{retryCount}. We're working hard to generate your story!
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default StoryForm;
