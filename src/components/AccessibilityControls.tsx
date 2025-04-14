
import React from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Type, Contrast, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AccessibilityControls: React.FC = () => {
  const {
    textSize,
    highContrastMode,
    setTextSize,
    toggleHighContrastMode,
  } = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Accessibility settings">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Accessibility Settings</h4>
          
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="text" className="flex items-center justify-center">
                <Type className="h-4 w-4 mr-2" />
                <span>Text</span>
              </TabsTrigger>
              <TabsTrigger value="contrast" className="flex items-center justify-center">
                <Contrast className="h-4 w-4 mr-2" />
                <span>Display</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center justify-center">
                <Volume2 className="h-4 w-4 mr-2" />
                <span>Audio</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Text Size</h5>
                <div className="flex gap-2">
                  <Button 
                    variant={textSize === "small" ? "default" : "outline"} 
                    onClick={() => setTextSize("small")}
                    className="flex-1"
                    size="sm"
                  >
                    Small
                  </Button>
                  <Button 
                    variant={textSize === "medium" ? "default" : "outline"}
                    onClick={() => setTextSize("medium")}
                    className="flex-1"
                    size="sm"
                  >
                    Medium
                  </Button>
                  <Button 
                    variant={textSize === "large" ? "default" : "outline"}
                    onClick={() => setTextSize("large")}
                    className="flex-1"
                    size="sm"
                  >
                    Large
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contrast" className="pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Enhance visibility with higher contrast colors
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={highContrastMode}
                  onCheckedChange={toggleHighContrastMode}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="audio" className="pt-4">
              <p className="text-sm text-muted-foreground">
                Text-to-speech is available for all stories. Click the speaker icon on any story to listen.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AccessibilityControls;
