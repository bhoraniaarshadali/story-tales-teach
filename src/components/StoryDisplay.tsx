
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type Story } from "../pages/Index";

interface StoryDisplayProps {
  story: Story | null;
  onToggleFavorite?: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onToggleFavorite }) => {
  if (!story) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <Card className="p-6 shadow-lg border-primary/20 bg-card">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-accent">
              <AvatarFallback className="text-lg">{story.character?.emoji || "📚"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-primary">{story.title}</h2>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-sm bg-accent/30">Hinglish Story</Badge>
                {story.topic && (
                  <Badge variant="secondary" className="text-sm">{story.topic}</Badge>
                )}
              </div>
            </div>
          </div>
          
          {onToggleFavorite && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleFavorite}
              className="flex-shrink-0"
            >
              <Heart className={`h-6 w-6 ${story.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            </Button>
          )}
        </div>
        
        <div className="prose prose-purple max-w-none">
          {story.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-4 text-foreground/90">
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-muted rounded-md border border-border">
          <h3 className="text-lg font-semibold text-primary mb-2">🎓 Learning Takeaway</h3>
          <p className="italic text-foreground/80">{story.takeaway}</p>
        </div>
      </Card>
    </div>
  );
};

export default StoryDisplay;
