
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StoryDisplayProps {
  story: {
    title: string;
    content: string;
    takeaway: string;
  } | null;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story }) => {
  if (!story) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <Card className="p-6 shadow-lg border-primary/20 bg-card">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">{story.title}</h2>
          <Badge variant="outline" className="text-sm bg-accent/30">Hinglish Story</Badge>
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
