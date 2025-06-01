import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Search, BookOpen, Star, Brain, ChevronRight } from "lucide-react";
import { type Story } from "../pages/Index";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "../hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
      <div className="text-center py-6">
        <div className="bg-primary/10 rounded-full p-3 w-12 h-12 mx-auto mb-3">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-sm font-medium mb-1">No Stories Yet</h2>
        <p className="text-muted-foreground text-xs">
          Create your first story to see your history here!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={cn(
        "space-y-2",
        !isMobile && "mb-4 flex flex-col md:flex-row gap-4"
      )}>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            className={cn(
              "pl-8 text-xs",
              isMobile && "h-8 rounded-full bg-accent/50 border-accent"
            )}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant={filterFavorites ? "default" : "outline"}
          onClick={() => setFilterFavorites(!filterFavorites)}
          className={cn(
            "text-xs",
            isMobile ? "h-8 rounded-full" : "md:min-w-32"
          )}
          size={isMobile ? "sm" : "default"}
        >
          <Heart className={cn(
            "h-3.5 w-3.5",
            isMobile ? "mr-1" : "mr-2",
            filterFavorites && "fill-current"
          )} />
          {filterFavorites ? "All Stories" : "Favorites"}
        </Button>
      </div>

      {filteredStories.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-xs">No matching stories found</p>
        </div>
      ) : (
        <div className={cn(
          "space-y-2",
          !isMobile && "space-y-4"
        )}>
          {filteredStories.map((story) => (
            <Card
              key={story.id}
              className={cn(
                "hover:shadow-md transition-shadow",
                isMobile ? "p-3 bg-accent/5" : "p-4"
              )}
              onClick={() => onViewStory(story.id as string)}
            >
              <div className="flex items-start gap-3">
                <Avatar className={cn(
                  "border-2 border-accent flex-shrink-0",
                  isMobile ? "h-10 w-10" : "h-12 w-12"
                )}>
                  <AvatarFallback className={cn(
                    isMobile ? "text-base" : "text-lg"
                  )}>
                    {story.character?.emoji || "📚"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={cn(
                      "font-medium truncate",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      {story.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "flex-shrink-0",
                        isMobile && "h-7 w-7"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(story.id as string);
                      }}
                    >
                      <Heart className={cn(
                        "h-3.5 w-3.5",
                        story.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                      )} />
                    </Button>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {story.topic && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-normal",
                          isMobile ? "text-[10px] px-1.5 py-0" : "text-xs"
                        )}
                      >
                        {story.topic}
                      </Badge>
                    )}
                    {story.timestamp && (
                      <div className={cn(
                        "text-muted-foreground flex items-center",
                        isMobile ? "text-[10px]" : "text-xs"
                      )}>
                        <Clock className={cn(
                          isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"
                        )} />
                        {formatDate(story.timestamp)}
                      </div>
                    )}
                  </div>

                  {!isMobile && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        View Story
                      </Button>
                    </div>
                  )}
                </div>
                {isMobile && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground self-center flex-shrink-0" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryHistory;
