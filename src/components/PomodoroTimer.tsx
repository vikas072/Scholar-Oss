import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Award, 
  Coffee, 
  BookOpen, 
  CheckCircle2,
  Trash2,
  ListPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PomodoroTimerProps {
  onAddLog: (
    category: "dsa" | "web_dev" | "core_cse" | "lab_practical", 
    title: string, 
    duration: number, 
    notes: string, 
    date?: string
  ) => void;
}

type TimerMode = "work" | "short_break" | "long_break";

export default function PomodoroTimer({ onAddLog }: PomodoroTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Log metadata to customize what is logged once completed
  const [sessionTitle, setSessionTitle] = useState("Pomodoro Focus Session");
  const [category, setCategory] = useState<"dsa" | "web_dev" | "core_cse" | "lab_practical">("dsa");
  const [sessionNotes, setSessionNotes] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store default times in seconds
  const modeDurations: Record<TimerMode, number> = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  // Notification sound utilizing standard Web Audio API Oscillator
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Ring sequence: Beep twice
      const playTone = (time: number, freq: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.00001, time + dur);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
      };

      const now = ctx.currentTime;
      playTone(now, 523.25, 0.4); // C5 note
      playTone(now + 0.5, 659.25, 0.6); // E5 note
    } catch (e) {
      console.error("Failed to generate notification alert tone:", e);
    }
  };

  // Initialize/change mode
  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(modeDurations[newMode]);
    
    if (newMode === "work") {
      setSessionTitle("Pomodoro Focus Session");
    } else if (newMode === "short_break") {
      setSessionTitle("Short Rest Break");
    } else {
      setSessionTitle("Long Rest Break");
    }
  };

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            setIsRunning(false);
            playBeep();
            
            // Auto addition of Log if it was a Work session
            if (mode === "work") {
              const minutesSpent = Math.ceil(modeDurations.work / 60);
              const customNotes = sessionNotes.trim() 
                ? sessionNotes 
                : "A fully completed 25-minute study session logged live via Pomodoro widget.";
              
              onAddLog(
                category, 
                sessionTitle.trim() || "Pomodoro Work Session", 
                minutesSpent,
                customNotes
              );
              
              // Standard feedback prompt
              alert(`🎉 Outstanding! Your 25-minute Pomodoro study sprint ("${sessionTitle}") was completed and was automatically saved inside your daily study desk log!`);
            } else {
              alert(`☕ Rest break ended! Grab some fresh water and prepare to power through your next coding sprint.`);
            }

            // Reset back to normal mode
            return modeDurations[mode];
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, category, sessionTitle, sessionNotes, soundEnabled]);

  // Reset current timer
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(modeDurations[mode]);
  };

  const minutesStr = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const secondsStr = (secondsLeft % 60).toString().padStart(2, "0");
  
  const progressRatio = secondsLeft / modeDurations[mode];
  const strokeDashoffset = 2 * Math.PI * 18 * (1 - progressRatio);

  return (
    <div id="pomodoro-floating-widget" className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen ? (
          /* Small Trigger Tab */
          <motion.button
            layoutId="pomodoro-expanded-box"
            onClick={() => setIsOpen(true)}
            className="bg-indigo-650 hover:bg-indigo-600 border border-indigo-505/20 text-white rounded-full p-3.5 shadow-2xl flex items-center gap-2 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Expand Pomodoro Timer"
          >
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  className="stroke-indigo-800"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  className="stroke-white"
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 16}
                  strokeDashoffset={2 * Math.PI * 16 * (1 - progressRatio)}
                  strokeLinecap="round"
                />
              </svg>
              <Timer className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            </div>

            <div className="text-left pr-1.5 hidden sm:block">
              <span className="text-[10px] font-mono font-extrabold text-indigo-200 block uppercase tracking-wider">
                {mode === "work" ? "FOCUSING" : "BREAKING"}
              </span>
              <span className="text-sm font-mono font-extrabold tracking-tight">
                {minutesStr}:{secondsStr}
              </span>
            </div>
          </motion.button>
        ) : (
          /* Expanded controller Dashboard console */
          <motion.div
            layoutId="pomodoro-expanded-box"
            className="w-[330px] bg-slate-950/95 backdrop-blur-xl border border-indigo-505/25 rounded-3xl p-5 shadow-[0_15px_50px_-15px_rgba(31,38,135,0.47)] text-left"
          >
            {/* Header Control row */}
            <div className="flex items-center justify-between border-b border-indigo-550/15 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Pomodoro Matrix</h4>
                  <span className="text-[9px] text-slate-500 font-mono">STABILIZE FOCUS CYCLES</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Audio Alert Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(prev => !prev)}
                  className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                  title={soundEnabled ? "Mute beep alert" : "Unmute beep alert"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Minimizer button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Minimize widget"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Presets tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl mb-4 border border-slate-850">
              {(["work", "short_break", "long_break"] as TimerMode[]).map((m) => {
                const isActive = mode === m;
                let lbl = "Focus";
                if (m === "short_break") lbl = "Short Rest";
                if (m === "long_break") lbl = "Long Rest";
                
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleModeChange(m)}
                    className={`text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                      isActive 
                        ? "bg-indigo-650 text-white shadow-sm font-extrabold" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>

            {/* Large Visual Counter circle */}
            <div className="flex flex-col items-center justify-center py-4 bg-slate-950/40 border border-slate-905 p-4 rounded-2xl relative mb-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    className="stroke-indigo-950"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="54"
                    className="stroke-indigo-500"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - progressRatio) }}
                    transition={{ duration: 0.1, ease: "linear" }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Numbers display digits */}
                <div className="text-center space-y-0.5 z-10">
                  <span className="text-3xl font-mono font-extrabold text-white tracking-tighter block selection:bg-indigo-600">
                    {minutesStr}:{secondsStr}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-indigo-400 block uppercase tracking-widest leading-none">
                    {mode === "work" ? "STUDY CYCLE" : "RECESS REST"}
                  </span>
                </div>
              </div>

              {/* Action play pauses row */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
                  title="Reset session timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`p-3 rounded-full text-white cursor-pointer active:scale-90 transition-all shadow-md ${
                    isRunning 
                      ? "bg-rose-600 hover:bg-rose-500 shadow-rose-950/20" 
                      : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20"
                  }`}
                  title={isRunning ? "Pause Session" : "Start Session"}
                >
                  {isRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Custom metadata logging options (visible only during Work sessions) */}
            {mode === "work" && (
              <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-2.5">
                <span className="text-[8px] font-mono font-extrabold text-indigo-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                  📝 Live log settings (auto addition once complete)
                </span>

                {/* Session Title field */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold text-slate-400 block">Session Focus Title:</label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="e.g. Focus on graph algorithms"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-505"
                  />
                </div>

                {/* Category classification Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold text-slate-400 block">Category tag:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-505 font-mono cursor-pointer"
                  >
                    <option value="dsa">DSA Practice Track</option>
                    <option value="web_dev">Web Development Module</option>
                    <option value="core_cse">Core CSE Fundamentals</option>
                    <option value="lab_practical">Lab Practical Assignment</option>
                  </select>
                </div>

                {/* Session study notes */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold text-slate-400 block">Session Summary Notes (Optional):</label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Approaches used, challenges resolved, next items..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-350 focus:outline-none focus:border-indigo-505 h-11 resize-none placeholder:text-slate-655"
                  />
                </div>
              </div>
            )}

            {mode !== "work" && (
              <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl flex items-center gap-2.5 text-slate-400 text-xs">
                <Coffee className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="leading-normal font-sans text-[11px]">
                  Break mode is running. Take a stretch sequence, rest your visual focus, or hydrate before coding again!
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
