import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
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
  X,
  Copy
} from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createShareableUrl, shareContent, formatStoryForSharing } from "@/utils/shareUtils";
import { updateStoryFeedback, getStoryFeedback, handleFeedbackOptimistic } from "@/utils/feedbackUtils";

interface StoryWithExtras extends Story {
  funFact?: string;
}

interface StoryDisplayProps {
  story: StoryWithExtras;
  isEditable?: boolean;
  onEdit?: (newContent: string) => void;
  onToggleFavorite?: () => void;
  theme?: "light" | "dark";
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  story,
  isEditable = false,
  onEdit,
  onToggleFavorite,
  theme = "light"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(story.content || "");
  const [readingProgress, setReadingProgress] = useState(0);
  const [likes, setLikes] = useState(story.likes || 0);
  const [dislikes, setDislikes] = useState(story.dislikes || 0);
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
      calculateReadingProgress();
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', calculateReadingProgress);
      }
    };
  }, []);

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
    setEditableContent(story.content || "");
    setIsEditing(false);
  };

  const handleShare = async () => {
    if (!story.id) return;

    setIsSharing(true);
    try {
      const shareUrl = createShareableUrl(story.id);
      const shareText = formatStoryForSharing({
        title: story.title || "Untitled Story",
        content: story.content || "No content available.",
        takeaway: story.takeaway || "No takeaway available.",
        keyPoints: story.keyPoints || []
      });

      const success = await shareContent(
        story.title || "Untitled Story",
        shareText,
        shareUrl
      );

      if (success) {
        toast.success("Story copied to clipboard!");
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

    const newFeedbackState = handleFeedbackOptimistic(story.id, type, userFeedback);
    const prevFeedbackState = userFeedback;

    if (type === "like") {
      setLikes(prev => newFeedbackState === "like" ? prev + 1 : prev - 1);
      if (prevFeedbackState === "dislike") setDislikes(prev => prev - 1);
    } else {
      setDislikes(prev => newFeedbackState === "dislike" ? prev + 1 : prev - 1);
      if (prevFeedbackState === "like") setLikes(prev => prev - 1);
    }
    setUserFeedback(newFeedbackState);

    const action = newFeedbackState === type ? "add" : "remove";
    const result = await updateStoryFeedback(story.id, type, action);

    if (!result) {
      setUserFeedback(prevFeedbackState);
      setLikes(result?.likes || likes);
      setDislikes(result?.dislikes || dislikes);
      toast.error("Failed to update feedback. Please try again.");
    }
  };

  const handleCopyQuote = (quoteText: string) => {
    navigator.clipboard.writeText(quoteText)
      .then(() => {
        toast.success("Quote copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy quote. Please try again.");
      });
  };

  return (
    <div className={cn(
      "relative rounded-lg shadow-md",
      theme === "dark" ? "bg-gray-800/60 border border-gray-700/50" : "bg-white/70 border border-white/60"
    )}>
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
          <h2 className={cn(
            "text-2xl font-semibold",
            theme === "dark" ? "text-white" : "text-gray-800"
          )}>
            {story.title || "Untitled Story"}
          </h2>
          {story.character && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`} />
                <AvatarFallback>{story.character.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className={cn(
                    "text-sm font-medium",
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  )}>
                    {story.character.name || "Unknown"}
                  </span>
                  {story.character.emoji && (
                    <span className="text-sm">{story.character.emoji}</span>
                  )}
                </div>
                {story.character.traits && (
                  <span className={cn(
                    "text-xs italic",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}>
                    {story.character.traits}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {story.emotions && (
          <div className="mb-4">
            <strong className={cn(
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            )}>
              Emotions:
            </strong>{" "}
            <span className={cn(
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              {Array.isArray(story.emotions)
                ? story.emotions.join(", ")
                : story.emotions}
            </span>
          </div>
        )}

        {isEditing ? (
          <textarea
            value={editableContent}
            onChange={handleContentChange}
            className={cn(
              "w-full h-64 p-3 border rounded-md resize-none focus:outline-none focus:ring focus:border-primary",
              theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"
            )}
            aria-label="Edit story content"
          />
        ) : (
          <div
            ref={storyContentRef}
            className={cn(
              "prose prose-sm md:prose-base max-w-none max-h-[500px] sm:max-h-[600px] overflow-y-auto leading-relaxed scrollbar-thin",
              theme === "dark"
                ? "text-gray-200 scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                : "text-gray-800 scrollbar-thumb-gray-300 scrollbar-track-transparent"
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                div: ({ node, className, children, ...props }) => {
                  if (className === "centered-quote" || className === "centered-quote'") {
                    const quoteText = typeof children === "string" ? children : String(children);
                    return (
                      <div className="relative">
                        <blockquote className={cn(
                          "text-center italic border-l-4 pl-4 my-4",
                          theme === "dark"
                            ? "text-gray-400 border-gray-400"
                            : "text-gray-600 border-gray-400"
                        )}>
                          {children}
                        </blockquote>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "absolute top-0 right-0",
                            theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"
                          )}
                          onClick={() => handleCopyQuote(quoteText)}
                          aria-label="Copy quote"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                    );
                  }
                  if (typeof children === "string" && children.startsWith("Did You Know?")) {
                    return (
                      <div className={cn(
                        "p-4 my-4 rounded-lg border",
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-100 border-gray-300"
                      )}>
                        {children}
                      </div>
                    );
                  }
                  return <div {...props}>{children}</div>;
                },
                strong: ({ node, ...props }) => (
                  <strong
                    className={cn(
                      "font-bold",
                      theme === "dark"
                        ? "text-gray-100 underline decoration-gray-400"
                        : "text-gray-900 underline decoration-gray-500"
                    )}
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p className="my-2 emoji-support" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className={cn(
                    "list-disc list-inside my-2",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )} {...props} />
                ),
              }}
            >
              {story.content || "No content available."}
            </ReactMarkdown>
          </div>
        )}

        <Progress
          value={readingProgress}
          className="mt-2"
          aria-label="Reading progress"
        />

        {story.takeaway && (
          <div className="mt-4">
            <strong className={cn(
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            )}>
              Key Takeaway:
            </strong>
            <p className={cn(
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              {story.takeaway}
            </p>
          </div>
        )}

        {story.keyPoints && story.keyPoints.length > 0 && (
          <div className="mt-4">
            <strong className={cn(
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            )}>
              Key Points:
            </strong>
            <ul className={cn(
              "list-disc list-inside",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
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
                      userFeedback === "like" && (theme === "dark" ? "text-green-400 bg-green-900/20" : "text-green-600 bg-green-100")
                    )}
                    onClick={() => handleFeedback("like")}
                    aria-label="Like this story"
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
                      userFeedback === "dislike" && (theme === "dark" ? "text-red-400 bg-red-900/20" : "text-red-600 bg-red-100")
                    )}
                    onClick={() => handleFeedback("dislike")}
                    aria-label="Dislike this story"
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
                      story.isFavorite && (theme === "dark" ? "text-red-400" : "text-red-600")
                    )}
                    onClick={onToggleFavorite}
                    disabled={!onToggleFavorite}
                    aria-label={story.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <motion.div
                      whileTap={story.isFavorite ? { scale: 0.8 } : { scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 10 }}
                    >
                      <Heart className={cn(
                        story.isFavorite && (theme === "dark" ? "fill-red-400 stroke-red-400" : "fill-red-600 stroke-red-600")
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
                    aria-label="Share this story"
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
                    aria-label="Save changes"
                  >
                    <Save size={16} /> Save
                  </Button>
                  <Button
                    onClick={handleCancelClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    aria-label="Cancel editing"
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
                  aria-label="Edit story"
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