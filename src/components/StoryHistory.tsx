import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Search, BookOpen } from "lucide-react";
import { Story } from "@/hooks/useStoryManager";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Props define karte hain - story history dikhane ke liye
interface StoryHistoryProps {
  stories: Story[];
  onViewStory: (storyId: string) => void;
  onToggleFavorite: (storyId: string) => void;
}

// Main component - story history ka UI yahan banega
const StoryHistory: React.FC<StoryHistoryProps> = ({
  stories,
  onViewStory,
  onToggleFavorite
}) => {
  // States banaye - search aur favorite filter ke liye
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Date format karne ka function - Indian style mein
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Stories filter aur search karne ka logic
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      // Favorite filter apply karo
      if (filterFavorites && !story.isFavorite) return false;

      // Search term ke hisaab se filter karo
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          story.title?.toLowerCase().includes(searchLower) ||
          story.topic?.toLowerCase().includes(searchLower) ||
          story.funFact?.toLowerCase().includes(searchLower) ||
          (Array.isArray(story.emotions)
            ? story.emotions.some(e => e.toLowerCase().includes(searchLower))
            : story.emotions?.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [stories, searchTerm, filterFavorites]);

  // Agar koi stories nahi hain toh empty state dikhao
  if (stories.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-medium mb-2">Koi Kahani Nahi Hai</h2>
        <p className="text-muted-foreground text-sm">
          Pehli kahani banao, history yahan dikhegi!
        </p>
      </div>
    );
  }

  // Main UI - search bar, filter button, aur story cards
  return (
    <div className="w-full">
      {/* Search aur filter controls */}
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Title, topic, fun fact ya emotions se search karo..."
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
          {filterFavorites ? "Sab Stories" : "Favorites"}
        </Button>
      </div>

      {/* Agar filtered stories nahi hain toh message dikhao */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">Koi matching kahani nahi mili</p>
        </div>
      ) : (
        /* Story cards banane ka kaam yahan hota hai */
        <div className="space-y-4">
          {filteredStories.map((story) => (
            <Card key={story.id || `temp-${Math.random()}`} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Character avatar */}
                <Avatar className="h-12 w-12 border-2 border-accent flex-shrink-0">
                  <AvatarFallback className="text-lg">{story.character?.emoji || "📚"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-base truncate">{story.title || "Bina Naam ki Kahani"}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => {
                        if (story.id) {
                          onToggleFavorite(story.id);
                          toast.success(story.isFavorite ? "Favorite se hata diya!" : "Favorite mein daal diya!");
                        } else {
                          toast.error("Story ID nahi hai, favorite nahi kar sakte!");
                        }
                      }}
                    >
                      <Heart className={`h-4 w-4 ${story.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
                    </Button>
                  </div>

                  {/* Story metadata - topic, difficulty, emotions, timestamp */}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {story.topic && (
                      <Badge variant="outline" className="text-xs">
                        {story.topic}
                      </Badge>
                    )}
                    {story.difficulty && (
                      <Badge
                        variant={
                          story.difficulty === "beginner" ? "outline" :
                            story.difficulty === "intermediate" ? "secondary" : "destructive"
                        }
                        className="text-xs"
                      >
                        {story.difficulty}
                      </Badge>
                    )}
                    {story.emotions && (
                      <Badge variant="outline" className="text-xs">
                        {Array.isArray(story.emotions) ? story.emotions.join(", ") : story.emotions}
                      </Badge>
                    )}
                    {story.timestamp && (
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(story.timestamp)}
                      </div>
                    )}
                    {story.qualityWarning && (
                      <Badge variant="destructive" className="text-xs">
                        Quality Issue
                      </Badge>
                    )}
                    {story.errorDetails && (
                      <Badge variant="secondary" className="text-xs">
                        Error (Retries: {story.retryCount || 0})
                      </Badge>
                    )}
                  </div>

                  {/* Fun fact preview */}
                  {story.funFact && (
                    <div className="mt-2 text-sm text-muted-foreground truncate">
                      <strong>Mazedaar Tathya: </strong>{story.funFact}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        if (story.id) {
                          onViewStory(story.id);
                        } else {
                          toast.error("Story ID nahi hai, view nahi kar sakte!");
                        }
                      }}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Story Dekho
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