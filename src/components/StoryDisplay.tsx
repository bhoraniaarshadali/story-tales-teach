import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Book, Brain, Lightbulb, Share2, Facebook, Twitter, Send, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type Story } from "../pages/Index";
import { useAccessibility } from "../contexts/AccessibilityContext";
import AudioNarration from "./AudioNarration";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface StoryDisplayProps {
  story: Story | null;
  onToggleFavorite?: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onToggleFavorite }) => {
  const { textSize } = useAccessibility();
  const cardRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <Card ref={cardRef} className="p-6 shadow-lg border-primary/20 bg-card">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-accent">
              <AvatarFallback className="text-lg">{story.character?.emoji || "📚"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-primary">{story.title}</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="text-sm bg-accent/30">Hinglish Story</Badge>
                {story.topic && (
                  <Badge variant="secondary" className="text-sm">{story.topic}</Badge>
                )}
                {story.character?.traits && (
                  <Badge variant="outline" className="text-sm bg-muted">
                    <Brain className="h-3 w-3 mr-1" />
                    {story.character.traits}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShareImage}
              className="flex-shrink-0"
              aria-label="Share story as image"
              title="Share story as image"
            >
              <Share2 className="h-6 w-6 text-primary" />
            </Button>
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                className="flex-shrink-0"
                aria-label={story.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-6 w-6 ${story.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        {emotionsArray.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Story emotions:</h3>
            <div className="flex flex-wrap gap-2">
              {emotionsArray.map((emotion, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
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
                  className="my-4"
                  dangerouslySetInnerHTML={createMarkup(paragraph)}
                />
              );
            }
            return (
              <p key={i} className="mb-4 text-foreground/90">
                {paragraph}
              </p>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-muted rounded-md border border-border">
          <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
            Learning Takeaway
          </h3>
          <p className={`italic text-foreground/80 ${textSizeClasses[textSize]}`}>{story.takeaway}</p>
        </div>

        {story.keyPoints && story.keyPoints.length > 0 && (
          <div className="mt-4 p-4 bg-accent/10 rounded-md border border-border">
            <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
              <Book className="mr-2 h-5 w-5 text-primary" />
              Key Points
            </h3>
            <ul className={`list-disc list-inside space-y-1 ${textSizeClasses[textSize]}`}>
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
