import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const SessionTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Start the timer when component mounts
    const timer = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds + 1);
    }, 1000);

    // Clear the timer when component unmounts
    return () => clearInterval(timer);
  }, []);

  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center mb-4 text-sm text-muted-foreground">
      <Clock className="w-4 h-4 mr-1" />
      <span>Reading Time: {formatTime(seconds)}</span>
    </div>
  );
};

export default SessionTimer;