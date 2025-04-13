
import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";

const SessionTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const resetTimer = () => {
    setSeconds(0);
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  };

  const time = formatTime(seconds);

  return (
    <div className="w-full flex flex-col items-center mb-6">
      <p className="text-muted-foreground mb-1 text-sm">You've been reading for:</p>
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1">
          <div className="flex flex-col">
            {/* Retro digital clock display */}
            <div className="bg-black text-white font-mono rounded-md p-2 shadow-[0_0_10px_rgba(0,0,0,0.2)] flex">
              {/* Hours */}
              <div className="bg-gray-900 rounded px-2 py-1 mx-0.5">
                <div className="font-mono text-2xl md:text-3xl tabular-nums">{time.hours}</div>
              </div>
              <div className="text-2xl md:text-3xl flex items-center mx-0.5 animate-pulse">:</div>
              {/* Minutes */}
              <div className="bg-gray-900 rounded px-2 py-1 mx-0.5">
                <div className="font-mono text-2xl md:text-3xl tabular-nums">{time.minutes}</div>
              </div>
              <div className="text-2xl md:text-3xl flex items-center mx-0.5 animate-pulse">:</div>
              {/* Seconds */}
              <div className="bg-gray-900 rounded px-2 py-1 mx-0.5">
                <div className="font-mono text-2xl md:text-3xl tabular-nums" key={time.seconds}>
                  {time.seconds}
                </div>
              </div>
            </div>
          </div>
          
          {/* Reset button */}
          <Button 
            variant="outline"
            size="icon"
            className="ml-2"
            onClick={resetTimer}
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimer;
