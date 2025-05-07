
import React from "react";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface StoryTakeawayProps {
  takeaway: string;
}

const StoryTakeaway: React.FC<StoryTakeawayProps> = ({ takeaway }) => {
  const { textSize } = useAccessibility();
  
  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  return (
    <motion.div 
      className="mt-6 md:mt-8 p-3 md:p-4 bg-muted rounded-md border border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="text-base md:text-lg font-semibold text-primary mb-2 flex items-center">
        <Lightbulb className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-amber-500" />
        Learning Takeaway
      </h3>
      <motion.p 
        className={`italic text-foreground/80 ${textSizeClasses[textSize]}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {takeaway}
      </motion.p>
    </motion.div>
  );
};

export default StoryTakeaway;
