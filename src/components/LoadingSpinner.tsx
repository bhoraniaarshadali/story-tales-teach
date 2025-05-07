
import React, { useState, useEffect } from "react";
import { getRandomLoadingMessage } from "../utils/loadingMessages";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  topic?: string;
  isPersonalized?: boolean;
  retryCount?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "medium", 
  topic, 
  isPersonalized = false,
  retryCount = 0 
}) => {
  const [message, setMessage] = useState<string>("");
  
  // Determine size classes
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16"
  };

  // Set a random loading message when component mounts or topic changes
  useEffect(() => {
    setMessage(getRandomLoadingMessage());
  }, [topic]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg
          className="text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      
      {topic && (
        <div className="text-center">
          <p className="text-muted-foreground animate-pulse">
            {message}
          </p>
          <p className="mt-1 text-sm text-muted-foreground/80">
            Topic: {topic}
            {isPersonalized && <span className="ml-1">(personalized)</span>}
            {retryCount > 0 && <span className="block text-sm mt-1">Attempt {retryCount + 1}...</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
