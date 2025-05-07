
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Book, Brain, Lightbulb, Share2, Facebook, Twitter, Send, MessageCircle, UserCircle, Link, Copy, Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type Story } from "../pages/Index";
import { useAccessibility } from "../contexts/AccessibilityContext";
import AudioNarration from "./AudioNarration";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { createShareableUrl, shareContent } from "../utils/shareUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "../hooks/use-mobile";

interface StoryDisplayProps {
  story: Story | null;
  onToggleFavorite?: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onToggleFavorite }) => {
  const { textSize } = useAccessibility();
  const isMobile = useIsMobile();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

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

  // Social share as image logic
  const handleShareImage = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      useCORS: true,
      scale: 2
    });
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await (await fetch(dataUrl)).blob();

    // Only share the image (no caption). If native share is not available, just download the image and show a simple toast.
    if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'story.png', { type: 'image/png' })] })) {
      try {
        await navigator.share({
          files: [new File([blob], 'story.png', { type: 'image/png' })],
          title: story.title
        });
        return;
      } catch (e) {
        // fallback to download
      }
    }
    // Fallback: download image and show a simple toast
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'story.png';
    link.click();
    toast.success('Image downloaded! Now share it on your favorite app.');
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

  return (
    <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mt-4 md:mt-8 px-2 sm:px-0">
      <Card ref={cardRef} className="p-4 md:p-6 shadow-lg border-primary/20 bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 md:mb-6 gap-3">
          <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
            <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-accent flex-shrink-0">
              <AvatarFallback className="text-base md:text-lg">{story.character?.emoji || "📚"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{story.title}</h2>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  aria-label="Share story"
                  title="Share story"
                >
                  <Share2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShareLink}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Link className="h-4 w-4 mr-2" />
                  )}
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareImage}>
                  <Copy className="h-4 w-4 mr-2" />
                  Share as image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                className="flex-shrink-0"
                aria-label={story.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-5 w-5 md:h-6 md:w-6 ${story.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Personalization details */}
        {story.personalizedFor && story.personalizedFor.length > 0 && (
          <div className="mb-3 md:mb-4 bg-primary/10 p-2 md:p-3 rounded-md border border-primary/20">
            <h3 className="text-xs md:text-sm font-medium text-primary/80 mb-1 md:mb-2 flex items-center">
              <UserCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              Personalized for you:
            </h3>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {story.personalizedFor.map((aspect, index) => (
                <Badge key={index} variant="outline" className="text-[10px] md:text-xs bg-primary/5">
                  {aspect}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {emotionsArray.length > 0 && (
          <div className="mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-2">Story emotions:</h3>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {emotionsArray.map((emotion, index) => (
                <Badge key={index} variant="outline" className="text-[10px] md:text-xs">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3 md:mb-4">
          <AudioNarration
            text={story.content}
            characterName={story.character?.name}
          />
        </div>

        <div className={`prose prose-purple max-w-none ${textSizeClasses[textSize]}`}>
          {story.content.split("\n\n").map((paragraph, i) => {
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
              <p key={i} className="mb-3 md:mb-4 text-foreground/90 text-sm md:text-base">
                {paragraph}
              </p>
            );
          })}
        </div>

        <div className="mt-6 md:mt-8 p-3 md:p-4 bg-muted rounded-md border border-border">
          <h3 className="text-base md:text-lg font-semibold text-primary mb-2 flex items-center">
            <Lightbulb className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-amber-500" />
            Learning Takeaway
          </h3>
          <p className={`italic text-foreground/80 text-sm md:text-base ${textSizeClasses[textSize]}`}>{story.takeaway}</p>
        </div>

        {story.keyPoints && story.keyPoints.length > 0 && (
          <div className="mt-3 md:mt-4 p-3 md:p-4 bg-accent/10 rounded-md border border-border">
            <h3 className="text-base md:text-lg font-semibold text-primary mb-2 flex items-center">
              <Book className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
              Key Points
            </h3>
            <ul className={`list-disc list-inside space-y-1 text-sm md:text-base ${textSizeClasses[textSize]}`}>
              {story.keyPoints.map((point, index) => (
                <li key={index} className="text-foreground/80">{point}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StoryDisplay;
