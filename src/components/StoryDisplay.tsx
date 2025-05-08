import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart, Book, Brain, Lightbulb, Share2, MessageCircle, UserCircle,
  Link, Copy, Check, Bookmark, BookmarkCheck, Clock, Award, ChevronDown,
  ChevronUp, ThumbsUp, ThumbsDown, Star, Sparkles, Headphones
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type Story } from "../pages/Index";
import { useAccessibility } from "../contexts/AccessibilityContext";
import AudioNarration from "./AudioNarration";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { createShareableUrl, shareContent } from "../utils/shareUtils";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "../hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface StoryDisplayProps {
  story: Story | null;
  onToggleFavorite?: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onToggleFavorite }) => {
  const { textSize } = useAccessibility();
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);
  const storyContentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [reaction, setReaction] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const [animateCharacter, setAnimateCharacter] = useState(false);

  useEffect(() => {
    // Initial animation for character avatar
    setTimeout(() => {
      setAnimateCharacter(true);
      setTimeout(() => setAnimateCharacter(false), 1000);
    }, 500);

    // Set up scroll tracking for reading progress
    if (storyContentRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsReading(true);
              calculateReadingProgress();
            } else {
              setIsReading(false);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(storyContentRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isReading) {
        calculateReadingProgress();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isReading]);

  if (!story) return null;

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  // Handle emotions whether it's a string, array, or undefined
  const emotionsArray = Array.isArray(story.emotions)
    ? story.emotions
    : typeof story.emotions === 'string' && story.emotions
      ? story.emotions.split(',').map(e => e.trim())
      : [];

  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  const calculateReadingProgress = () => {
    if (!storyContentRef.current) return;

    const element = storyContentRef.current;
    const totalHeight = element.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY - element.offsetTop;

    const viewportHeight = Math.min(windowHeight, totalHeight);
    const viewableHeight = totalHeight - viewportHeight;

    const progress = Math.max(0, Math.min(100, (scrollTop / viewableHeight) * 100));
    setReadingProgress(progress);
  };

  // Social share as image logic
  const handleShareImage = async () => {
    if (!cardRef.current) return;

    toast.loading('Creating shareable image...', { id: 'shareImage' });

    // Temporarily show full content for the screenshot
    const wasShowingFull = showFullContent;
    setShowFullContent(true);

    // Wait for state update and re-render
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        useCORS: true,
        scale: 2
      });

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();

      // Reset content state
      if (!wasShowingFull) {
        setShowFullContent(false);
      }

      // Only share the image (no caption). If native share is not available, just download the image
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'story.png', { type: 'image/png' })] })) {
        try {
          toast.dismiss('shareImage');
          await navigator.share({
            files: [new File([blob], 'story.png', { type: 'image/png' })],
            title: story.title
          });
          return;
        } catch (e) {
          // fallback to download
        }
      }

      // Fallback: download image
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'story.png';
      link.click();
      toast.success('Image downloaded! Share it on your favorite app.');
    } catch (error) {
      toast.error('Failed to create image. Please try again.');
    } finally {
      toast.dismiss('shareImage');
      // Reset content state if needed
      if (!wasShowingFull) {
        setShowFullContent(false);
      }
    }
  };

  // Share as link
  const handleShareLink = async () => {
    if (!story.id) return;

    const shareUrl = createShareableUrl(story.id);
    const shareText = `Check out this learning story about ${story.topic}: ${story.title}`;
    const success = await shareContent(story.title, shareText, shareUrl);

    if (success) {
      toast.success('Link copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link. Please try again.');
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Story removed from reading list' : 'Story added to reading list');
  };

  const handleReaction = (type: string) => {
    setReaction(type);
    toast.success(`Thanks for your feedback!`);
  };

  // Determine content to display based on showFullContent state
  const paragraphs = story.content.split("\n\n");
  const displayParagraphs = showFullContent
    ? paragraphs
    : paragraphs.slice(0, Math.min(3, paragraphs.length));
  const hasMoreContent = paragraphs.length > 3;

  return (
    <TooltipProvider>
      <motion.div
        className="w-full max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mt-4 md:mt-8 px-2 sm:px-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card ref={cardRef} className="overflow-hidden bg-gradient-to-b from-card to-card/95 shadow-xl border-primary/20">
          {/* Reading progress bar */}
          {isReading && (
            <Progress
              value={readingProgress}
              className="h-1 w-full bg-primary/10 rounded-none"
              indicatorClassName="bg-primary"
            />
          )}

          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 md:mb-6 gap-3">
              <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
                <motion.div
                  animate={{
                    rotate: animateCharacter ? [0, -15, 15, -10, 10, -5, 5, 0] : 0,
                    scale: animateCharacter ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 1 }}
                >
                  <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-accent ring-2 ring-primary/20 ring-offset-2 flex-shrink-0 bg-accent/30">
                    <AvatarFallback className="text-xl md:text-2xl">{story.character?.emoji || "📚"}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <motion.h2
                    className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    {story.title}
                  </motion.h2>
                  <motion.div
                    className="flex flex-wrap gap-1 md:gap-2 mt-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {story.personalizedFor?.length ? (
                      <Badge variant="default" className="text-xs md:text-sm bg-primary/90 hover:bg-primary/80 flex items-center gap-1 transition-all duration-300 shadow-sm">
                        <UserCircle className="h-3 w-3" />
                        Personalized
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs md:text-sm bg-accent/40 hover:bg-accent/50 transition-all duration-300 shadow-sm">
                        <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                        Hinglish Story
                      </Badge>
                    )}

                    {story.difficulty && (
                      <Badge variant="secondary" className="text-xs md:text-sm shadow-sm hover:bg-secondary/80 transition-all duration-300">
                        <Award className="h-3 w-3 mr-1" />
                        {story.difficulty} level
                      </Badge>
                    )}

                    {story.topic && (
                      <Badge variant="secondary" className="text-xs md:text-sm shadow-sm hover:bg-secondary/80 transition-all duration-300">
                        {story.topic}
                      </Badge>
                    )}

                    {story.character?.traits && (
                      <Badge variant="outline" className="text-xs md:text-sm bg-muted/70 hover:bg-muted/90 shadow-sm transition-all duration-300">
                        <Brain className="h-3 w-3 mr-1" />
                        {story.character.traits}
                      </Badge>
                    )}
                  </motion.div>
                </div>
              </div>
              <motion.div
                className="flex items-center gap-2 self-end sm:self-start mt-2 sm:mt-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleBookmark}
                      className="flex-shrink-0 hover:bg-accent/20 transition-all duration-300"
                      aria-label={isBookmarked ? "Remove from reading list" : "Add to reading list"}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-5 w-5 md:h-6 md:w-6 text-primary fill-primary/20" />
                      ) : (
                        <Bookmark className="h-5 w-5 md:h-6 md:w-6 text-primary/80 hover:text-primary" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isBookmarked ? "Remove from reading list" : "Add to reading list"}
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 hover:bg-accent/20 transition-all duration-300"
                          aria-label="Share story"
                        >
                          <Share2 className="h-5 w-5 md:h-6 md:w-6 text-primary/80 hover:text-primary" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Share story</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-5">
                    <DropdownMenuItem onClick={handleShareLink} className="cursor-pointer flex items-center gap-2 hover:bg-accent/20">
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Link className="h-4 w-4" />
                      )}
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareImage} className="cursor-pointer flex items-center gap-2 hover:bg-accent/20">
                      <Copy className="h-4 w-4" />
                      Share as image
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {onToggleFavorite && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleFavorite}
                        className="flex-shrink-0 hover:bg-accent/20 transition-all duration-300"
                        aria-label={story.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart
                          className={cn(
                            "h-5 w-5 md:h-6 md:w-6 transition-all duration-300",
                            story.isFavorite
                              ? "fill-rose-500 text-rose-500 scale-110"
                              : "text-primary/80 hover:text-primary hover:scale-110"
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {story.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    </TooltipContent>
                  </Tooltip>
                )}
              </motion.div>
            </div>

            {/* Audio narration with enhanced UI */}
            <motion.div
              className="mb-4 md:mb-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 border border-primary/10 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h3 className="text-sm md:text-base font-medium text-primary">Listen to this story</h3>
              </div>
              <AudioNarration
                text={story.content}
                characterName={story.character?.name}
              />
            </motion.div>

            {/* Personalization details */}
            {story.personalizedFor && story.personalizedFor.length > 0 && (
              <motion.div
                className="mb-4 md:mb-6 bg-gradient-to-r from-primary/5 to-primary/15 p-3 md:p-4 rounded-lg border border-primary/20 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <h3 className="text-xs md:text-sm font-medium text-primary/90 mb-1 md:mb-2 flex items-center">
                  <UserCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Personalized for you:
                </h3>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {story.personalizedFor.map((aspect, index) => (
                    <Badge key={index} variant="outline" className="text-[10px] md:text-xs bg-primary/10 hover:bg-primary/20 transition-all duration-300">
                      {aspect}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Emotions */}
            {emotionsArray.length > 0 && (
              <motion.div
                className="mb-4 md:mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2 flex items-center">
                  <Star className="h-3 w-3 md:h-4 md:w-4 mr-1 text-amber-500" />
                  Story emotions:
                </h3>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {emotionsArray.map((emotion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-[10px] md:text-xs bg-accent/20 hover:bg-accent/30 transition-all duration-300"
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Estimated reading time */}
            <motion.div
              className="mb-4 md:mb-6 flex items-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Clock className="h-3 w-3 mr-1" />
              {Math.max(1, Math.ceil(story.content.split(' ').length / 200))} min read
            </motion.div>

            {/* Story content */}
            <motion.div
              ref={storyContentRef}
              className={`prose prose-purple max-w-none ${textSizeClasses[textSize]}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {displayParagraphs.map((paragraph, i) => {
                if (paragraph.includes('<div class="suggestion-box">')) {
                  return (
                    <div
                      key={i}
                      className="my-3 md:my-4"
                      dangerouslySetInnerHTML={createMarkup(paragraph)}
                    />
                  );
                }
                return (
                  <motion.p
                    key={i}
                    className="mb-3 md:mb-4 text-foreground/90 text-sm md:text-base"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1), duration: 0.4 }}
                  >
                    {paragraph}
                  </motion.p>
                );
              })}

              {/* Read more/less toggle */}
              {hasMoreContent && (
                <motion.div
                  className="text-center my-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullContent(!showFullContent)}
                    className="rounded-full bg-accent/10 hover:bg-accent/20 border-primary/10 text-primary font-medium"
                  >
                    {showFullContent ? (
                      <>Show less <ChevronUp className="ml-1 h-4 w-4" /></>
                    ) : (
                      <>Read more <ChevronDown className="ml-1 h-4 w-4" /></>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Learning Takeaway */}
            <motion.div
              className="mt-6 md:mt-8 p-4 md:p-5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h3 className="text-base md:text-lg font-semibold text-primary mb-2 flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                Learning Takeaway
              </h3>
              <p className={`italic text-foreground/90 text-sm md:text-base ${textSizeClasses[textSize]}`}>{story.takeaway}</p>
            </motion.div>

            {/* Key Points with toggle */}
            {story.keyPoints && story.keyPoints.length > 0 && (
              <motion.div
                className="mt-4 md:mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center p-3 rounded-lg border border-border bg-accent/5 hover:bg-accent/10 mb-2"
                  onClick={() => setShowKeyPoints(!showKeyPoints)}
                >
                  <div className="flex items-center">
                    <Book className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <h3 className="text-base md:text-lg font-semibold text-primary">Key Points</h3>
                  </div>
                  {showKeyPoints ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  )}
                </Button>

                <AnimatePresence>
                  {showKeyPoints && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 md:p-5 bg-muted/50 rounded-lg border border-border">
                        <ul className={`list-disc list-inside space-y-2 text-sm md:text-base ${textSizeClasses[textSize]}`}>
                          {story.keyPoints.map((point, index) => (
                            <motion.li
                              key={index}
                              className="text-foreground/90"
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index, duration: 0.3 }}
                            >
                              {point}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Reactions section */}
            <motion.div
              className="mt-6 md:mt-8 pt-4 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <p className="text-xs text-center text-muted-foreground mb-2">Was this story helpful to you?</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full border-primary/20 hover:bg-accent/10",
                    reaction === "liked" && "bg-primary/10 border-primary"
                  )}
                  onClick={() => handleReaction("liked")}
                >
                  <ThumbsUp className={cn(
                    "mr-1 h-4 w-4",
                    reaction === "liked" ? "text-primary" : "text-muted-foreground"
                  )} />
                  Helpful
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full border-primary/20 hover:bg-accent/10",
                    reaction === "disliked" && "bg-primary/10 border-primary"
                  )}
                  onClick={() => handleReaction("disliked")}
                >
                  <ThumbsDown className={cn(
                    "mr-1 h-4 w-4",
                    reaction === "disliked" ? "text-primary" : "text-muted-foreground"
                  )} />
                  Not helpful
                </Button>
              </div>
            </motion.div>

            {/* Comment section teaser */}
            <motion.div
              className="mt-6 md:mt-8 p-3 border-t border-border pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-muted/50 hover:bg-muted/70 text-muted-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                Add your thoughts on this story...
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default StoryDisplay;