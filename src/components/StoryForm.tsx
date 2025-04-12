
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StoryFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">What would you like to learn about?</h2>
        <Input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter any topic (e.g., 'Photosynthesis', 'Time management', 'Empathy')"
          className="w-full"
          disabled={isLoading}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!topic.trim() || isLoading}
      >
        {isLoading ? "Creating Story..." : "Create Learning Story"}
      </Button>
    </form>
  );
};

export default StoryForm;
