import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Book, Brain, Lightbulb } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type Story } from "../pages/Index";
import { useAccessibility } from "../contexts/AccessibilityContext";
import AudioNarration from "./AudioNarration";
import ReactMarkdown from "react-markdown";
import { ChatLayout, ChatBubble } from "./ui/ChatLayout";

interface StoryDisplayProps {
  story: Story | null;
  onToggleFavorite?: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onToggleFavorite }) => {
  const { textSize } = useAccessibility();

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

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="lg:hidden">
        {/* Mobile Chat Layout */}
        <ChatLayout>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">{story.title}</h2>
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                aria-label={story.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-5 w-5 ${story.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              </Button>
            )}
          </div>

          <ChatBubble
            content={
              <div className="flex flex-col gap-2">
                {emotionsArray.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {emotionsArray.map((emotion, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className={`prose prose-purple max-w-none ${textSizeClasses[textSize]}`}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="text-current">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {story.content}
                  </ReactMarkdown>
                </div>
              </div>
            }
            avatarFallback={story.character?.emoji || "📚"}
          />

          <ChatBubble
            content={
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold">Learning Takeaway</span>
                </div>
                <p className={`${textSizeClasses[textSize]}`}>{story.takeaway}</p>
              </div>
            }
            avatarFallback="💡"
          />

          {story.keyPoints && story.keyPoints.length > 0 && (
            <ChatBubble
              content={
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    <span className="font-semibold">Key Points</span>
                  </div>
                  <ul className={`list-disc list-inside space-y-1 ${textSizeClasses[textSize]}`}>
                    {story.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              }
              avatarFallback="📝"
            />
          )}

          <div className="mt-4">
            <AudioNarration
              text={story.content}
              characterName={story.character?.name}
            />
          </div>
        </ChatLayout>
      </div>

      {/* Desktop Card Layout */}
      <Card className="p-6 shadow-lg border-primary/20 bg-card hidden lg:block">
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
          <ReactMarkdown
            components={{
              p: ({ node, children }) => (
                <p className="mb-4 text-foreground/90">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-primary">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-muted-foreground">{children}</em>
              ),
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-primary mt-6 mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-foreground mt-4 mb-2">{children}</h2>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1">{children}</ul>
              ),
            }}
          >
            {story.content}
          </ReactMarkdown>
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
