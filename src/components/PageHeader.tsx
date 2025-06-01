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
  isPersonalized?: boolean;
  timeInvested?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  stories,
  onViewStory,
  onToggleFavorite,
  onClearHistory,
  isPersonalized = false,
  timeInvested = "00:00:00"
}) => {
  return (
    <header className="relative">
      {/* Desktop Header */}
      <div className="hidden lg:block text-center mb-6 sm:mb-8 px-2 sm:px-0">
        {/* Version Badge with Hover Effect */}
        <div className="absolute left-0 top-0 z-10">
          <div className="group relative inline-block">
            <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 rounded-br-lg shadow-lg tracking-widest uppercase cursor-pointer transition-all duration-200 hover:brightness-110">
              Primary 1.0
            </span>
            <div className="absolute hidden group-hover:block left-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm rounded-lg shadow-xl p-3 z-50 border border-gray-200 dark:border-gray-700">
              <div className="font-bold mb-1">About This Version</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                This is the original version of Story Tales Teach with basic.
              </div>
            </div>
          </div>
        </div>

        {/* Personalization Badge */}
        {isPersonalized && (
          <div className="absolute right-0 top-0 z-10">
            <div className="group relative inline-block">
              <span className="inline-block bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 rounded-bl-lg shadow-lg tracking-widest uppercase cursor-pointer transition-all duration-200 hover:brightness-110">
                Personalization Active
              </span>
              <div className="absolute hidden group-hover:block right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm rounded-lg shadow-xl p-3 z-50 border border-gray-200 dark:border-gray-700">
                <div className="font-bold mb-1">Personalized Settings</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  with user personalized settings
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                  Time Invested: {timeInvested}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header Controls */}
        <div className={`absolute right-0 top-0 flex items-center gap-2 ${isPersonalized ? 'mt-10' : ''}`}>
          <OnlineStatusIndicator />
          <ThemeToggle />
          <SettingsDrawer
            stories={stories}
            onViewStory={onViewStory}
            onToggleFavorite={onToggleFavorite}
            onClearHistory={onClearHistory}
          />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
          Story Tales Teach
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto opacity-90">
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