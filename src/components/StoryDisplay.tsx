
import React from "react";

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
      <div className="story-container">
        <h2 className="text-2xl font-bold text-primary mb-4">{story.title}</h2>
        <div className="prose prose-purple max-w-none">
          {story.content.split("\n").map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="takeaway-container">
          <h3 className="text-lg font-semibold text-primary mb-2">What You've Learned</h3>
          <p>{story.takeaway}</p>
        </div>
      </div>
    </div>
  );
};

export default StoryDisplay;
