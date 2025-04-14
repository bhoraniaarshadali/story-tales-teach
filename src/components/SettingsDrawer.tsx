
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Trash2, Settings, HistoryIcon } from "lucide-react";
import { Story } from "../pages/Index";
import StoryHistory from "./StoryHistory";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { ScrollArea } from "./ui/scroll-area";

interface SettingsDrawerProps {
  stories: Story[];
  onViewStory: (storyId: string) => void;
  onToggleFavorite: (storyId: string) => void;
  onClearHistory: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  stories,
  onViewStory,
  onToggleFavorite,
  onClearHistory,
}) => {
  const { textSize, setTextSize } = useAccessibility();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Adjust your preferences and manage your story history
          </DrawerDescription>
        </DrawerHeader>
        
        <ScrollArea className="h-[70vh] px-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Display Settings</h3>
              <div className="space-y-2">
                <div className="flex flex-col gap-2">
                  <span>Text Size</span>
                  <div className="flex gap-2">
                    <Button 
                      variant={textSize === "small" ? "default" : "outline"} 
                      onClick={() => setTextSize("small")}
                      className="flex-1"
                    >
                      Small
                    </Button>
                    <Button 
                      variant={textSize === "medium" ? "default" : "outline"} 
                      onClick={() => setTextSize("medium")}
                      className="flex-1"
                    >
                      Medium
                    </Button>
                    <Button 
                      variant={textSize === "large" ? "default" : "outline"} 
                      onClick={() => setTextSize("large")}
                      className="flex-1"
                    >
                      Large
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <HistoryIcon className="h-5 w-5 mr-2" />
                  Story History
                </h3>
                
                {stories.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onClearHistory}
                    className="flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                )}
              </div>
              
              <StoryHistory 
                stories={stories} 
                onViewStory={onViewStory} 
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          </div>
        </ScrollArea>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SettingsDrawer;
