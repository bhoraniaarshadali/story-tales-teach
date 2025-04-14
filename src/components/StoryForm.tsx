import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen, TrendingUp } from "lucide-react";
interface StoryFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}
const StoryForm: React.FC<StoryFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const [topic, setTopic] = useState("");
  const popularTopics = ["Artificial Intelligence", "Blockchain", "Meditation", "Climate Change", "Quantum Physics", "Time Management", "Growth Mindset", "Financial Literacy"];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
    }
  };
  const handleTopicClick = (selectedTopic: string) => {
    setTopic(selectedTopic);
    onSubmit(selectedTopic);
  };
  return <Card className="w-full max-w-md p-6 space-y-6 bg-card">
      <div>
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-primary" />
          What would you like to learn about?
        </h2>
        <p className="text-muted-foreground text-sm">Enter any topic and get a fun Hinglish story that explains it</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter any topic (e.g., 'Photosynthesis', 'Time management', 'Empathy')" className="w-full" disabled={isLoading} />
        
        <Button type="submit" className="w-full" disabled={!topic.trim() || isLoading}>
          {isLoading ? "Creating Story..." : <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create Learning Story
            </>}
        </Button>
      </form>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground flex items-center">
          <TrendingUp className="mr-1 h-4 w-4" />
          Popular topics:
        </p>
        <div className="flex flex-wrap gap-2">
          {popularTopics.map(popularTopic => <Button key={popularTopic} variant="outline" size="sm" onClick={() => handleTopicClick(popularTopic)} disabled={isLoading} className="text-xs">
              {popularTopic}
            </Button>)}
        </div>
      </div>
    </Card>;
};
export default StoryForm;