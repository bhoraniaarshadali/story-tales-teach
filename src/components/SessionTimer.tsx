import React, { useState, useEffect, useRef } from "react";
import { Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_TIMER_KEY = "sessionTimer";
const SESSION_START_TIME_KEY = "sessionStartTime";
const FIRST_VISIT_KEY = "firstVisit";
const WELCOME_SHOWN_KEY = "welcomeShown";

const SessionTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(() => {
    // Initialize state with saved time if it exists
    const savedTime = localStorage.getItem(SESSION_TIMER_KEY);
    return savedTime ? parseInt(savedTime) : 0;
  });

  const [isActive, setIsActive] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const toastId = useRef<string | number | null>(null);

  useEffect(() => {
    // Check if it's first visit
    const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY);
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);

    if (isFirstVisit && !welcomeShown) {
      localStorage.setItem(FIRST_VISIT_KEY, "true");
      localStorage.setItem(WELCOME_SHOWN_KEY, "true");
      setShowWelcome(true);
      toastId.current = toast.success("Welcome to Story Tales! Your learning journey begins now!", {
        duration: 4000,
        icon: <Sparkles className="text-yellow-400" />,
      });
    } else if (!isFirstVisit && !welcomeShown) {
      // Show welcome back message with total time
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
      toastId.current = toast.info(`Welcome back! You've spent ${formatTime(seconds)} learning so far!`, {
        duration: 3000,
        icon: <Clock className="text-blue-400" />,
      });
      localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    }

    // Start the timer
    const timer = setInterval(() => {
      if (isActive) {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          localStorage.setItem(SESSION_TIMER_KEY, newSeconds.toString());
          return newSeconds;
        });
      }
    }, 1000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false);
        if (toastId.current) {
          toast.dismiss(toastId.current);
        }
        toastId.current = toast.info("Timer paused. We'll continue when you're back!", {
          duration: 2000,
        });
      } else {
        setIsActive(true);
        if (toastId.current) {
          toast.dismiss(toastId.current);
        }
        toastId.current = toast.success("Welcome back! Timer resumed.", {
          duration: 2000,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
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
    <div className="flex items-center justify-center mb-4">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 text-center"
          >
            Welcome to Story Tales! Let's start learning!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex items-center justify-center text-sm text-muted-foreground"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={isActive ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Clock className="w-4 h-4 mr-1" />
        </motion.div>
        <motion.span
          animate={isActive ? { color: ["#64748b", "#3b82f6", "#64748b"] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>
            You’ve dedicated!  Time invested: {formatTime(seconds)}
          </span>
        </motion.span>
      </motion.div>
    </div>
  );
};

export default SessionTimer;