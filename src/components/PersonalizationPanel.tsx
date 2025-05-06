
import React from "react";
import { UserPreferences } from "@/services/storyService";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Languages,
  Brain,
  History,
  Sparkles,
  Heart,
  RefreshCcw,
  MessagesSquare
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface PersonalizationPanelProps {
  userPreferences: UserPreferences | null;
  usePersonalization: boolean;
  onTogglePersonalization: (enabled: boolean) => void;
  onUpdatePreferences: (preferences: UserPreferences) => void;
  onReset?: () => void;
}

const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({
  userPreferences,
  usePersonalization,
  onTogglePersonalization,
  onUpdatePreferences,
  onReset
}) => {
  if (!userPreferences) return null;
  
  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    onUpdatePreferences({
      ...userPreferences,
      [key]: value
    });
  };

  // Calculate personalization score (how many settings are active)
  const getPersonalizationScore = () => {
    let score = 0;
    if (userPreferences.readingLevel) score++;
    if (userPreferences.languagePreference) score++;
    if (userPreferences.learningStyle) score++;
    if (userPreferences.previousTopics?.length) score++;
    if (userPreferences.favoriteTopics?.length) score++;
    return score;
  };
  
  const getScoreLabel = () => {
    const score = getPersonalizationScore();
    if (score <= 1) return "Basic";
    if (score <= 3) return "Enhanced";
    return "Full";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Personalization</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="use-personalization" className="text-sm">Enable</Label>
          <Switch 
            id="use-personalization" 
            checked={usePersonalization}
            onCheckedChange={onTogglePersonalization}
          />
        </div>
      </div>
      
      {usePersonalization && (
        <>
          <div className="bg-primary/5 p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Personalization level:</span>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {getScoreLabel()} ({getPersonalizationScore()}/5)
              </Badge>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={onReset}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    <span className="sr-only">Reset to defaults</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset to default settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="history">History & Favorites</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <Label htmlFor="reading-level" className="font-medium">Reading Level</Label>
                </div>
                <Select 
                  value={userPreferences.readingLevel || 'intermediate'} 
                  onValueChange={(value) => handlePreferenceChange('readingLevel', value)}
                >
                  <SelectTrigger id="reading-level" className="w-full">
                    <SelectValue placeholder="Select reading level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Adjusts the complexity of explanations in your stories
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <Label htmlFor="language-preference" className="font-medium">Language Style</Label>
                </div>
                <ToggleGroup 
                  type="single" 
                  value={userPreferences.languagePreference || 'hinglish'}
                  onValueChange={(value) => {
                    if (value) handlePreferenceChange('languagePreference', value);
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="hinglish" aria-label="Hinglish">Hinglish</ToggleGroupItem>
                  <ToggleGroupItem value="english" aria-label="English">English</ToggleGroupItem>
                  <ToggleGroupItem value="hindi" aria-label="Hindi">Hindi</ToggleGroupItem>
                </ToggleGroup>
                <p className="text-xs text-muted-foreground">
                  Choose which language style you prefer for stories
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <Label htmlFor="learning-style" className="font-medium">Learning Style</Label>
                </div>
                <Select 
                  value={userPreferences.learningStyle || 'reading'} 
                  onValueChange={(value) => handlePreferenceChange('learningStyle', value)}
                >
                  <SelectTrigger id="learning-style" className="w-full">
                    <SelectValue placeholder="Select learning style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">
                      Visual (images & diagrams)
                    </SelectItem>
                    <SelectItem value="auditory">
                      Auditory (explanations & dialogue)
                    </SelectItem>
                    <SelectItem value="reading">
                      Reading/Writing (detailed text)
                    </SelectItem>
                    <SelectItem value="kinesthetic">
                      Practical (examples & applications)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Stories will be tailored to your preferred way of learning
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4 mt-4">
              {userPreferences.previousTopics?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <History className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Previous Topics</Label>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-2">
                      Your story will be adapted based on topics you've learned before:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {userPreferences.previousTopics.map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {userPreferences.favoriteTopics?.length > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Favorite Topics</Label>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-2">
                      Stories will include connections to topics you've favorited:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {userPreferences.favoriteTopics.map((topic, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {(!userPreferences.previousTopics?.length && !userPreferences.favoriteTopics?.length) && (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <MessagesSquare className="h-12 w-12 mb-2 opacity-20" />
                  <p>No history or favorites yet</p>
                  <p className="text-sm mt-1">
                    Generate stories and favorite them to improve personalization
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default PersonalizationPanel;
