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

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="w-full max-w-md p-6 space-y-6 bg-card shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <motion.h2 
              className="text-xl font-semibold mb-2 flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              What would you like to learn about?
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              Enter any topic and get a fun Hinglish story that explains it
            </motion.p>
          </div>
          
          <motion.div 
            className="flex space-x-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="icon" title="Personalization Settings">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" sideOffset={5}>
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                        <motion.div 
                          className="flex flex-wrap gap-1"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            visible: { transition: { staggerChildren: 0.05 } },
                            hidden: {}
                          }}
                        >
                          {userPreferences.previousTopics.map((topic, i) => (
                            <motion.div
                              key={i}
                              variants={{
                                hidden: { opacity: 0, scale: 0.8 },
                                visible: { opacity: 1, scale: 1 }
                              }}
                            >
                              <Badge variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    ) : null}
                    
                    {userPreferences?.favoriteTopics?.length ? (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Favorite topics</Label>
                        <motion.div 
                          className="flex flex-wrap gap-1"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            visible: { transition: { staggerChildren: 0.05 } },
                            hidden: {}
                          }}
                        >
                          {userPreferences.favoriteTopics.map((topic, i) => (
                            <motion.div
                              key={i}
                              variants={{
                                hidden: { opacity: 0, scale: 0.8 },
                                visible: { opacity: 1, scale: 1 }
                              }}
                            >
                              <Badge key={i} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reading-level">Reading Level</Label>
                    <Select 
                      value={userPreferences?.readingLevel || 'intermediate'} 
                      onValueChange={(value) => handlePreferenceChange('readingLevel', value)}
                      defaultValue={userPreferences?.readingLevel || 'intermediate'}
                    >
                      <SelectTrigger id="reading-level" className="w-full">
                        <SelectValue placeholder="Select reading level" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="bg-card">
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
                      defaultValue={userPreferences?.languagePreference || 'hinglish'}
                    >
                      <SelectTrigger id="language-preference">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
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
                      defaultValue={userPreferences?.learningStyle || 'reading'}
                    >
                      <SelectTrigger id="learning-style">
                        <SelectValue placeholder="Select learning style" />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="auditory">Auditory</SelectItem>
                        <SelectItem value="reading">Reading/Writing</SelectItem>
                        <SelectItem value="kinesthetic">Practical/Examples</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>

        {/* Error handling section */}
        {(error || invalidTopicResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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
                      <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedTopic(invalidTopicResponse.suggestedTopic)}
                          className="mt-2"
                        >
                          Try "{invalidTopicResponse.suggestedTopic}" instead
                        </Button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <p>
                    {error?.message || "We couldn't create a story about that topic. Please try again or try a different topic."}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTryAgain}
                      disabled={isLoading}
                      className="flex items-center"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" /> Try Again {retryCount > 0 ? `(${retryCount + 1})` : ""}
                    </Button>
                  </motion.div>
                  <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setTopic("")}
                      className="bg-primary"
                    >
                      Try Another Topic
                    </Button>
                  </motion.div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {retryCount >= 3 && !error && !invalidTopicResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter any topic (e.g., 'Photosynthesis', 'Time management', 'Empathy')"
              className="w-full"
              disabled={isLoading}
            />
          </motion.div>
          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
          </motion.div>
        </form>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <p className="text-sm font-medium text-muted-foreground flex items-center">
            <TrendingUp className="mr-1 h-4 w-4" />
            Popular topics:
          </p>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map(popularTopic => (
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
                  className="text-xs"
                >
                  {popularTopic}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default StoryForm;
