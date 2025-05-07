
import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { type Story } from "@/hooks/useStoryManager";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import AudioNarration from "./AudioNarration";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { createShareableUrl, shareContent } from "@/utils/shareUtils";
import StoryHeader from "@/components/story/StoryHeader";
import StoryEmotions from "@/components/story/StoryEmotions";
import StoryPersonalization from "@/components/story/StoryPersonalization";
import StoryContent from "@/components/story/StoryContent";
import StoryTakeaway from "@/components/story/StoryTakeaway";
import StoryKeyPoints from "@/components/story/StoryKeyPoints";
import { motion } from "framer-motion";

interface StoryDisplayProps {
  story: Story | null;
  onToggleFavorite?: () => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onToggleFavorite }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!story) return null;

  // Social share as image logic
  const handleShareImage = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      useCORS: true,
      scale: 2
    });
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await (await fetch(dataUrl)).blob();

    // Only share the image (no caption). If native share is not available, just download the image and show a simple toast.
    if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'story.png', { type: 'image/png' })] })) {
      try {
        await navigator.share({
          files: [new File([blob], 'story.png', { type: 'image/png' })],
          title: story.title
        });
        return;
      } catch (e) {
        // fallback to download
      }
    }
    // Fallback: download image and show a simple toast
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'story.png';
    link.click();
    toast.success('Image downloaded! Now share it on your favorite app.');
  };

  // Share as link
  const handleShareLink = async () => {
    if (!story.id) return;
    
    const shareUrl = createShareableUrl(story.id);
    const shareText = `Check out this learning story about ${story.topic}: ${story.title}`;
    const success = await shareContent(story.title, shareText, shareUrl);
    
    if (success) {
      toast.success('Link copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link. Please try again.');
    }
  };

  return (
    <motion.div 
      className="w-full max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mt-4 md:mt-8 px-2 sm:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card ref={cardRef} className="p-4 md:p-6 shadow-lg border-primary/20 bg-card">
        <StoryHeader 
          story={story} 
          onToggleFavorite={onToggleFavorite}
          onShareLink={handleShareLink}
          onShareImage={handleShareImage}
          copied={copied}
        />

        <StoryPersonalization personalizedFor={story.personalizedFor} />
        <StoryEmotions emotions={story.emotions} />

        <div className="mb-3 md:mb-4">
          <AudioNarration
            text={story.content}
            characterName={story.character?.name}
          />
        </div>

        <StoryContent content={story.content} />
        <StoryTakeaway takeaway={story.takeaway} />
        <StoryKeyPoints keyPoints={story.keyPoints} />
      </Card>
    </motion.div>
  );
};

export default StoryDisplay;
