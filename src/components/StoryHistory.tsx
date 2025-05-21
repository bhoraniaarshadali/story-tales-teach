
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Search, BookOpen, Star, Brain } from "lucide-react";
import { type Story } from "../pages/Index";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StoryHistoryProps {
  stories: Story[];
  onViewStory: (storyId: string) => void;
  onToggleFavorite: (storyId: string) => void;
}

const StoryHistory: React.FC<StoryHistoryProps> = ({ 
  stories, 
  onViewStory,
  onToggleFavorite
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };
  
  // Filter and search stories
  const filteredStories = stories.filter(story => {
    // Apply favorite filter if selected
    if (filterFavorites && !story.isFavorite) return false;
    
    // Apply search filter if there's a search term
    if (searchTerm && !story.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !story.topic?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (stories.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-medium mb-2">No Stories Yet</h2>
        <p className="text-muted-foreground text-sm">
          Create your first story to see your history here!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or topic..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant={filterFavorites ? "default" : "outline"} 
          onClick={() => setFilterFavorites(!filterFavorites)}
          className="md:min-w-32"
        >
          <Heart className={`mr-2 h-4 w-4 ${filterFavorites ? "fill-current" : ""}`} />
          {filterFavorites ? "All Stories" : "Favorites"}
        </Button>
      </div>

      {filteredStories.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">No matching stories found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStories.map((story) => (
            <Card key={story.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-accent flex-shrink-0">
                  <AvatarFallback className="text-lg">{story.character?.emoji || "📚"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-base truncate">{story.title}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex-shrink-0" 
                      onClick={() => onToggleFavorite(story.id as string)}
                    >
                      <Heart className={`h-4 w-4 ${story.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
                    </Button>
                  </div>
                  
                  <div className="mt-1 flex flex-wrap gap-2">
                    {story.topic && (
                      <Badge variant="outline" className="text-xs">
                        {story.topic}
                      </Badge>
                    )}
                    {story.timestamp && (
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(story.timestamp)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs" 
                      onClick={() => onViewStory(story.id as string)}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      View Story
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryHistory;
