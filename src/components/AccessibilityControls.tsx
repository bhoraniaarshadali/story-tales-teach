
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Settings, Type, Volume2, VolumeX } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { toast } from "sonner";

const AccessibilityControls = () => {
  const { 
    textSize, 
    setTextSize, 
    useElevenLabs, 
    setUseElevenLabs,
    selectedVoice,
    setSelectedVoice,
    voiceOptions
  } = useAccessibility();

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId as any);
    toast.success(`Voice changed to ${voiceOptions.find(v => v.id === voiceId)?.name || 'selected voice'}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Accessibility settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuLabel className="font-normal text-muted-foreground">
          Accessibility Settings
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium flex items-center">
                <Type className="h-4 w-4 mr-2" />
                Text Size
              </label>
            </div>
            <Select value={textSize} onValueChange={(value) => setTextSize(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select text size" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Text Size</SelectLabel>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center">
                <Volume2 className="h-4 w-4 mr-2" />
                Use ElevenLabs Voice
              </label>
              <Switch
                checked={useElevenLabs}
                onCheckedChange={(checked) => {
                  setUseElevenLabs(checked);
                  toast.success(checked 
                    ? "Using ElevenLabs for better voice quality" 
                    : "Using browser's built-in speech");
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Toggle to use high-quality ElevenLabs voice
            </p>
          </div>

          {useElevenLabs && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Select Voice</label>
              </div>
              <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Voices</SelectLabel>
                    {voiceOptions.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} - {voice.description}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccessibilityControls;
