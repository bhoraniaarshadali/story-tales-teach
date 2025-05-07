
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Brain, UserCircle, Share2, Check, Link, Copy } from "lucide-react";
import { type Story } from "@/hooks/useStoryManager";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface StoryHeaderProps {
  story: Story;
  onToggleFavorite?: () => void;
  onShareLink: () => void;
  onShareImage: () => void;
  copied: boolean;
}

const StoryHeader: React.FC<StoryHeaderProps> = ({ 
  story, 
  onToggleFavorite,
  onShareLink,
  onShareImage,
  copied
}) => {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row justify-between items-start mb-4 md:mb-6 gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
        <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-accent flex-shrink-0">
          <AvatarFallback className="text-base md:text-lg bg-accent/30 text-primary">
            {story.character?.emoji || "📚"}
          </AvatarFallback>
        </Avatar>
        <div>
          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {story.title}
          </motion.h2>
          <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
            {story.personalizedFor?.length ? (
              <Badge variant="default" className="text-xs md:text-sm bg-primary/80 flex items-center gap-1">
                <UserCircle className="h-3 w-3" />
                Personalized
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs md:text-sm bg-accent/30">Hinglish Story</Badge>
            )}
            
            {story.difficulty && (
              <Badge variant="secondary" className="text-xs md:text-sm">
                {story.difficulty} level
              </Badge>
            )}
            
            {story.topic && (
              <Badge variant="secondary" className="text-xs md:text-sm">{story.topic}</Badge>
            )}
            
            {story.character?.traits && (
              <Badge variant="outline" className="text-xs md:text-sm bg-muted">
                <Brain className="h-3 w-3 mr-1" />
                {story.character.traits}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-start mt-2 sm:mt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                aria-label="Share story"
                title="Share story"
              >
                <Share2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-primary/20">
            <DropdownMenuItem onClick={onShareLink} className="cursor-pointer">
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShareImage} className="cursor-pointer">
              <Copy className="h-4 w-4 mr-2" />
              Share as image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {onToggleFavorite && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="flex-shrink-0"
              aria-label={story.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-5 w-5 md:h-6 md:w-6 transition-colors duration-300 ${story.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StoryHeader;
