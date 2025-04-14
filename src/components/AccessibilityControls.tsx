
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
import { Settings, Type } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { toast } from "sonner";

const AccessibilityControls = () => {
  const { 
    textSize, 
    setTextSize
  } = useAccessibility();

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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccessibilityControls;
