
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";

// Voice options for ElevenLabs
export type VoiceOption = {
  id: string;
  name: string;
  description?: string;
};

// Available voices
export const VOICE_OPTIONS: VoiceOption[] = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Narration Queen 👑" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "Perfect dost explaining stuff" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", description: "High energy & animated, great for humor" }
];

interface AccessibilityContextType {
  textSize: "small" | "medium" | "large";
  highContrastMode: boolean;
  speakText: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  setTextSize: (size: "small" | "medium" | "large") => void;
  toggleHighContrastMode: () => void;
  selectedVoice: VoiceOption;
  setSelectedVoice: (voice: VoiceOption) => void;
  useElevenLabs: boolean;
  setUseElevenLabs: (use: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSize] = useState<"small" | "medium" | "large">(() => {
    const savedSize = localStorage.getItem("textSize");
    return (savedSize as "small" | "medium" | "large") || "medium";
  });
  
  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem("highContrastMode");
    return savedMode ? savedMode === "true" : false;
  });
  
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(() => {
    const savedVoice = localStorage.getItem("selectedVoice");
    return savedVoice ? JSON.parse(savedVoice) : VOICE_OPTIONS[0];
  });
  
  const [useElevenLabs, setUseElevenLabs] = useState<boolean>(() => {
    const savedUseElevenLabs = localStorage.getItem("useElevenLabs");
    return savedUseElevenLabs ? savedUseElevenLabs === "true" : false;
  });
  
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  
  useEffect(() => {
    localStorage.setItem("textSize", textSize);
    document.documentElement.setAttribute("data-text-size", textSize);
  }, [textSize]);
  
  useEffect(() => {
    localStorage.setItem("highContrastMode", String(highContrastMode));
    if (highContrastMode) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrastMode]);
  
  useEffect(() => {
    localStorage.setItem("selectedVoice", JSON.stringify(selectedVoice));
  }, [selectedVoice]);
  
  useEffect(() => {
    localStorage.setItem("useElevenLabs", String(useElevenLabs));
  }, [useElevenLabs]);
  
  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);
  
  const speakText = async (text: string) => {
    // If already speaking, stop first
    if (isSpeaking) {
      stopSpeaking();
    }
    
    setIsSpeaking(true);
    
    if (useElevenLabs) {
      try {
        // Call Supabase Edge Function for ElevenLabs TTS
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { 
            text, 
            voiceId: selectedVoice.id 
          }
        });
        
        if (error) {
          console.error("Error generating speech with ElevenLabs:", error);
          // Fallback to browser TTS if ElevenLabs fails
          useBrowserTTS(text);
          return;
        }
        
        if (data?.audioContent) {
          // Play audio from the base64 content
          const audioSrc = `data:audio/mpeg;base64,${data.audioContent}`;
          const audio = new Audio(audioSrc);
          
          audio.onended = () => {
            setIsSpeaking(false);
          };
          
          audio.onerror = () => {
            console.error("Error playing audio");
            setIsSpeaking(false);
          };
          
          audio.play();
        } else {
          console.error("No audio content returned from ElevenLabs");
          // Fallback to browser TTS
          useBrowserTTS(text);
        }
      } catch (error) {
        console.error("Error with ElevenLabs TTS:", error);
        // Fallback to browser TTS
        useBrowserTTS(text);
      }
    } else {
      useBrowserTTS(text);
    }
  };
  
  const useBrowserTTS = (text: string) => {
    if (speechSynthesis) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      setIsSpeaking(true);
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };
  
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
    
    // Also stop any audio elements that might be playing
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    setIsSpeaking(false);
  };
  
  const toggleHighContrastMode = () => {
    setHighContrastMode(prev => !prev);
  };
  
  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        highContrastMode,
        speakText,
        isSpeaking,
        stopSpeaking,
        setTextSize,
        toggleHighContrastMode,
        selectedVoice,
        setSelectedVoice,
        useElevenLabs,
        setUseElevenLabs,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
