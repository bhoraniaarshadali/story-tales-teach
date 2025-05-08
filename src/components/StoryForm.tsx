import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Sparkles, BookOpen, TrendingUp, AlertCircle, RefreshCw,
  Settings, UserCircle, Info, Lightbulb, Zap, Bookmark,
  CheckCircle2, HelpCircle, Brain, Target, Crown, Search
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserPreferences } from "../services/storyService";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface StoryFormProps {
  onSubmit: (topic: string, usePersonalization: boolean) => void;
  isLoading: boolean;
  error?: Error | null;
  invalidTopicResponse?: any;
  userPreferences?: UserPreferences | null;
  onUpdatePreferences?: (preferences: UserPreferences) => void;
  retryCount?: number;
}

// Wrapper component for animation
const AnimatedCard = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

// Button animation wrapper
const AnimatedButton = ({ children, ...props }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  >
    <Button {...props}>{children}</Button>
  </motion.div>
);

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
  const [activeTab, setActiveTab] = useState("topics");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  // Topic categories
  const topicCategories = {
    technology: [
      "Artificial Intelligence",
      "Docker",
      "Cloud Computing",
      "Machine Learning",
      "Kubernetes",
      "Android Activity"
    ],
    science: [
      "Quantum Physics",
      "DNA Replication",
      "Climate Change",
      "Solar System",
      "Biodiversity",
      "Chemical Reactions"
    ],
    business: [
      "Stock Markets",
      "Marketing Strategy",
      "Entrepreneurship",
      "Project Management",
      "Digital Transformation",
      "Leadership"
    ]
  };

  // Generate topic suggestion
  useEffect(() => {
    // Only show suggestions after user has typed at least 3 characters
    if (topic.length >= 3 && !isLoading) {
      const topics = [
        ...topicCategories.technology,
        ...topicCategories.science,
        ...topicCategories.business
      ];

      // Find matching topics
      const matches = topics.filter(t =>
        t.toLowerCase().includes(topic.toLowerCase()) &&
        t.toLowerCase() !== topic.toLowerCase()
      );

      if (matches.length > 0) {
        // Get a random suggestion
        const randomSuggestion = matches[Math.floor(Math.random() * matches.length)];
        setSuggestion(randomSuggestion);
        setShowSuggestion(true);
      } else {
        setShowSuggestion(false);
      }
    } else {
      setShowSuggestion(false);
    }
  }, [topic, isLoading]);

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

  const getReadingLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'intermediate': return <Brain className="h-4 w-4 text-blue-500" />;
      case 'advanced': return <Crown className="h-4 w-4 text-purple-500" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <AnimatedCard>
      <Card className="w-full max-w-md p-6 space-y-6 bg-card border-2 border-primary/10 shadow-lg relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-accent/5 rounded-full blur-xl"></div>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center text-primary">
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
                  <Button variant="outline" size="icon" className="h-8 w-8 border-primary/20 bg-primary/5">
                    <Info className="h-4 w-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-card border border-primary/20 text-foreground shadow-lg p-3">
                  <p className="max-w-xs">
                    Stories are generated using AI models optimized for educational content in multiple languages.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Personalization Settings */}
            <Popover>
              <PopoverTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Personalization Settings"
                    className="border-primary/20 bg-primary/5"
                  >
                    <UserCircle className="h-5 w-5 text-primary" />
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-card border border-primary/20 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-primary flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Personalization Settings
                    </h3>
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.9, 1]
                      }}
                      transition={{
                        repeat: usePersonalization ? Infinity : 0,
                        repeatType: "reverse",
                        duration: 2
                      }}
                    >
                      <Badge
                        variant={usePersonalization ? "default" : "outline"}
                        className={`${usePersonalization ? 'bg-primary' : 'bg-muted'}`}
                      >
                        {usePersonalization ? 'Active' : 'Disabled'}
                      </Badge>
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <Label htmlFor="use-personalization" className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Use personalization
                      </Label>
                      <Switch
                        id="use-personalization"
                        checked={usePersonalization}
                        onCheckedChange={setUsePersonalization}
                      />
                    </div>

                    {userPreferences?.previousTopics?.length ? (
                      <div className="space-y-1 p-2 rounded-lg bg-background">
                        <Label className="text-xs text-muted-foreground flex items-center">
                          <Bookmark className="h-3 w-3 mr-1" />
                          Previous topics
                        </Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {userPreferences.previousTopics.map((topic, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                              onClick={() => handleTopicClick(topic)}
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {userPreferences?.favoriteTopics?.length ? (
                      <div className="space-y-1 p-2 rounded-lg bg-background">
                        <Label className="text-xs text-muted-foreground flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Favorite topics
                        </Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {userPreferences.favoriteTopics.map((topic, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => handleTopicClick(topic)}
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="reading-level" className="text-sm flex items-center gap-1">
                        {getReadingLevelIcon(userPreferences?.readingLevel || 'intermediate')}
                        Reading Level
                      </Label>
                      <Select
                        value={userPreferences?.readingLevel || 'intermediate'}
                        onValueChange={(value) => handlePreferenceChange('readingLevel', value)}
                      >
                        <SelectTrigger id="reading-level" className="bg-background">
                          <SelectValue placeholder="Select reading level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                              Beginner
                            </div>
                          </SelectItem>
                          <SelectItem value="intermediate">
                            <div className="flex items-center">
                              <Brain className="h-4 w-4 mr-2 text-blue-500" />
                              Intermediate
                            </div>
                          </SelectItem>
                          <SelectItem value="advanced">
                            <div className="flex items-center">
                              <Crown className="h-4 w-4 mr-2 text-purple-500" />
                              Advanced
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language-preference" className="text-sm flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="m5 8 6 6" />
                          <path d="m4 14 6-6 2-3" />
                          <path d="M2 5h12" />
                          <path d="M7 2h1" />
                          <path d="m22 22-5-10-5 10" />
                          <path d="M14 18h6" />
                        </svg>
                        Language Style
                      </Label>
                      <Select
                        value={userPreferences?.languagePreference || 'hinglish'}
                        onValueChange={(value) => handlePreferenceChange('languagePreference', value)}
                      >
                        <SelectTrigger id="language-preference" className="bg-background">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hinglish">Hinglish</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learning-style" className="text-sm flex items-center gap-1">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      Learning Style
                    </Label>
                    <Select
                      value={userPreferences?.learningStyle || 'reading'}
                      onValueChange={(value) => handlePreferenceChange('learningStyle', value)}
                    >
                      <SelectTrigger id="learning-style" className="bg-background">
                        <SelectValue placeholder="Select learning style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-400">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Visual
                          </div>
                        </SelectItem>
                        <SelectItem value="auditory">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-400">
                              <path d="M18 8a6 6 0 0 0-9-5 6 6 0 0 0-3 11l12 12 12-12a6 6 0 0 0-3-11 6 6 0 0 0-9 5" />
                            </svg>
                            Auditory
                          </div>
                        </SelectItem>
                        <SelectItem value="reading">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-400">
                              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
                              <path d="M8 6h8" />
                              <path d="M8 10h8" />
                              <path d="M8 14h4" />
                            </svg>
                            Reading/Writing
                          </div>
                        </SelectItem>
                        <SelectItem value="kinesthetic">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
                            </svg>
                            Practical/Examples
                          </div>
                        </SelectItem>
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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
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
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestedTopic(invalidTopicResponse.suggestedTopic)}
                        className="mt-2 border-red-300 bg-white/50 hover:bg-white/80 text-red-700"
                      >
                        <Zap className="mr-1 h-3 w-3" />
                        Try "{invalidTopicResponse.suggestedTopic}" instead
                      </AnimatedButton>
                    )}
                  </div>
                ) : (
                  <p>
                    {error?.message || "We couldn't create a story about that topic. Please try again or try a different topic."}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={handleTryAgain}
                    disabled={isLoading}
                    className="flex items-center border-red-300 bg-white/50 hover:bg-white/80 text-red-700"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> Try Again {retryCount > 0 ? `(${retryCount + 1})` : ""}
                  </AnimatedButton>
                  <AnimatedButton
                    variant="default"
                    size="sm"
                    onClick={() => setTopic("")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Try Another Topic
                  </AnimatedButton>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {retryCount >= 3 && !error && !invalidTopicResponse && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter any topic (e.g., 'Photosynthesis', 'Time management')"
              className="w-full pl-10 pr-10 bg-background border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              disabled={isLoading}
            />
            {topic.length > 0 && !isLoading && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setTopic("")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>

          {showSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm flex items-center text-muted-foreground"
            >
              <Lightbulb className="h-3 w-3 mr-1 text-amber-500" />
              Suggestion:
              <button
                type="button"
                onClick={() => handleSuggestedTopic(suggestion)}
                className="ml-1 text-primary hover:text-primary/80 hover:underline focus:outline-none"
              >
                {suggestion}
              </button>
            </motion.div>
          )}

          <AnimatedButton
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
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
          </AnimatedButton>
        </form>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="topics" className="data-[state=active]:bg-primary/10">
              <TrendingUp className="h-4 w-4 mr-1" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="technology" className="data-[state=active]:bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
              Tech
            </TabsTrigger>
            <TabsTrigger value="science" className="data-[state=active]:bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M10 2v6.5" />
                <path d="M14 2v6.5" />
                <path d="M2.5 10h19" />
                <path d="M2.2 14h19.6" />
                <path d="M6 18h12" />
                <path d="M12 22V2" />
              </svg>
              Science
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-1">
            <div className="flex flex-wrap gap-2">
              {[...topicCategories.technology, ...topicCategories.science].slice(0, 6).map(popularTopic => (
                <motion.div
                  key={popularTopic}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTopicClick(popularTopic)}
                    disabled={isLoading}
                    className="text-xs bg-background border-primary/20 hover:bg-primary/5"
                  >
                    {popularTopic}
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="technology" className="space-y-1">
            <div className="flex flex-wrap gap-2">
              {topicCategories.technology.map(techTopic => (
                <motion.div
                  key={techTopic}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTopicClick(techTopic)}
                    disabled={isLoading}
                    className="text-xs bg-background border-primary/20 hover:bg-primary/5"
                  >
                    {techTopic}
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="science" className="space-y-1">
            <div className="flex flex-wrap gap-2">
              {topicCategories.science.map(scienceTopic => (
                <motion.div
                  key={scienceTopic}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTopicClick(scienceTopic)}
                    disabled={isLoading}
                    className="text-xs bg-background border-primary/20 hover:bg-primary/5"
                  >
                    {scienceTopic}
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </AnimatedCard>
  );
};

export default StoryForm;