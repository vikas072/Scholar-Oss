import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Check, 
  Award, 
  Brain, 
  FolderPlus, 
  Flame,
  ChevronRight,
  BookOpen,
  Code,
  Terminal,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DailyActiveStudyTimerProps {
  onAddLog: (
    category: "dsa" | "web_dev" | "core_cse" | "lab_practical", 
    title: string, 
    duration: number, 
    notes: string, 
    date?: string
  ) => void;
}

type TimerState = "idle" | "running" | "paused";
type Mode = "stopwatch" | "countdown";

export default function DailyActiveStudyTimer({ onAddLog }: DailyActiveStudyTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [timerMode, setTimerMode] = useState<Mode>("stopwatch");
  
  // Setup countdown options in minutes
  const [selectedCountdownMins, setSelectedCountdownMins] = useState<number>(25);
  
  // Accumulated time in seconds
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(25 * 60);

  // Settings
  const [category, setCategory] = useState<"dsa" | "web_dev" | "core_cse" | "lab_practical">("web_dev");
  const [sessionTitle, setSessionTitle] = useState("Custom Study Session");
  const [sessionNotes, setSessionNotes] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start / pause action
  const handleStartPause = () => {
    if (timerState === "running") {
      setTimerState("paused");
    } else {
      setTimerState("running");
    }
  };

  // Reset
  const handleReset = () => {
    setTimerState("idle");
    if (timerMode === "stopwatch") {
      setElapsedSeconds(0);
    } else {
      setCountdownSeconds(selectedCountdownMins * 60);
    }
  };

  // Change Timer mode
  const handleModeChange = (mode: Mode) => {
    setTimerState("idle");
    setTimerMode(mode);
    setElapsedSeconds(0);
    setCountdownSeconds(selectedCountdownMins * 60);
  };

  // Change quick preset countdown mins
  const handlePresetChange = (mins: number) => {
    setSelectedCountdownMins(mins);
    if (timerMode === "countdown") {
      setTimerState("idle");
      setCountdownSeconds(mins * 60);
    }
  };

  // Dynamic ticking loop
  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        if (timerMode === "stopwatch") {
          setElapsedSeconds(prev => prev + 1);
        } else {
          setCountdownSeconds(prev => {
            if (prev <= 1) {
              // Trigger success alert sound/buzz
              setTimerState("idle");
              try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                  const ctx = new AudioContext();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.type = "sine";
                  osc.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
                  gain.gain.setValueAtTime(0.15, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 1.2);
                }
              } catch (e) {
                console.warn(e);
              }
              
              // Automatically complete & offer log prompt
              alert(`🎉 Well done! You have completed your customized ${selectedCountdownMins} minute study sprint!`);
              // Pre-fill elapsed to match countdown duration for logging
              setElapsedSeconds(selectedCountdownMins * 60);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, timerMode, selectedCountdownMins]);

  // Capture total studied duration
  const activeSessionMinutes = useMemo(() => {
    if (timerMode === "stopwatch") {
      return Math.max(1, Math.ceil(elapsedSeconds / 60));
    } else {
      // For countdown, minutes completed is total mins minus remaining mins
      const elapsed = (selectedCountdownMins * 60) - countdownSeconds;
      return Math.max(1, Math.ceil(elapsed / 60));
    }
  }, [elapsedSeconds, countdownSeconds, timerMode, selectedCountdownMins]);

  // Log to database & dashboard
  const handleSaveToLog = () => {
    const finalMins = activeSessionMinutes;
    const finalTitle = sessionTitle.trim() || `${category.replace("_", " ").toUpperCase()} Active Study Session`;
    const finalNotes = sessionNotes.trim() || `Duration tracked live via custom active stopwatch dashboard widget.`;

    onAddLog(category, finalTitle, finalMins, finalNotes);
    
    // Reset timer
    handleReset();
    setSessionNotes("");
    setSessionTitle("Custom Study Session");
    
    alert(`📊 Stored focus log successfully! Your studied duration (${finalMins} minutes) has been successfully applied to your global study streak, progress meters, and color intensity calendar.`);
  };

  // Convert seconds to human printable MM:SS format
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const getThemeColorClass = () => {
    if (category === "web_dev") return { text: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10", stroke: "#3b82f6" };
    if (category === "dsa") return { text: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10", stroke: "#f59e0b" };
    if (category === "core_cse") return { text: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10", stroke: "#a855f7" };
    return { text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10", stroke: "#10b981" };
  };

  const currentTheme = getThemeColorClass();

  return (
    <div 
      id="dashboard-study-timer-container" 
      className="backdrop-blur-md bg-slate-900/50 border border-slate-800/85 rounded-3xl p-5.5 relative overflow-hidden shadow-lg"
    >
      {/* Decorative backdrop graphics */}
      <div className={`absolute -right-10 -top-10 w-28 h-28 ${currentTheme.bg} blur-2xl rounded-full transition-all duration-500 pointer-events-none`} />

      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-810/60 pb-3 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 rounded-xl relative">
            <Timer className="w-4 h-4 animate-pulse" />
            {timerState === "running" && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-[12.5px] font-extrabold text-white uppercase tracking-wider font-mono">Study Track Console</h3>
            <p className="text-[10px] text-slate-500">Log customized focus hours or stopwatch milestones live</p>
          </div>
        </div>

        {/* Stopwatch vs Countdown Selectors tabs */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-slate-850">
          <button
            onClick={() => handleModeChange("stopwatch")}
            className={`text-[9.5px] font-mono font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
              timerMode === "stopwatch" ? "bg-indigo-600 text-white font-extrabold" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Chronograph
          </button>
          <button
            onClick={() => handleModeChange("countdown")}
            className={`text-[9.5px] font-mono font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
              timerMode === "countdown" ? "bg-indigo-600 text-white font-extrabold" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Sprints
          </button>
        </div>
      </div>

      {/* Control console panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10">
        
        {/* Left Side: Numeric Timer core */}
        <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/40 p-4 rounded-2xl border border-slate-900 text-center min-h-[160px]">
          
          <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${currentTheme.text} mb-1 block`}>
            {timerState === "running" ? "Currently Logging Session" : timerState === "paused" ? "Focus Paused" : "Console Ready"}
          </span>

          <span className="text-3xl font-mono font-black text-white block tracking-tighter tabular-nums select-all mt-1">
            {timerMode === "stopwatch" ? formatTime(elapsedSeconds) : formatTime(countdownSeconds)}
          </span>

          {/* Quick countdown options (Visible only during countdown prep) */}
          {timerMode === "countdown" && timerState === "idle" && (
            <div className="flex items-center justify-center gap-1.5 mt-3 self-stretch flex-wrap">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handlePresetChange(mins)}
                  className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                    selectedCountdownMins === mins
                      ? "bg-slate-100 border-slate-100 text-slate-950"
                      : "bg-slate-905 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}

          {/* Action start buttons */}
          <div className="flex items-center gap-2.5 mt-4">
            {/* Reset */}
            <button
              onClick={handleReset}
              disabled={timerState === "idle"}
              className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-slate-950/50 cursor-pointer active:scale-95"
              title="Reset timer state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Play Pause */}
            <button
              onClick={handleStartPause}
              className={`p-2 px-5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md ${
                timerState === "running"
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-950/20"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/20"
              }`}
            >
              {timerState === "running" ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{timerState === "paused" ? "Resume" : "Start Now"}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Setup parameters / addition form */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3">
          
          <div className="space-y-2">
            {/* Focus categories selection options */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-slate-550 uppercase tracking-wider block">Choose study module:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: "web_dev", label: "Web Dev Practice", color: "hover:border-blue-500/20 hover:text-blue-400" },
                  { value: "dsa", label: "DSA Sprints", color: "hover:border-amber-500/20 hover:text-amber-400" },
                  { value: "core_cse", label: "Core Academy", color: "hover:border-purple-500/20 hover:text-purple-400" },
                  { value: "lab_practical", label: "Practical Lab", color: "hover:border-emerald-500/20 hover:text-emerald-400" }
                ].map((item) => {
                  const isSelect = category === item.value;
                  return (
                    <button
                      key={item.value}
                      disabled={timerState === "running"}
                      onClick={() => setCategory(item.value as any)}
                      className={`text-[10px] py-1 px-2 border rounded-xl font-medium transition-all text-left truncate flex items-center gap-1 cursor-pointer ${
                        timerState === "running" ? "opacity-60 cursor-not-allowed" : ""
                      } ${
                        isSelect
                          ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-bold"
                          : `bg-slate-950/40 border-slate-905 text-slate-400 ${item.color}`
                      }`}
                    >
                      <Activity className="w-2.5 h-2.5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Session Title */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-slate-550 uppercase tracking-wider block">Sprint focus description:</label>
              <input
                type="text"
                value={sessionTitle}
                disabled={timerState === "running"}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g., Codeforces Problem 282A or System design hours"
                className="w-full bg-slate-950 border border-slate-850 px-2.5 py-1.5 rounded-xl text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-650"
              />
            </div>
          </div>

          {/* Save/Log Action triggers */}
          <div className="border-t border-slate-810/60 pt-2 flex items-center justify-between gap-2.5">
            <div className="text-left font-mono">
              <span className="text-[8px] text-slate-500 block uppercase">Accumulated focus:</span>
              <span className="text-[11px] font-bold text-white block">{activeSessionMinutes} {activeSessionMinutes === 1 ? "min" : "mins"}</span>
            </div>

            <button
              onClick={handleSaveToLog}
              disabled={timerState === "running" || (timerMode === "stopwatch" && elapsedSeconds === 0)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold font-mono uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Write Focus Log</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
