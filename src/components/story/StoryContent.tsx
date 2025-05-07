
import React from "react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface StoryContentProps {
  content: string;
}

const StoryContent: React.FC<StoryContentProps> = ({ content }) => {
  const { textSize } = useAccessibility();
  
  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  return (
    <motion.div 
      className={`prose prose-purple max-w-none ${textSizeClasses[textSize]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {content.split("\n\n").map((paragraph, i) => {
        if (paragraph.includes('<div class="suggestion-box">')) {
          return (
            <motion.div
              key={i}
              className="my-3 md:my-4"
              dangerouslySetInnerHTML={createMarkup(paragraph)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            />
          );
        }
        return (
          <motion.p 
            key={i} 
            className="mb-3 md:mb-4 text-foreground/90 text-sm md:text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
          >
            {paragraph}
          </motion.p>
        );
      })}
    </motion.div>
  );
};

export default StoryContent;
