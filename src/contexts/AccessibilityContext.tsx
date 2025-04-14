
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type TextSize = "small" | "medium" | "large";
type VoiceId = "9BWtsMINqrJLrRacOk9x" | "CwhRBWXzGAHq8TQ4Fs17" | "XB0fDUnXU5powFXDhCwa";

interface VoiceOption {
  id: VoiceId;
  name: string;
  description: string;
}

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  useElevenLabs: boolean;
  setUseElevenLabs: (use: boolean) => void;
  selectedVoice: VoiceId;
  setSelectedVoice: (voice: VoiceId) => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  voiceOptions: VoiceOption[];
}

const defaultVoice = "9BWtsMINqrJLrRacOk9x";  // Aria

const AccessibilityContext = createContext<AccessibilityContextType>({
  textSize: "medium",
  setTextSize: () => {},
  useElevenLabs: false,
  setUseElevenLabs: () => {},
  selectedVoice: defaultVoice,
  setSelectedVoice: () => {},
  speakText: () => {},
  stopSpeaking: () => {},
  isSpeaking: false,
  voiceOptions: [],
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSize] = useState<TextSize>(() => {
    const saved = localStorage.getItem("textSize");
    return (saved as TextSize) || "medium";
  });
  
  const [useElevenLabs, setUseElevenLabs] = useState<boolean>(() => {
    const saved = localStorage.getItem("useElevenLabs");
    return saved === "true";
  });
  
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>(() => {
    const saved = localStorage.getItem("selectedVoice");
    return (saved as VoiceId) || defaultVoice;
  });
  
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  const voiceOptions: VoiceOption[] = [
    { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Narration Queen 👑" },
    { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "Perfect dost explaining stuff" },
    { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", description: "High energy & animated, great for humor" }
  ];

  useEffect(() => {
    localStorage.setItem("textSize", textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem("useElevenLabs", String(useElevenLabs));
  }, [useElevenLabs]);

  useEffect(() => {
    localStorage.setItem("selectedVoice", selectedVoice);
  }, [selectedVoice]);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [audio]);

  const speakText = async (text: string) => {
    try {
      // Stop any current audio playing
      if (audio) {
        audio.pause();
        audio.src = "";
        setAudio(null);
      }
      
      setIsSpeaking(true);
      
      if (useElevenLabs) {
        // Use ElevenLabs TTS service
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { 
            text,
            voiceId: selectedVoice
          }
        });

        if (error) {
          console.error("Error calling text-to-speech function:", error);
          fallbackSpeech(text);
          return;
        }

        // Create audio from the base64 data
        const newAudio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        setAudio(newAudio);
        
        newAudio.onended = () => setIsSpeaking(false);
        newAudio.onerror = () => {
          console.error("Audio playback error");
          setIsSpeaking(false);
        };
        
        await newAudio.play();
      } else {
        // Use native browser TTS
        fallbackSpeech(text);
      }
    } catch (error) {
      console.error("Error in speakText:", error);
      setIsSpeaking(false);
      fallbackSpeech(text);
    }
  };

  const fallbackSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Browser doesn't support speech synthesis");
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize,
        useElevenLabs,
        setUseElevenLabs,
        selectedVoice,
        setSelectedVoice,
        speakText,
        stopSpeaking,
        isSpeaking,
        voiceOptions
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
