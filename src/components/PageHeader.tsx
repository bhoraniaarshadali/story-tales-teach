import React from "react";
import ThemeToggle from "./ThemeToggle";
import SettingsDrawer from "./SettingsDrawer";
import OnlineStatusIndicator from "./ui/OnlineStatusIndicator";
import { Story } from "../hooks/useStoryManager";

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
  return (
    <header className="relative">
      {/* Desktop Header */}
      <div className="hidden lg:block text-center mb-6 sm:mb-8 px-2 sm:px-0">
        <div className="absolute left-0 top-0 z-10">
          <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 rounded-br-lg shadow-lg tracking-widest uppercase">
            Module 1.0
          </span>
        </div>
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <OnlineStatusIndicator />
          <ThemeToggle />
          <SettingsDrawer
            stories={stories}
            onViewStory={onViewStory}
            onToggleFavorite={onToggleFavorite}
            onClearHistory={onClearHistory}
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Story Tales Teach
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto opacity-70">
          Learn any concept through engaging Hinglish stories. Enter a topic below and let the magic of storytelling make learning fun and memorable.
        </p>
      </div>

      {/* Mobile App-like Header */}
      <div className="lg:hidden">
        {/* Status Bar */}
        <div className="bg-background/80 backdrop-blur-sm border-b border-border/30 fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between py-3 px-3">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.ico"
                alt="Story Tales Teach Logo"
                className="w-5 h-5"
              />
              <span className="text-lg font-bold text-primary">Story Tales Teach</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SettingsDrawer
                stories={stories}
                onViewStory={onViewStory}
                onToggleFavorite={onToggleFavorite}
                onClearHistory={onClearHistory}
              />
            </div>
          </div>
        </div>
        {/* Spacer for fixed header */}
        <div className="h-[52px]" />
      </div>
    </header>
  );
};

export default PageHeader;
