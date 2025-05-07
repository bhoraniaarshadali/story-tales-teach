
import React from "react";
import { Book } from "lucide-react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface StoryKeyPointsProps {
  keyPoints?: string[];
}

const StoryKeyPoints: React.FC<StoryKeyPointsProps> = ({ keyPoints }) => {
  const { textSize } = useAccessibility();
  
  if (!keyPoints || keyPoints.length === 0) return null;
  
  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

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
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="mt-3 md:mt-4 p-3 md:p-4 bg-accent/10 rounded-md border border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <h3 className="text-base md:text-lg font-semibold text-primary mb-2 flex items-center">
        <Book className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
        Key Points
      </h3>
      <motion.ul 
        className={`list-disc list-inside space-y-1 ${textSizeClasses[textSize]}`}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {keyPoints.map((point, index) => (
          <motion.li key={index} className="text-foreground/80" variants={item}>
            {point}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
};

export default StoryKeyPoints;
