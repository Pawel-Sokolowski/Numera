import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Timer, Play, Pause, Square } from "lucide-react";
import { toast } from 'sonner';

interface ActiveTimer {
  id: string;
  clientName: string;
  projectName: string;
  taskName: string;
  startTime: string;
  elapsedTime: number;
}

interface ActiveTimerDisplayProps {
  onStartTimer?: () => void;
}

export function ActiveTimerDisplay({ onStartTimer }: ActiveTimerDisplayProps) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  // Mock active timer for demo - in real app this would come from a global state
  useEffect(() => {
    // Check if there's an active timer in localStorage
    const savedTimer = localStorage.getItem('activeTimer');
    if (savedTimer) {
      const timer = JSON.parse(savedTimer);
      setActiveTimer(timer);
    }
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    if (activeTimer) {
      const interval = setInterval(() => {
        setActiveTimer(prev => {
          if (prev) {
            const now = new Date();
            const start = new Date(prev.startTime);
            const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
            const updated = { ...prev, elapsedTime: elapsed };
            // Save to localStorage
            localStorage.setItem('activeTimer', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stopTimer = () => {
    if (activeTimer) {
      const duration = Math.floor(activeTimer.elapsedTime / 60); // minutes
      localStorage.removeItem('activeTimer');
      setActiveTimer(null);
      toast.success(`Czasomierz zatrzymany (${Math.floor(duration/60)}h ${duration%60}m)`);
    }
  };

  const pauseTimer = () => {
    if (activeTimer) {
      const duration = Math.floor(activeTimer.elapsedTime / 60); // minutes
      localStorage.removeItem('activeTimer');
      setActiveTimer(null);
      toast.success(`Czasomierz wstrzymany (${Math.floor(duration/60)}h ${duration%60}m)`);
    }
  };

  const startDemoTimer = () => {
    // Sprawdź czy już nie ma aktywnego czasomierza
    if (activeTimer) {
      toast.error("Zatrzymaj obecny czasomierz przed rozpoczęciem nowego");
      return;
    }
    
    const demoTimer: ActiveTimer = {
      id: Date.now().toString(),
      clientName: "ABC Sp. z o.o.",
      projectName: "Projekt Biurowy", 
      taskName: "Rozwój aplikacji",
      startTime: new Date().toISOString(),
      elapsedTime: 0
    };
    
    setActiveTimer(demoTimer);
    localStorage.setItem('activeTimer', JSON.stringify(demoTimer));
    toast.success("Czasomierz został uruchomiony");
  };

  if (!activeTimer) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onStartTimer || startDemoTimer}
        className="gap-2"
      >
        <Timer className="h-4 w-4" />
        <span className="hidden sm:inline">Start Timer</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="secondary" 
        className="gap-2 px-3 py-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
      >
        <Timer className="h-3 w-3 animate-pulse" />
        <span className="font-mono font-medium">
          {formatTime(activeTimer.elapsedTime)}
        </span>
      </Badge>
      
      <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
        <span>{activeTimer.clientName}</span>
        <span>•</span>
        <span>{activeTimer.taskName}</span>
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={pauseTimer}
          className="h-6 w-6 p-0"
        >
          <Pause className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={stopTimer}
          className="h-6 w-6 p-0"
        >
          <Square className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}