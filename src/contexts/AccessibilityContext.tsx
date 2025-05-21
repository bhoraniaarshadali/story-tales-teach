
import React, { createContext, useContext, useState, useEffect } from "react";

type TextSize = "small" | "medium" | "large";

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  textSize: "medium",
  setTextSize: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSize] = useState<TextSize>(() => {
    const saved = localStorage.getItem("textSize");
    return (saved as TextSize) || "medium";
  });
  
  useEffect(() => {
    localStorage.setItem("textSize", textSize);
  }, [textSize]);

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
