
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, X, Plus, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface UserPreferencesProps {
  onPreferencesChange: (preferences: UserPreferenceData) => void;
}

export interface UserPreferenceData {
  readingLevel: "beginner" | "intermediate" | "advanced";
  preferredEmotions: string[];
  favoriteTopics: string[];
  preferredLanguage: "english" | "hinglish" | "simple";
  recommendedAge?: string;
}

const defaultPreferences: UserPreferenceData = {
  readingLevel: "intermediate",
  preferredEmotions: ["curious", "interested"],
  favoriteTopics: [],
  preferredLanguage: "hinglish",
  recommendedAge: "all-ages"
};

const UserPreferences: React.FC<UserPreferencesProps> = ({ onPreferencesChange }) => {
  const [open, setOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newEmotion, setNewEmotion] = useState("");
  const [preferences, setPreferences] = useState<UserPreferenceData>(() => {
    // Try to load from localStorage
    const savedPrefs = localStorage.getItem("userPreferences");
    return savedPrefs ? JSON.parse(savedPrefs) : defaultPreferences;
  });

  // Apply preferences on initial load
  useEffect(() => {
    onPreferencesChange(preferences);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
  }, [preferences]);

  const handleAddTopic = () => {
    if (newTopic.trim() && !preferences.favoriteTopics.includes(newTopic.trim())) {
      const updatedTopics = [...preferences.favoriteTopics, newTopic.trim()];
      setPreferences({ ...preferences, favoriteTopics: updatedTopics });
      setNewTopic("");
    }
  };

  const handleRemoveTopic = (topic: string) => {
    const updatedTopics = preferences.favoriteTopics.filter(t => t !== topic);
    setPreferences({ ...preferences, favoriteTopics: updatedTopics });
  };

  const handleAddEmotion = () => {
    if (newEmotion.trim() && !preferences.preferredEmotions.includes(newEmotion.trim())) {
      const updatedEmotions = [...preferences.preferredEmotions, newEmotion.trim()];
      setPreferences({ ...preferences, preferredEmotions: updatedEmotions });
      setNewEmotion("");
    }
  };

  const handleRemoveEmotion = (emotion: string) => {
    const updatedEmotions = preferences.preferredEmotions.filter(e => e !== emotion);
    setPreferences({ ...preferences, preferredEmotions: updatedEmotions });
  };

  const handleSave = () => {
    onPreferencesChange(preferences);
    setOpen(false);
    toast.success("Your story preferences have been saved!");
  };

  const commonEmotions = [
    "curious", "excited", "creative", "inspired", "determined", 
    "focused", "amazed", "enlightened", "motivated", "confident"
  ];

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Personalize Stories
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Personalize Your Learning Experience</DialogTitle>
            <DialogDescription>
              Configure how stories are generated based on your preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="readingLevel">Preferred Reading Level</Label>
              <Select 
                value={preferences.readingLevel}
                onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                  setPreferences({ ...preferences, readingLevel: value })
                }
              >
                <SelectTrigger id="readingLevel">
                  <SelectValue placeholder="Select reading level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - Simple concepts and vocabulary</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Balanced complexity</SelectItem>
                  <SelectItem value="advanced">Advanced - Complex concepts and details</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language Style</Label>
              <Select 
                value={preferences.preferredLanguage}
                onValueChange={(value: "english" | "hinglish" | "simple") => 
                  setPreferences({ ...preferences, preferredLanguage: value })
                }
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hinglish">Hinglish - Hindi-English mix</SelectItem>
                  <SelectItem value="english">English - Standard English</SelectItem>
                  <SelectItem value="simple">Simple - Easy to understand language</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Favorite Topics</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {preferences.favoriteTopics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="px-2 py-1">
                    {topic}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTopic(topic)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a favorite topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                />
                <Button type="button" size="sm" onClick={handleAddTopic}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Stories will reference these topics when relevant to enhance your learning connections.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Preferred Learning Emotions</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {preferences.preferredEmotions.map((emotion) => (
                  <Badge key={emotion} variant="outline" className="px-2 py-1">
                    {emotion}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveEmotion(emotion)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an emotion..."
                  value={newEmotion}
                  onChange={(e) => setNewEmotion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEmotion()}
                  list="common-emotions"
                />
                <datalist id="common-emotions">
                  {commonEmotions.map(emotion => (
                    <option key={emotion} value={emotion} />
                  ))}
                </datalist>
                <Button type="button" size="sm" onClick={handleAddEmotion}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Stories will be crafted to evoke these emotions when possible.
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserPreferences;
