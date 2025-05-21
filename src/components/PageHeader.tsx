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
    <header className="text-center mb-6 sm:mb-8 relative px-2 sm:px-0">
      <div className="absolute left-0 top-0 z-10">
        <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 rounded-br-lg shadow-lg tracking-widest uppercase">
          Module 1.0
        </span>
      </div>
      <div className="absolute right-0 top-0 flex flex-col sm:flex-row gap-1 sm:gap-2 items-center pr-2 sm:pr-0 pt-2 sm:pt-0">
        <OnlineStatusIndicator />
        <ThemeToggle />
        <SettingsDrawer
          stories={stories}
          onViewStory={onViewStory}
          onToggleFavorite={onToggleFavorite}
          onClearHistory={onClearHistory}
        />
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4">
        Story Tales Teach
      </h1>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-2xl mx-auto opacity-70 font-normal px-1">
        <span className="hidden md:inline">
          Learn any concept through engaging Hinglish stories. Enter a topic below and let the magic of storytelling make learning fun and memorable.
        </span>
        <span className="md:hidden">
          Learn concepts through Hinglish stories. Type a topic to begin!
        </span>
      </p>
    </header>
  );
};

export default PageHeader;
