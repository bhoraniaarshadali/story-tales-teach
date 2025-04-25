import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const SESSION_TIMER_KEY = "sessionTimer";
const SESSION_START_TIME_KEY = "sessionStartTime";

const SessionTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Load saved time from localStorage
    const savedTime = localStorage.getItem(SESSION_TIMER_KEY);
    const savedStartTime = localStorage.getItem(SESSION_START_TIME_KEY);

    if (savedTime && savedStartTime) {
      const elapsedTime = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
      setSeconds(parseInt(savedTime) + elapsedTime);
    }

    // Start the timer
    const timer = setInterval(() => {
      if (isActive) {
        setSeconds(prevSeconds => prevSeconds + 1);
      }
    }, 1000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false);
        localStorage.setItem(SESSION_TIMER_KEY, seconds.toString());
      } else {
        setIsActive(true);
        localStorage.setItem(SESSION_START_TIME_KEY, Date.now().toString());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Save initial start time if not already set
    if (!savedStartTime) {
      localStorage.setItem(SESSION_START_TIME_KEY, Date.now().toString());
    }

    // Cleanup
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive, seconds]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center mb-4 text-sm text-muted-foreground">
      <Clock className="w-4 h-4 mr-1" />
      <span>  You’ve dedicated!  Time invested: {formatTime(seconds)} </span>
    </div>
  );
};

export default SessionTimer;