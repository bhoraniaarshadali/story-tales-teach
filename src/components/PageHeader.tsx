import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import SettingsDrawer from "./SettingsDrawer";
import { Story } from "../hooks/useStoryManager";
import { BookOpen, Sparkles, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  stories: Story[];
  onViewStory: (storyId: string) => void;
  onToggleFavorite: (storyId: string) => void;
  onClearHistory: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  stories,
  onViewStory,
  onToggleFavorite,
  onClearHistory
}) => {
  const [animateTitle, setAnimateTitle] = useState(false);
  const totalStories = stories.length;
  const favoriteStories = stories.filter(story => story.isFavorite).length;

  // Display animation when component mounts
  useEffect(() => {
    setAnimateTitle(true);
  }, []);

  // Taglines for the header - will randomly select one on each render
  const taglines = [
    "Learn through the magic of stories in Hindi, English, and Hinglish",
    "Where learning meets imagination through personalized stories",
    "Transforming complex topics into engaging tales",
    "Unforgettable learning through immersive storytelling"
  ];

  const randomTagline = taglines[Math.floor(Math.random() * taglines.length)];

  return (
    <header className="relative py-4 md:py- mb-4 md:mb-0">
      {/* Decorative elements */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-full h-20 bg-gradient-to-r from-primary/5 via-accent/20 to-primary/5 blur-xl rounded-full opacity-70"></div>

      {/* Controls on top right */}
      <div className="absolute right-4 top-4 flex flex-col md:flex-row gap-2 items-center z-50 pointer-events-auto">
        <div className="relative">
          <ThemeToggle />
        </div>
        <div className="relative">
          <SettingsDrawer
            stories={stories}
            onViewStory={onViewStory}
            onToggleFavorite={onToggleFavorite}
            onClearHistory={onClearHistory}
          />
        </div>
      </div>

      {/* Header content with animations */}
      <div className="text-center relative z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center"
        >
          <BookOpen className="text-primary h-8 w-8 md:h-10 md:w-10 mr-4 hidden md:block" />
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent relative">
              <motion.span
                animate={animateTitle ? {
                  color: ["#7C3AED", "#7C3AED", "#7C3AED"],
                } : {}}
                transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
              >
                Story Tales Teach
              </motion.span>
              <motion.span
                className="absolute -right-4 -top-4 md:-right-6 md:-top-6 text-yellow-400"
                animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
              </motion.span>
            </h1>

            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
              <span className="hidden md:inline text-lg">
                {randomTagline}
              </span>
              <span className="md:hidden text-base">
                Learn concepts through interactive stories
              </span>
            </p>
          </div>
        </motion.div>

        {/* Library stats badge */}
        {totalStories > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4"
          >
            <Badge variant="outline" className="bg-background/50 backdrop-blur-sm px-3 py-1">
              <BookMarked className="h-4 w-4 mr-2 text-primary" />
              <span>Your Library: {totalStories} stories</span>
              {favoriteStories > 0 && (
                <span className="ml-2 text-amber-500">• {favoriteStories} favorites</span>
              )}
            </Badge>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;