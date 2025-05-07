
import React from "react";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";
import { motion } from "framer-motion";

interface StoryPersonalizationProps {
  personalizedFor: string[] | undefined;
}

const StoryPersonalization: React.FC<StoryPersonalizationProps> = ({ personalizedFor }) => {
  if (!personalizedFor || personalizedFor.length === 0) return null;

  const container = {
    hidden: { opacity: 0, y: -10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -5 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="mb-3 md:mb-4 bg-primary/10 p-2 md:p-3 rounded-md border border-primary/20"
      variants={container}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xs md:text-sm font-medium text-primary/80 mb-1 md:mb-2 flex items-center">
        <UserCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
        Personalized for you:
      </h3>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {personalizedFor.map((aspect, index) => (
          <motion.div key={index} variants={item}>
            <Badge variant="outline" className="text-[10px] md:text-xs bg-primary/5">
              {aspect}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StoryPersonalization;
