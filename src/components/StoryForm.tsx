
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Settings, 
  Wand2, 
  Brain, 
  Languages, 
  User,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UserPreferences } from "@/hooks/useStoryManager";
import { cn } from "@/lib/utils";

interface StoryFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  userPreferences?: UserPreferences | null;
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void;
  retryCount: number;
  popularTopics: { topic: string; count: number }[];
}

const StoryForm: React.FC<StoryFormProps> = ({
  onSubmit,
  isLoading,
  userPreferences,
  onUpdatePreferences,
  retryCount,
  popularTopics = []
}) => {
  const [topic, setTopic] = useState("");
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Provide default preferences if null
  const safePreferences = userPreferences || {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
      setTopic("");
    }
  };

  const handleTopicClick = (topicName: string) => {
    setTopic(topicName);
  };

  const languages = [
    { value: "english", label: "English", flag: "🇺🇸" },
    { value: "hindi", label: "Hindi", flag: "🇮🇳" },
    { value: "hinglish", label: "Hinglish", flag: "🔄" }
  ];

  const difficulties = [
    { value: "beginner", label: "Beginner", icon: "🌱" },
    { value: "intermediate", label: "Intermediate", icon: "📈" },
    { value: "advanced", label: "Advanced", icon: "🚀" }
  ];

  const storyTypes = [
    { value: "adventure", label: "Adventure", icon: "🗺️" },
    { value: "mystery", label: "Mystery", icon: "🔍" },
    { value: "educational", label: "Educational", icon: "📚" },
    { value: "funny", label: "Funny", icon: "😄" },
    { value: "inspirational", label: "Inspirational", icon: "✨" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Story Generation Form */}
      <Card className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/30 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Wand2 className="h-8 w-8 text-purple-400" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Generate a Story
            </h2>
            <p className="text-white/70">
              Enter any topic and let AI create a personalized learning story for you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter any topic you want to learn about..."
                className="w-full h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm rounded-xl pr-24"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!topic.trim() || isLoading}
                className="absolute right-2 top-2 h-10 px-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 rounded-lg"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Personalization Toggle */}
          <div className="mt-6">
            <Collapsible open={isPersonalizeOpen} onOpenChange={setIsPersonalizeOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-white hover:bg-white/10 p-4 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-400" />
                    <span>Personalize Your Story</span>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                      AI Enhanced
                    </Badge>
                  </div>
                  {isPersonalizeOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-6 mt-4">
                <AnimatePresence>
                  {isPersonalizeOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      {/* Language Selection */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-medium">
                          <Languages className="h-4 w-4 text-blue-400" />
                          Story Language
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {languages.map((lang) => (
                            <motion.button
                              key={lang.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onUpdatePreferences({ language: lang.value as any })}
                              className={cn(
                                "p-4 rounded-xl border transition-all text-left",
                                safePreferences.language === lang.value
                                  ? "bg-purple-500/30 border-purple-400 text-white"
                                  : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="font-medium">{lang.label}</span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty Level */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-medium">
                          <Brain className="h-4 w-4 text-green-400" />
                          Difficulty Level
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {difficulties.map((diff) => (
                            <motion.button
                              key={diff.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onUpdatePreferences({ difficulty: diff.value as any })}
                              className={cn(
                                "p-4 rounded-xl border transition-all text-left",
                                safePreferences.difficulty === diff.value
                                  ? "bg-green-500/30 border-green-400 text-white"
                                  : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{diff.icon}</span>
                                <span className="font-medium">{diff.label}</span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Story Type */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-medium">
                          <Star className="h-4 w-4 text-yellow-400" />
                          Story Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {storyTypes.map((type) => (
                            <motion.button
                              key={type.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onUpdatePreferences({ storyType: type.value as any })}
                              className={cn(
                                "p-3 rounded-xl border transition-all text-center",
                                safePreferences.storyType === type.value
                                  ? "bg-yellow-500/30 border-yellow-400 text-white"
                                  : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                              )}
                            >
                              <div className="space-y-1">
                                <div className="text-xl">{type.icon}</div>
                                <div className="text-sm font-medium">{type.label}</div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Character Name */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-medium">
                          <User className="h-4 w-4 text-pink-400" />
                          Character Name (Optional)
                        </label>
                        <Input
                          type="text"
                          value={safePreferences.characterName || ""}
                          onChange={(e) => onUpdatePreferences({ characterName: e.target.value })}
                          placeholder="Enter a character name for your story..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Popular Topics */}
      {popularTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Popular Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTopics.slice(0, 8).map((popularTopic, index) => (
                  <motion.div
                    key={popularTopic.topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge
                      variant="secondary"
                      className="cursor-pointer bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-200 px-3 py-1"
                      onClick={() => handleTopicClick(popularTopic.topic)}
                    >
                      {popularTopic.topic}
                      <span className="ml-2 text-xs opacity-70">
                        {popularTopic.count}
                      </span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default StoryForm;
