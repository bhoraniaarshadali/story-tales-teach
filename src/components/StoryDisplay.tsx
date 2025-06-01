import React from "react";
import {
  Card,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui";
import {
  Heart, Book, Brain, Lightbulb, Share2,
  UserCircle, Link, Copy, Check
} from "lucide-react";
import { type Story } from "../pages/Index";
import { useAccessibility } from "../contexts/AccessibilityContext";
import AudioNarration from "./AudioNarration";
import { useIsMobile } from "../hooks/use-mobile";
import { toast } from "sonner";
import { createShareableUrl, shareContent } from "../utils/shareUtils";
import html2canvas from "html2canvas";

interface StoryDisplayProps {
  story: Story | null;
  onToggleFavorite?: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onToggleFavorite }) => {
  const { textSize } = useAccessibility();
  const isMobile = useIsMobile();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Text size classes for accessibility
  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  // Process emotions data
  const emotionsArray = React.useMemo(() => {
    if (!story?.emotions) return [];
    return Array.isArray(story.emotions)
      ? story.emotions
      : typeof story.emotions === 'string'
        ? story.emotions.split(',').map(e => e.trim())
        : [];
  }, [story?.emotions]);

  if (!story) return null;

  // Section components for better organization
  const HeaderSection = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 md:mb-6">
      <div className="flex items-start sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
        <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-accent flex-shrink-0">
          <AvatarFallback className="text-base md:text-lg">
            {story.character?.emoji || "📚"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
            {story.title}
          </h1>
          <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
            {story.personalizedFor?.length ? (
              <Badge variant="default" className="text-xs md:text-sm bg-primary/80 flex items-center gap-1">
                <UserCircle className="h-3 w-3" />
                Personalized
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs md:text-sm bg-accent/30">
                Hinglish Story
              </Badge>
            )}
            {story.difficulty && (
              <Badge variant="secondary" className="text-xs md:text-sm">
                {story.difficulty} level
              </Badge>
            )}
            {story.topic && (
              <Badge variant="secondary" className="text-xs md:text-sm">
                {story.topic}
              </Badge>
            )}
            {story.character?.traits && (
              <Badge variant="outline" className="text-xs md:text-sm bg-muted">
                <Brain className="h-3 w-3 mr-1" />
                {story.character.traits}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <ActionButtons />
    </div>
  );

  const ActionButtons = () => (
    <div className="flex items-center gap-2 self-end sm:self-start mt-2 sm:mt-0">
      <ShareDropdown />
      {onToggleFavorite && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          aria-label={story.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-5 w-5 md:h-6 md:w-6 ${story.isFavorite ? "fill-rose-500 text-rose-500" : ""
            }`} />
        </Button>
      )}
    </div>
  );

  const ShareDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Share options">
          <Share2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleShareLink}>
          {copied ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Link className="h-4 w-4 mr-2" />
          )}
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareImage}>
          <Copy className="h-4 w-4 mr-2" />
          Share as image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const PersonalizedSection = () => (
    story.personalizedFor?.length > 0 && (
      <SectionContainer>
        <SectionHeader icon={<UserCircle />} title="Personalized for you:" />
        <div className="flex flex-wrap gap-1 md:gap-2">
          {story.personalizedFor.map((aspect, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-[10px] md:text-xs bg-primary/5"
            >
              {aspect}
            </Badge>
          ))}
        </div>
      </SectionContainer>
    )
  );

  const EmotionsSection = () => (
    emotionsArray.length > 0 && (
      <SectionContainer>
        <SectionHeader title="Story emotions:" />
        <div className="flex flex-wrap gap-1 md:gap-2">
          {emotionsArray.map((emotion, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-[10px] md:text-xs"
            >
              {emotion}
            </Badge>
          ))}
        </div>
      </SectionContainer>
    )
  );

  const ContentSection = () => (
    <div className="mb-4 md:mb-6">
      <AudioNarration
        text={story.content}
        characterName={story.character?.name}
      />
      <div className={`prose prose-purple max-w-none ${textSizeClasses[textSize]} mt-4`}>
        {story.content.split("\n\n").map((paragraph, i) => (
          paragraph.includes('<div class="suggestion-box">') ? (
            <div
              key={i}
              className="my-3 md:my-4"
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ) : (
            <p key={i} className="mb-3 md:mb-4 text-foreground/90">
              {paragraph}
            </p>
          )
        ))}
      </div>
    </div>
  );

  const TakeawaySection = () => (
    <SectionContainer className="bg-muted">
      <SectionHeader
        icon={<Lightbulb className="text-amber-500" />}
        title="Learning Takeaway"
      />
      <p className={`italic text-foreground/80 ${textSizeClasses[textSize]}`}>
        {story.takeaway}
      </p>
    </SectionContainer>
  );

  const KeyPointsSection = () => (
    story.keyPoints?.length > 0 && (
      <SectionContainer className="bg-accent/10 mt-4">
        <SectionHeader
          icon={<Book className="text-primary" />}
          title="Key Points"
        />
        <ul className={`list-disc list-inside space-y-1 ${textSizeClasses[textSize]}`}>
          {story.keyPoints.map((point, index) => (
            <li key={index} className="text-foreground/80">{point}</li>
          ))}
        </ul>
      </SectionContainer>
    )
  );

  const SectionContainer = ({
    children,
    className = ""
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`mb-3 md:mb-4 p-3 md:p-4 rounded-md border border-border ${className}`}>
      {children}
    </div>
  );

  const SectionHeader = ({
    icon,
    title
  }: {
    icon?: React.ReactElement;
    title: string;
  }) => (
    <h3 className="text-xs md:text-sm font-medium text-primary/80 mb-1 md:mb-2 flex items-center">
      {icon && React.cloneElement(icon, {
        className: `mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 ${icon.props.className || ''}`
      })}
      {title}
    </h3>
  );

  // Share handlers
  const handleShareImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        allowTaint: true,
        foreignObjectRendering: true
      });
      const dataUrl = canvas.toDataURL("image/png");

      if (navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        await navigator.share({
          files: [new File([blob], 'story.png', { type: 'image/png' })],
          title: story.title
        });
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'story.png';
        link.click();
        toast.success('Image downloaded!');
      }
    } catch (error) {
      toast.error('Failed to share image');
    }
  };

  const handleShareLink = async () => {
    if (!story.id) return;
    const shareUrl = createShareableUrl(story.id);
    const success = await shareContent(
      story.title,
      `Check out this learning story about ${story.topic}: ${story.title}`,
      shareUrl
    );

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="w-full max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mt-4 md:mt-8 px-2 sm:px-0">
      <Card ref={cardRef} className="p-4 md:p-6 shadow-lg border-primary/20 bg-card">
        <HeaderSection />
        <PersonalizedSection />
        <EmotionsSection />
        <ContentSection />
        <TakeawaySection />
        <KeyPointsSection />
      </Card>
    </article>
  );
};

export default StoryDisplay;