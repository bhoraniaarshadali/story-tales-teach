import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Moon, Sun, TrendingUp, Heart, History, Trash2 } from "lucide-react";

// Enhanced Theme Toggle with animation
export const EnhancedThemeToggle = ({ theme, toggleTheme }) => {
    return (
        <motion.button
            onClick={toggleTheme}
            className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ${theme === "dark"
                    ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                    : "bg-blue-100 text-indigo-700 hover:bg-blue-200"
                }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ rotate: -30, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 30, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
};

// Interactive Topic Pills that react to hover/focus
export const InteractiveTopicPills = ({ topics, onTopicClick, theme }) => {
    const topicVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className={theme === "dark" ? "text-violet-300" : "text-indigo-500"} />
                <h3 className={`font-medium ${theme === "dark" ? "text-violet-200" : "text-indigo-700"}`}>
                    Trending Topics
                </h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {topics.map((topicData, i) => (
                    <motion.button
                        key={topicData.topic}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={topicVariants}
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: theme === "dark" ? "rgba(139, 92, 246, 0.4)" : "rgba(129, 140, 248, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onTopicClick(topicData.topic)}
                        className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 
              ${theme === "dark"
                                ? "bg-violet-900/30 border border-violet-700/50 text-violet-200 hover:border-violet-500"
                                : "bg-indigo-100/80 border border-indigo-200 text-indigo-700 hover:border-indigo-300"}`}
                    >
                        <span>{topicData.topic}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full 
              ${theme === "dark"
                                ? "bg-violet-800/60 text-violet-300"
                                : "bg-indigo-200 text-indigo-600"}`}>
                            {topicData.count}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

// Animated History Card with hover effects
export const AnimatedHistoryCard = ({ story, onViewStory, onToggleFavorite, theme }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`p-4 rounded-lg cursor-pointer mb-2 relative
        ${theme === "dark"
                    ? "bg-gray-800/70 border border-gray-700/70 hover:bg-gray-800/90"
                    : "bg-white/80 border border-blue-100 hover:bg-white/90 hover:shadow-md"}`}
            onClick={() => onViewStory(story.id)}
        >
            <div className="flex justify-between items-start">
                <h3 className={`font-medium text-lg truncate max-w-[80%] 
          ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    {story.title || story.topic}
                </h3>
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(story.id);
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-rose-500 hover:text-rose-600"
                    aria-label={story.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart size={18} fill={story.isFavorite ? "currentColor" : "none"} />
                </motion.button>
            </div>
            <p className={`text-sm mt-1 truncate 
        ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {story.text.substring(0, 120)}...
            </p>
            <div className={`text-xs mt-2 
        ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                {new Date(story.timestamp).toLocaleDateString()}
            </div>
        </motion.div>
    );
};

// Enhanced History Menu with animations
export const EnhancedHistoryMenu = ({ stories, onViewStory, onToggleFavorite, onClearHistory, theme }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg
          ${theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700 text-white"
                        : "bg-white hover:bg-blue-50 text-gray-800 shadow-sm"}`}
                aria-expanded={isOpen}
                aria-label="View history"
            >
                <History size={18} />
                <span>History</span>
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full
          ${theme === "dark"
                        ? "bg-violet-900 text-violet-200"
                        : "bg-indigo-100 text-indigo-700"}`}>
                    {stories.length}
                </span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl p-3 z-50 shadow-xl
              ${theme === "dark"
                                ? "bg-gray-800 border border-gray-700"
                                : "bg-white border border-gray-200"}`}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                                Your Stories
                            </h3>
                            {stories.length > 0 && (
                                <motion.button
                                    onClick={onClearHistory}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded
                    ${theme === "dark"
                                            ? "bg-red-900/40 text-red-300 hover:bg-red-900/60"
                                            : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                                    aria-label="Clear history"
                                >
                                    <Trash2 size={14} />
                                    <span>Clear</span>
                                </motion.button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {stories.length === 0 ? (
                                <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                    No stories yet. Create your first story!
                                </div>
                            ) : (
                                stories.map((story, i) => (
                                    <AnimatedHistoryCard
                                        key={story.id}
                                        story={story}
                                        onViewStory={onViewStory}
                                        onToggleFavorite={onToggleFavorite}
                                        theme={theme}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Welcome Component with sparkle animation
export const WelcomeAnimation = ({ theme }) => {
    return (
        <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <motion.div
                className="inline-block relative"
                whileHover={{ scale: 1.05 }}
            >
                <h1 className={`text-4xl font-bold mb-2 inline-block
          ${theme === "dark"
                        ? "text-white"
                        : "text-indigo-900"}`}
                >
                    StoryWeaver
                </h1>
                <motion.div
                    className="absolute -top-1 -right-6"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                    <Sparkles
                        size={24}
                        className={theme === "dark" ? "text-yellow-300" : "text-indigo-500"}
                    />
                </motion.div>
            </motion.div>
            <p className={`text-lg max-w-2xl mx-auto
        ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Enter any topic and watch as AI creates a unique, personalized story just for you.
            </p>
        </motion.div>
    );
};

// Form animation wrapper
export const AnimatedFormContainer = ({ children, inView, theme }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`w-full max-w-3xl p-6 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden
        ${theme === 'dark'
                    ? 'bg-gray-800/40 border border-gray-700/50'
                    : 'bg-white/60 border border-white/50'}`}
        >
            {theme === 'dark' && (
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl"></div>
            )}
            {theme === 'light' && (
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-indigo-400/10 blur-3xl"></div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}; 