import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Story } from "@/hooks/useStoryManager";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Heart,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Save,
  X
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createShareableUrl, shareContent } from "@/utils/shareUtils";
import { updateStoryFeedback, getStoryFeedback, handleFeedbackOptimistic } from "@/utils/feedbackUtils";

interface StoryDisplayProps {
  story: Story;
  isEditable?: boolean;
  onEdit?: (newContent: string) => void;
  onToggleFavorite?: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  story,
  isEditable = false,
  onEdit,
  onToggleFavorite
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(story.content);
  const [readingProgress, setReadingProgress] = useState(0);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userFeedback, setUserFeedback] = useState<"like" | "dislike" | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const storyContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateReadingProgress = () => {
      if (!storyContentRef.current) return;

      const element = storyContentRef.current;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const scrollTop = element.scrollTop;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setReadingProgress(progress);
    };

    const element = storyContentRef.current;
    if (element) {
      element.addEventListener('scroll', calculateReadingProgress);
      calculateReadingProgress(); // Initial calculation
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', calculateReadingProgress);
      }
    };
  }, []);

  // Load story feedback when the component mounts
  useEffect(() => {
    const loadFeedback = async () => {
      if (story.id) {
        const feedbackStats = await getStoryFeedback(story.id);
        if (feedbackStats) {
          setLikes(feedbackStats.likes);
          setDislikes(feedbackStats.dislikes);
          setUserFeedback(feedbackStats.userInteraction || null);
        }
      }
    };

    loadFeedback();
  }, [story.id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (onEdit) {
      onEdit(editableContent);
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditableContent(story.content);
    setIsEditing(false);
  };

  const handleShare = async () => {
    if (!story.id) return;

    setIsSharing(true);
    try {
      const shareUrl = createShareableUrl(story.id);
      const shareText = `Check out this amazing story: "${story.title}"`;

      const success = await shareContent(
        story.title,
        shareText,
        shareUrl
      );

      if (success) {
        toast.success("Story link copied to clipboard!");
      } else {
        toast.error("Failed to share story. Please try again.");
      }
    } catch (error) {
      console.error("Error sharing story:", error);
      toast.error("Failed to share story. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleFeedback = async (type: "like" | "dislike") => {
    if (!story.id) return;

    // Optimistic UI update
    const newFeedbackState = handleFeedbackOptimistic(story.id, type, userFeedback);
    const prevFeedbackState = userFeedback;

    // Update local state for immediate feedback
    if (type === "like") {
      setLikes(prev => newFeedbackState === "like" ? prev + 1 : prev - 1);
      if (prevFeedbackState === "dislike") setDislikes(prev => prev - 1);
    } else {
      setDislikes(prev => newFeedbackState === "dislike" ? prev + 1 : prev - 1);
      if (prevFeedbackState === "like") setLikes(prev => prev - 1);
    }
    setUserFeedback(newFeedbackState);

    // Update in the backend
    const action = newFeedbackState === type ? "add" : "remove";
    const result = await updateStoryFeedback(story.id, type, action);

    if (!result) {
      // Revert optimistic update if backend update fails
      setUserFeedback(prevFeedbackState);
      setLikes(result?.likes || likes);
      setDislikes(result?.dislikes || dislikes);
      toast.error("Failed to update feedback. Please try again.");
    }
  };

  return (
    <div className="relative rounded-lg shadow-md bg-card text-card-foreground">
      {story.difficulty && (
        <Badge
          className="absolute top-2 right-2 z-10"
          variant={
            story.difficulty === "beginner"
              ? "outline"
              : story.difficulty === "intermediate"
                ? "secondary"
                : "destructive"
          }
        >
          {story.difficulty}
        </Badge>
      )}

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{story.title}</h2>
          {story.character && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`} />
                <AvatarFallback>{story.character.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{story.character.name}</span>
            </div>
          )}
        </div>

        {story.emotions && (
          <div className="mb-4">
            <strong>Emotions:</strong>{" "}
            {Array.isArray(story.emotions)
              ? story.emotions.join(", ")
              : story.emotions}
          </div>
        )}

        {isEditing ? (
          <textarea
            value={editableContent}
            onChange={handleContentChange}
            className="w-full h-64 p-3 border rounded-md resize-none focus:outline-none focus:ring focus:border-primary"
          />
        ) : (
          <div
            ref={storyContentRef}
            className="prose prose-sm md:prose-base max-w-none text-gray-800 dark:text-gray-200 max-h-[400px] overflow-y-auto leading-relaxed"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {story.content}
            </ReactMarkdown>
          </div>
        )}

        <Progress value={readingProgress} className="mt-2" />

        {story.takeaway && (
          <div className="mt-4">
            <strong className="text-gray-800 dark:text-gray-200">Key Takeaway:</strong>
            <p className="text-gray-600 dark:text-gray-400">{story.takeaway}</p>
          </div>
        )}

        {story.keyPoints && story.keyPoints.length > 0 && (
          <div className="mt-4">
            <strong className="text-gray-800 dark:text-gray-200">Key Points:</strong>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
              {story.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "hover:bg-primary/10",
                      userFeedback === "like" && "text-green-600 bg-green-100 dark:bg-green-900/20"
                    )}
                    onClick={() => handleFeedback("like")}
                  >
                    <ThumbsUp className={cn(
                      userFeedback === "like" ? "fill-current" : ""
                    )} />
                    {likes > 0 && <span className="ml-1 text-xs">{likes}</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Like this story</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "hover:bg-primary/10",
                      userFeedback === "dislike" && "text-red-600 bg-red-100 dark:bg-red-900/20"
                    )}
                    onClick={() => handleFeedback("dislike")}
                  >
                    <ThumbsDown className={cn(
                      userFeedback === "dislike" ? "fill-current" : ""
                    )} />
                    {dislikes > 0 && <span className="ml-1 text-xs">{dislikes}</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dislike this story</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "hover:bg-primary/10",
                      story.isFavorite && "text-red-600"
                    )}
                    onClick={onToggleFavorite}
                    disabled={!onToggleFavorite}
                  >
                    <motion.div
                      whileTap={story.isFavorite ? { scale: 0.8 } : { scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 10 }}
                    >
                      <Heart className={cn(
                        story.isFavorite ? "fill-red-600 stroke-red-600" : ""
                      )} />
                    </motion.div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{story.isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10"
                    onClick={handleShare}
                    disabled={isSharing || !story.id}
                  >
                    <Share2 className={isSharing ? "animate-pulse" : ""} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share this story</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {isEditable && (
            <div className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSaveClick}
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Save size={16} /> Save
                  </Button>
                  <Button
                    onClick={handleCancelClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <X size={16} /> Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEditClick}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Edit size={16} /> Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryDisplay;