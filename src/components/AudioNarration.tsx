
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause, Play, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AudioNarrationProps {
  text: string;
  characterName?: string;
}

const AudioNarration: React.FC<AudioNarrationProps> = ({ text, characterName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Get a short excerpt of text for narration (first paragraph or first 500 chars)
  const getExcerpt = () => {
    const firstParagraph = text.split("\n\n")[0];
    if (firstParagraph.length <= 500) return firstParagraph;
    return firstParagraph.substring(0, 500) + "...";
  };

  const handleNarration = async () => {
    // If already playing, pause it
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    
    // If audio already exists, play it
    if (audio) {
      audio.play();
      setIsPlaying(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use Hindi voice for Hinglish narration
      const voiceId = characterName && characterName.match(/[a-zA-Z]+/)[0].toLowerCase().includes('priya') 
        ? '21m00Tcm4TlvDq8ikWAM' // Female voice
        : 'pNInz6obpgDQGcFmaJgB'; // Male voice
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: getExcerpt(),
          voiceId
        }
      });
      
      if (error) throw new Error(error.message);
      
      // Create audio element from base64 data
      const audioContent = data.audioContent;
      const audioSrc = `data:audio/mp3;base64,${audioContent}`;
      const newAudio = new Audio(audioSrc);
      
      // Add event listeners
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Error generating audio narration:', error);
      toast.error('Could not generate audio narration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleNarration}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>Loading audio...</>
      ) : isPlaying ? (
        <>
          <Pause className="h-4 w-4" />
          Pause Narration
        </>
      ) : (
        <>
          {audio ? (
            <Play className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          Listen to Story
        </>
      )}
    </Button>
  );
};

export default AudioNarration;
