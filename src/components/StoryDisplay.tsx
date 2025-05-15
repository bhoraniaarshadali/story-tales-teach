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

// Story interface ko generator.ts ke hisaab se extend karte hain
interface StoryWithExtras extends Story {
  funFact?: string; // Mazedaar tathya jo generator.ts se aata hai
  retryCount?: number; // Kitni baar retry kiya
  usedFallbackModel?: boolean; // Backup model use hua ya nahi
  qualityWarning?: boolean; // Story mein koi dikkat hai toh
  errorDetails?: string; // Error ka detail
}

// Props define karte hain, StoryDisplay ke liye
interface StoryDisplayProps {
  story: StoryWithExtras;
  isEditable?: boolean;
  onEdit?: (newContent: string) => void;
  onToggleFavorite?: () => void;
  theme?: "light" | "dark";
}

// Main component - story ko dikhane ka kaam yahan hota hai
const StoryDisplay: React.FC<StoryDisplayProps> = ({
  story,
  isEditable = false,
  onEdit,
  onToggleFavorite,
  theme = "light"
}) => {
  // States banaye - editing, progress, feedback ke liye
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(story.content || "");
  const [readingProgress, setReadingProgress] = useState(0);
  const [likes, setLikes] = useState(story.likes || 0);
  const [dislikes, setDislikes] = useState(story.dislikes || 0);
  const [userFeedback, setUserFeedback] = useState<"like" | "dislike" | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const storyContentRef = useRef<HTMLDivElement>(null);

  // Reading progress calculate karne ka logic
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

  // Feedback load karne ka logic - likes aur dislikes database se
  useEffect(() => {
    const loadFeedback = async () => {
      if (story.id) {
        try {
          const feedbackStats = await getStoryFeedback(story.id);
          if (feedbackStats) {
            setLikes(feedbackStats.likes);
            setDislikes(feedbackStats.dislikes);
            setUserFeedback(feedbackStats.userInteraction || null);
            console.log(`✅ Feedback load hua for story "${story.id}"`);
          }
        } catch (error) {
          console.error(`🛑 Feedback load mein error: ${error}`);
          toast.error("Feedback load nahi hua, thodi dikkat hai!");
        }
      }
    };
    loadFeedback();
  }, [story.id]);

  // Content edit karne ka function
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
  };

  // Edit button ka logic
  const handleEditClick = () => {
    setIsEditing(true);
    toast.info("Edit mode on, bhai!");
  };

  // Save button ka logic
  const handleSaveClick = () => {
    if (onEdit) {
      onEdit(editableContent);
    }
    setIsEditing(false);
    toast.success("Changes save ho gaye!");
  };

  // Cancel button ka logic
  const handleCancelClick = () => {
    setEditableContent(story.content || "");
    setIsEditing(false);
    toast.info("Editing cancel kiya gaya.");
  };

  // Share button ka logic - story ko share ya clipboard pe copy
  const handleShare = async () => {
    if (!story.id) {
      toast.error("Story ID nahi hai, share nahi kar sakte!");
      return;
    }

    setIsSharing(true);
    try {
      const shareUrl = createShareableUrl(story.id);
      const shareText = formatStoryForSharing({
        title: story.title || "Bina Naam ki Kahani",
        content: story.content || "Koi content nahi mila.",
        takeaway: story.takeaway || "Kuch seekhne ko nahi mila.",
        keyPoints: story.keyPoints || []
      });

      const success = await shareContent(
        story.title || "Bina Naam ki Kahani",
        shareText,
        shareUrl
      );

      if (success) {
        toast.success("Story share ho gayi, bhai!");
      } else {
        toast.error("Share nahi hua, thodi dikkat hai.");
      }
    } catch (error) {
      console.error(`🛑 Share mein error: ${error}`);
      toast.error("Share nahi hua, dobara try karo!");
    } finally {
      setIsSharing(false);
    }
  };

  // Like/dislike feedback ka logic
  const handleFeedback = async (type: "like" | "dislike") => {
    if (!story.id) {
      toast.error("Story ID nahi hai, feedback nahi de sakte!");
      return;
    }

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

    try {
      const action = newFeedbackState === type ? "add" : "remove";
      const result = await updateStoryFeedback(story.id, type, action);

      if (!result) {
        setUserFeedback(prevFeedbackState);
        setLikes(story.likes || 0);
        setDislikes(story.dislikes || 0);
        toast.error("Feedback update nahi hua, dobara try karo!");
      } else {
        toast.success(type === "like" ? "Like diya, shabaash!" : "Dislike diya, koi baat nahi!");
      }
    } catch (error) {
      console.error(`🛑 Feedback update mein error: ${error}`);
      setUserFeedback(prevFeedbackState);
      setLikes(story.likes || 0);
      setDislikes(story.dislikes || 0);
      toast.error("Feedback update nahi hua, thodi dikkat hai!");
    }
  };

  // Quote copy karne ka logic
  const handleCopyQuote = (quoteText: string) => {
    navigator.clipboard.writeText(quoteText)
      .then(() => {
        toast.success("Quote clipboard pe copy ho gaya!");
      })
      .catch(() => {
        toast.error("Quote copy nahi hua, dobara try karo!");
      });
  };

  // Quality warning ya error details dikhane ka logic
  const renderStoryStatus = () => {
    if (story.qualityWarning) {
      return (
        <Badge variant="destructive" className="mt-2">
          Thodi dikkat hai, story poori nahi hai. Dobara try kar sakte ho!
        </Badge>
      );
    }
    if (story.errorDetails) {
      return (
        <Badge variant="secondary" className="mt-2">
          Error: {story.errorDetails} (Retries: {story.retryCount || 0})
        </Badge>
      );
    }
    if (story.usedFallbackModel) {
      return (
        <Badge variant="outline" className="mt-2">
          Backup system se story bani hai!
        </Badge>
      );
    }
    return null;
  };

  // Fun fact dikhane ka logic
  const renderFunFact = () => {
    if (story.funFact) {
      return (
        <div className={cn(
          "mt-4 p-3 rounded-md",
          theme === "dark" ? "bg-gray-700" : "bg-yellow-100"
        )}>
          <strong>Insightful Fact: </strong>{story.funFact}
        </div>
      );
    }
    return null;
  };

  // Render ka main part - story ka UI banega yahan
  return (
    <div className={cn(
      "relative rounded-lg shadow-md",
      theme === "dark" ? "bg-gray-800/60 border border-gray-700/50" : "bg-white/70 border border-white/60"
    )}>
      {/* Difficulty badge - story ka level dikhata hai */}
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
        {/* Header - title, character, aur status */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className={cn(
            "text-2xl font-semibold",
            theme === "dark" ? "text-white" : "text-gray-800"
          )}>
            {story.title || "Bina Naam ki Kahani"}
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
        {renderStoryStatus()}

        {/* Emotions dikhane ka section */}
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

        {/* Story content - markdown ya edit mode */}
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
              {story.content || "Koi content nahi mila."}
            </ReactMarkdown>
            {renderFunFact()}
          </div>
        )}

        {/* Reading progress bar */}
        <Progress
          value={readingProgress}
          className="mt-2"
          aria-label="Reading progress"
        />

        {/* Takeaway section */}
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

        {/* Key points section */}
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

        {/* Action buttons - like, dislike, favorite, share, edit */}
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
                  <p>Is story ko like karo</p>
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
                  <p>Is story ko dislike karo</p>
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
                    aria-label={story.isFavorite ? "Favorite se hatao" : "Favorite mein daalo"}
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
                  <p>{story.isFavorite ? "Favorite se hatao" : "Favorite mein daalo"}</p>
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
                    aria-label="Is story ko share karo"
                  >
                    <Share2 className={isSharing ? "animate-pulse" : ""} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Is story ko share karo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Edit controls */}
          {isEditable && (
            <div className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSaveClick}
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1"
                    aria-label="Changes save karo"
                  >
                    <Save size={16} /> Save
                  </Button>
                  <Button
                    onClick={handleCancelClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    aria-label="Editing cancel karo"
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
                  aria-label="Story edit karo"
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