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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Trash2, Settings, HistoryIcon, LinkIcon, Type, ChevronRight } from "lucide-react";
import { Story } from "../pages/Index";
import StoryHistory from "./StoryHistory";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { ScrollArea } from "./ui/scroll-area";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Display Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Type className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-medium">Text Size</h3>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={textSize === "small" ? "default" : "outline"}
            onClick={() => setTextSize("small")}
            className={cn(
              "h-8 text-xs",
              textSize === "small" && "bg-primary text-primary-foreground"
            )}
          >
            Small
          </Button>
          <Button
            variant={textSize === "medium" ? "default" : "outline"}
            onClick={() => setTextSize("medium")}
            className={cn(
              "h-8 text-xs",
              textSize === "medium" && "bg-primary text-primary-foreground"
            )}
          >
            Medium
          </Button>
          <Button
            variant={textSize === "large" ? "default" : "outline"}
            onClick={() => setTextSize("large")}
            className={cn(
              "h-8 text-xs",
              textSize === "large" && "bg-primary text-primary-foreground"
            )}
          >
            Large
          </Button>
        </div>
      </div>

      {/* Story History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <HistoryIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-medium">Story History</h3>
          </div>
          {stories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="h-8 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-0.5">
          <StoryHistory
            stories={stories}
            onViewStory={onViewStory}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <LinkIcon className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-base font-medium">About</h3>
        </div>
        <div className="pl-10">
          <p className="text-xs text-muted-foreground">
            Idea by:{" "}
            <a
              href="https://www.linkedin.com/in/arshad-ali-bhorania/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Arshad ali Bhorania
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-lg">Settings</DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              Customize your learning experience
            </DrawerDescription>
          </DrawerHeader>

          <ScrollArea className="flex-1 px-4 pb-6">
            <SettingsContent />
          </ScrollArea>

          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="h-9 text-sm">
                Done
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop Sheet
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Adjust your preferences and manage your story history
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] pr-4 mt-6">
          <SettingsContent />
        </ScrollArea>

        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsDrawer;