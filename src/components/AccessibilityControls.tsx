import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

type TextSize = "small" | "medium" | "large";
type Theme = "light" | "dark" | "system";

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const defaultContext: AccessibilityContextType = {
  textSize: "medium",
  setTextSize: () => { },
  theme: "system",
  setTheme: () => { },
};

const AccessibilityContext = createContext<AccessibilityContextType>(defaultContext);

export const useAccessibility = () => useContext(AccessibilityContext);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Initialize state with values from localStorage if available
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    try {
      const savedTextSize = localStorage.getItem("textSize");
      return (savedTextSize as TextSize) || "medium";
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return "medium";
    }
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      return (savedTheme as Theme) || "system";
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return "system";
    }
  });

  // Update localStorage when values change
  useEffect(() => {
    try {
      localStorage.setItem("textSize", textSize);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [textSize]);

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);

      // Apply theme to document
      const root = window.document.documentElement;

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
      } else {
        root.classList.remove("light", "dark");
        root.classList.add(theme);
      }
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, [theme]);

  // Create wrapper functions for setState to add any additional logic
  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Listen for system theme changes if using system theme
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e: MediaQueryListEvent) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <AccessibilityContext.Provider value={{ textSize, setTextSize, theme, setTheme }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityContext;