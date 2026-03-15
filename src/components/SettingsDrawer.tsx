
import React, { useState } from "react";
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
import {
  Trash2, Settings, History, Link, BookMarked, Sun, Moon,
  Github, Twitter, Linkedin, Heart, ExternalLink, PanelLeft,
  Palette, Type, Bell, Volume2, VolumeX, Check, CloudSun,
  ArrowUpRight, Command, LayoutGrid, Save, UserCircle, CircleHelp
} from "lucide-react";
import { Story } from "../pages/Index";
import StoryHistory from "./StoryHistory";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { ScrollArea } from "./ui/scroll-area";
import { useIsMobile } from "../hooks/use-mobile";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [activeTab, setActiveTab] = useState("display");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [colorTheme, setColorTheme] = useState("purple");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);
  const [readingFocus, setReadingFocus] = useState(false);

  const handleClearHistory = () => {
    onClearHistory();
    setShowClearConfirm(false);
    toast.success("Story history cleared successfully");
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    toast.success(`${!isDarkMode ? "Dark" : "Light"} theme activated`);
  };

  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully");
  };

  const favoriteStories = stories.filter(story => story.isFavorite);
  const recentStories = stories.slice(0, 5);

  // Function to get badge color based on theme
  const getThemeBadgeClass = (theme: string) => {
    switch (theme) {
      case "purple": return "bg-purple-500 hover:bg-purple-600";
      case "blue": return "bg-blue-500 hover:bg-blue-600";
      case "green": return "bg-green-500 hover:bg-green-600";
      case "amber": return "bg-amber-500 hover:bg-amber-600";
      case "rose": return "bg-rose-500 hover:bg-rose-600";
      default: return "bg-purple-500 hover:bg-purple-600";
    }
  };

  const SettingsContent = () => (
    <Tabs
      defaultValue="display"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-6 w-full">
        <TabsTrigger value="display" className="flex items-center gap-1.5 justify-center">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Display</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-1.5 justify-center">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
          {stories.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {stories.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="accessibility" className="flex items-center gap-1.5 justify-center">
          <UserCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Account</span>
        </TabsTrigger>
        <TabsTrigger value="about" className="flex items-center gap-1.5 justify-center">
          <CircleHelp className="h-4 w-4" />
          <span className="hidden sm:inline">About</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="display" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2 text-primary" />
              Theme Settings
            </h3>

            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>Dark Mode</span>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleThemeToggle}
                />
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium mb-2 block">Color Theme</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["purple", "blue", "green", "amber", "rose"].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setColorTheme(theme)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all duration-200",
                        getThemeBadgeClass(theme),
                        colorTheme === theme ? "ring-2 ring-offset-2 ring-primary" : ""
                      )}
                      aria-label={`${theme} theme`}
                    >
                      {colorTheme === theme && <Check className="h-4 w-4 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Type className="h-5 w-5 mr-2 text-primary" />
              Text & Display
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Text Size</label>
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

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PanelLeft className="h-4 w-4" />
                  <span>Reading Focus Mode</span>
                </div>
                <Switch
                  checked={readingFocus}
                  onCheckedChange={setReadingFocus}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Volume2 className="h-5 w-5 mr-2 text-primary" />
              Audio & Notifications
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {autoPlayAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <span>Auto-play Audio</span>
                </div>
                <Switch
                  checked={autoPlayAudio}
                  onCheckedChange={setAutoPlayAudio}
                />
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSavePreferences}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </motion.div>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <History className="h-5 w-5 mr-2 text-primary" />
              Story History
            </h3>

            {stories.length > 0 && (
              <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear Story History</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to clear your entire story history? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleClearHistory}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg border-muted-foreground/30">
              <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Your story history is empty</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Stories you view will appear here
              </p>
            </div>
          ) : (
            <div>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full mb-4 grid grid-cols-3">
                  <TabsTrigger value="all" className="justify-center">All Stories</TabsTrigger>
                  <TabsTrigger value="favorites" className="justify-center">
                    Favorites
                    {favoriteStories.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{favoriteStories.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="justify-center">Recent</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <StoryHistory
                    stories={stories}
                    onViewStory={onViewStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                </TabsContent>

                <TabsContent value="favorites">
                  {favoriteStories.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-lg border-muted-foreground/30">
                      <Heart className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">No favorite stories yet</p>
                    </div>
                  ) : (
                    <StoryHistory
                      stories={favoriteStories}
                      onViewStory={onViewStory}
                      onToggleFavorite={onToggleFavorite}
                    />
                  )}
                </TabsContent>

                <TabsContent value="recent">
                  <StoryHistory
                    stories={recentStories}
                    onViewStory={onViewStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Save className="h-4 w-4 mr-2 text-primary/70" />
              Export Options
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setExportFormat("pdf");
                  toast.success("Stories will be exported as PDF");
                }}
                disabled={stories.length === 0}
              >
                Export as PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setExportFormat("text");
                  toast.success("Stories will be exported as Text");
                }}
                disabled={stories.length === 0}
              >
                Export as Text
              </Button>
            </div>
          </div>
        </motion.div>
      </TabsContent>

      <TabsContent value="accessibility" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-card rounded-lg border border-border p-4 mb-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <UserCircle className="h-5 w-5 mr-2 text-primary" />
              Account Settings
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" placeholder="Your name" className="mt-1" defaultValue="Reader" />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="email@example.com" className="mt-1" />
              </div>

              <div className="pt-2">
                <Button className="w-full">Update Profile</Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4 mb-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Command className="h-5 w-5 mr-2 text-primary" />
              Reading Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Keyboard Shortcuts</div>
                  <div className="text-sm text-muted-foreground">Enable keyboard navigation</div>
                </div>
                <Switch
                  checked={shortcutsEnabled}
                  onCheckedChange={setShortcutsEnabled}
                />
              </div>

              <Separator />

              <div>
                <div className="font-medium mb-2">Preferred Topics</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/10">Science</Badge>
                  <Badge variant="outline" className="bg-primary/10">History</Badge>
                  <Badge variant="outline" className="bg-primary/10">Technology</Badge>
                  <Badge variant="outline" className="bg-primary/10">+ Add more</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <div className="font-medium mb-2">Language Preferences</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start text-left">
                    <Badge variant="secondary" className="mr-2">Primary</Badge>
                    English
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start text-left">
                    Hindi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </TabsContent>

      <TabsContent value="about" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-card rounded-lg border border-border p-4 mb-4">
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <BookMarked className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Hinglish Stories</h2>
              <p className="text-muted-foreground">Version 1.2.0</p>

              <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4 mb-4">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Link className="h-5 w-5 mr-2 text-primary" />
              Creator & Credits
            </h3>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-md mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Arshad Ali Bhorania</p>
                <a
                  href="https://www.linkedin.com/in/arshad-ali-bhorania/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  LinkedIn Profile
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              Hinglish Stories aims to make learning more accessible and engaging through
              personalized, bilingual content.
            </p>

            <Button variant="link" className="px-0 text-primary">
              Learn more about this project <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <div className="rounded-lg border border-primary/20 p-4 bg-primary/5">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <LayoutGrid className="h-4 w-4 mr-2 text-primary" />
              Technologies Used
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-background">React</Badge>
              <Badge variant="outline" className="bg-background">Next.js</Badge>
              <Badge variant="outline" className="bg-background">Tailwind CSS</Badge>
              <Badge variant="outline" className="bg-background">Shadcn UI</Badge>
              <Badge variant="outline" className="bg-background">GPT-4</Badge>
            </div>
          </div>
        </motion.div>
      </TabsContent>
    </Tabs>
  );

  // Mobile version using Drawer
  if (isMobile) {
    return (
      <TooltipProvider>
        <Drawer>
          <Tooltip>
            <TooltipTrigger asChild>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Settings className="h-5 w-5" />
                  {stories.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
                      {stories.length}
                    </span>
                  )}
                  <span className="sr-only">Settings</span>
                </Button>
              </DrawerTrigger>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="border-b pb-3">
              <DrawerTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                Settings & Preferences
              </DrawerTitle>
              <DrawerDescription>
                Adjust your preferences and manage your story history
              </DrawerDescription>
            </DrawerHeader>

            <ScrollArea className="h-[70vh] px-4 pt-4">
              <SettingsContent />
            </ScrollArea>

            <DrawerFooter className="border-t pt-4 mt-2">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </TooltipProvider>
    );
  }

  // Desktop version using Sheet
  return (
    <TooltipProvider>
      <Sheet>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Settings className="h-5 w-5" />
                {stories.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
                    {stories.length}
                  </span>
                )}
                <span className="sr-only">Settings</span>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
        <SheetContent className="w-[400px] sm:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4 mb-1">
            <SheetTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Settings & Preferences
            </SheetTitle>
            <SheetDescription>
              Adjust your preferences and manage your story history
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] pr-4 mt-6">
            <SettingsContent />
          </ScrollArea>

          <SheetFooter className="mt-4 border-t pt-4">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
};

export default SettingsDrawer;
