import React, { useState, useEffect, useRef } from "react";
import { Story } from "@/hooks/useStoryManager";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StoryDisplayProps {
  story: Story;
  isEditable?: boolean;
  onEdit?: (newContent: string) => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isEditable = false, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(story.content);
  const [readingProgress, setReadingProgress] = useState(0);
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
            className="story-content max-h-[400px] overflow-y-auto text-sm md:text-base leading-relaxed"
          >
            {story.content}
          </div>
        )}

        <Progress value={readingProgress} className="mt-2 bg-primary" />

        <div className="mt-4">
          <strong>Key Takeaway:</strong>
          <p className="text-gray-600 dark:text-gray-400">{story.takeaway}</p>
        </div>

        {story.keyPoints && story.keyPoints.length > 0 && (
          <div className="mt-4">
            <strong>Key Points:</strong>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
              {story.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {isEditable && (
          <div className="mt-6 flex justify-end space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveClick}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelClick}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDisplay;
