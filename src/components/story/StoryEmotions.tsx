
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface StoryEmotionsProps {
  emotions: string[] | string | undefined;
}

const StoryEmotions: React.FC<StoryEmotionsProps> = ({ emotions }) => {
  // Handle emotions whether it's a string, array, or undefined
  const emotionsArray = Array.isArray(emotions)
    ? emotions
    : typeof emotions === 'string' && emotions
      ? emotions.split(',').map(e => e.trim())
      : [];

  if (emotionsArray.length === 0) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="mb-3 md:mb-4" 
      variants={container}
      initial="hidden"
      animate="show"
    >
      <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2">Story emotions:</h3>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {emotionsArray.map((emotion, index) => (
          <motion.div key={index} variants={item}>
            <Badge variant="outline" className="text-[10px] md:text-xs">
              {emotion}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StoryEmotions;
