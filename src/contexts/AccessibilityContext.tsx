
import React, { createContext, useContext, useState, useEffect } from "react";

interface AccessibilityContextType {
  textSize: "small" | "medium" | "large";
  highContrastMode: boolean;
  speakText: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  setTextSize: (size: "small" | "medium" | "large") => void;
  toggleHighContrastMode: () => void;
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
  
  const [isSpeeching, setIsSpeeching] = useState<boolean>(false);
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
  
  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);
  
  const speakText = (text: string) => {
    if (speechSynthesis) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      setIsSpeeching(true);
      
      utterance.onend = () => {
        setIsSpeeching(false);
      };
      
      utterance.onerror = () => {
        setIsSpeeching(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };
  
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeeching(false);
    }
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
        isSpeeching,
        stopSpeaking,
        setTextSize,
        toggleHighContrastMode,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
