
import React from "react";
import ThemeToggle from "./ThemeToggle";
import SettingsDrawer from "./SettingsDrawer";
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
    <header className="text-center mb-8 relative">
      <div className="absolute right-0 top-0 flex gap-2 items-center">
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
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
        Learn any concept through engaging Hinglish stories. Enter a topic below and let the magic of storytelling make learning fun and memorable.
      </p>
    </header>
  );
};

export default PageHeader;
