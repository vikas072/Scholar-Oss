import React, { useState, useMemo } from "react";
import { StudyLog } from "../types";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  BookOpen, 
  Flame, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  Clock,
  Palette,
  Heart,
  Droplet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StudyIntensityCalendarProps {
  logs: StudyLog[];
}

type ColorTheme = "indigo" | "emerald" | "amber" | "rose" | "cyan" | "rainbow";

export default function StudyIntensityCalendar({ logs }: StudyIntensityCalendarProps) {
  // Use current system date to open the calendar
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    today.toISOString().split("T")[0]
  );

  // Theme selector state
  const [activeTheme, setActiveTheme] = useState<ColorTheme>("indigo");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper: Format to local YYYY-MM-DD string
  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  // Group logs by YYYY-MM-DD
  const logsByDate = useMemo(() => {
    const map: Record<string, StudyLog[]> = {};
    logs.forEach(log => {
      if (!log.date) return;
      const dateStr = log.date.trim();
      if (!map[dateStr]) {
        map[dateStr] = [];
      }
      map[dateStr].push(log);
    });
    return map;
  }, [logs]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Calculate calendar grid details for the current month
  const calendarDays = useMemo(() => {
    const firstDayInstance = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayInstance.getDay(); // 0 is Sunday
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];

    // Preceding empty slots
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        dayNumber: null,
        dateStr: null,
        isEmpty: true
      });
    }

    // Active days of current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dStr = formatDateString(currentYear, currentMonth, d);
      days.push({
        dayNumber: d,
        dateStr: dStr,
        isEmpty: false
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Selected Day's active logs
  const selectedDayLogs = useMemo(() => {
    if (!selectedDateStr) return [];
    return logsByDate[selectedDateStr] || [];
  }, [selectedDateStr, logsByDate]);

  // Upgraded interactive, gorgeous coloring matrix with multiple presets!
  const getIntensityInfo = (count: number) => {
    if (count === 0) {
      const emptyStyles = {
        indigo: {
          bgClass: "bg-slate-950/40 border border-indigo-950/15 text-slate-500 hover:border-indigo-900/40 hover:bg-indigo-950/10 hover:text-indigo-400/90",
          label: "Zero logs logged",
          badgeColor: "bg-slate-900 border-slate-800 text-slate-500"
        },
        emerald: {
          bgClass: "bg-slate-950/40 border border-emerald-955/15 text-slate-500 hover:border-emerald-900/40 hover:bg-emerald-950/10 hover:text-emerald-400/90",
          label: "Zero logs logged",
          badgeColor: "bg-slate-900 border-slate-800 text-slate-500"
        },
        amber: {
          bgClass: "bg-slate-950/40 border border-amber-955/15 text-slate-500 hover:border-amber-900/40 hover:bg-amber-950/10 hover:text-amber-400/90",
          label: "Zero logs logged",
          badgeColor: "bg-slate-900 border-slate-800 text-slate-500"
        },
        rose: {
          bgClass: "bg-slate-950/40 border border-rose-955/15 text-slate-500 hover:border-rose-900/40 hover:bg-rose-950/10 hover:text-rose-400/90",
          label: "Zero logs logged",
          badgeColor: "bg-slate-900 border-slate-800 text-slate-500"
        },
        cyan: {
          bgClass: "bg-slate-950/40 border border-cyan-955/15 text-slate-500 hover:border-cyan-900/40 hover:bg-cyan-950/10 hover:text-cyan-400/90",
          label: "Zero logs logged",
          badgeColor: "bg-slate-900 border-slate-800 text-slate-500"
        },
        rainbow: {
          bgClass: "bg-slate-950/40 border border-purple-955/15 text-slate-500 hover:border-purple-900/40 hover:bg-purple-950/10 hover:text-purple-400/90",
          label: "Zero logs logged",
          badgeColor: "bg-slate-900 border-slate-800 text-slate-500"
        }
      };
      return emptyStyles[activeTheme] || {
        bgClass: "bg-slate-950/40 border border-slate-900/60 text-slate-605 hover:border-slate-800",
        label: "Zero logs logged",
        badgeColor: "bg-slate-900 border-slate-800 text-slate-500"
      };
    }

    // Define colors dynamically with rich gradients, shadows, and stunning contrast
    const colors: Record<ColorTheme, Record<number, { bgClass: string; label: string; badgeColor: string }>> = {
      indigo: {
        1: {
          bgClass: "bg-gradient-to-br from-indigo-950/60 to-indigo-900/20 border border-indigo-900/40 text-indigo-300 hover:border-indigo-650 shadow-[inset_0_1px_8px_rgba(99,102,241,0.12)]",
          label: "1 session: Quiet focus",
          badgeColor: "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
        },
        2: {
          bgClass: "bg-gradient-to-br from-indigo-900/45 to-indigo-800/30 border border-indigo-700/60 text-indigo-200 hover:border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.18)]",
          label: "2 sessions: Dynamic focus",
          badgeColor: "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
        },
        3: {
          bgClass: "bg-gradient-to-br from-indigo-805/40 to-indigo-705 border border-indigo-550/70 text-indigo-100 hover:border-indigo-400 shadow-[0_4px_16px_rgba(99,102,241,0.28)]",
          label: "3 sessions: Dedicated focus!",
          badgeColor: "bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 font-bold"
        },
        4: {
          bgClass: "bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-700 border border-indigo-300 text-white font-extrabold hover:border-white hover:scale-105 shadow-[0_0_24px_rgba(99,102,241,0.55)]",
          label: "4+ sessions: Maximum Overdrive!",
          badgeColor: "bg-indigo-500/30 border border-indigo-400/65 text-indigo-100 animate-pulse"
        }
      },
      emerald: {
        1: {
          bgClass: "bg-gradient-to-br from-emerald-950/60 to-emerald-900/20 border border-emerald-900/40 text-emerald-300 hover:border-emerald-650 shadow-[inset_0_1px_8px_rgba(16,185,129,0.12)]",
          label: "1 session: Sprout phase",
          badgeColor: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
        },
        2: {
          bgClass: "bg-gradient-to-br from-emerald-900/45 to-emerald-800/30 border border-emerald-700/60 text-emerald-200 hover:border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.18)]",
          label: "2 sessions: Active developer",
          badgeColor: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
        },
        3: {
          bgClass: "bg-gradient-to-br from-emerald-805/40 to-emerald-705 border border-emerald-555/70 text-emerald-100 hover:border-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.28)]",
          label: "3 sessions: Core developer sprint!",
          badgeColor: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-bold"
        },
        4: {
          bgClass: "bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-700 border border-emerald-300 text-white font-extrabold hover:border-white hover:scale-105 shadow-[0_0_24px_rgba(16,185,129,0.55)]",
          label: "4+ sessions: High efficiency green!",
          badgeColor: "bg-emerald-500/30 border border-emerald-400/65 text-emerald-100 animate-pulse"
        }
      },
      amber: {
        1: {
          bgClass: "bg-gradient-to-br from-amber-955/60 to-amber-900/20 border border-amber-900/40 text-amber-300 hover:border-amber-650 shadow-[inset_0_1px_8px_rgba(245,158,11,0.12)]",
          label: "1 session: Ignite focus",
          badgeColor: "bg-amber-500/10 border border-amber-500/20 text-amber-400"
        },
        2: {
          bgClass: "bg-gradient-to-br from-amber-900/45 to-amber-805/30 border border-amber-707/60 text-amber-200 hover:border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.18)]",
          label: "2 sessions: Burning energy",
          badgeColor: "bg-amber-500/15 border border-amber-500/30 text-amber-305"
        },
        3: {
          bgClass: "bg-gradient-to-br from-amber-805/40 to-amber-705 border border-amber-555/70 text-amber-100 hover:border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.28)]",
          label: "3 sessions: Wildfire stride!",
          badgeColor: "bg-amber-500/20 border border-amber-500/40 text-amber-100 font-bold"
        },
        4: {
          bgClass: "bg-gradient-to-tr from-amber-600 via-amber-550 to-amber-700 border border-amber-300 text-white font-extrabold hover:border-white hover:scale-105 shadow-[0_0_24px_rgba(245,158,11,0.55)]",
          label: "4+ sessions: Solar Supernova!",
          badgeColor: "bg-amber-500/30 border border-amber-400/65 text-amber-100 animate-pulse"
        }
      },
      rose: {
        1: {
          bgClass: "bg-gradient-to-br from-rose-955/60 to-rose-900/20 border border-rose-900/40 text-rose-300 hover:border-rose-650 shadow-[inset_0_1px_8px_rgba(244,63,94,0.12)]",
          label: "1 session: Sakura bloom",
          badgeColor: "bg-rose-500/10 border border-rose-500/20 text-rose-400"
        },
        2: {
          bgClass: "bg-gradient-to-br from-rose-900/45 to-rose-805/30 border border-rose-707/60 text-rose-200 hover:border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.18)]",
          label: "2 sessions: Active bloom",
          badgeColor: "bg-rose-500/15 border border-rose-500/30 text-rose-300"
        },
        3: {
          bgClass: "bg-gradient-to-br from-rose-805/40 to-rose-705 border border-rose-555/70 text-rose-100 hover:border-rose-400 shadow-[0_4px_16px_rgba(244,63,94,0.28)]",
          label: "3 sessions: Deep focus rose!",
          badgeColor: "bg-rose-500/20 border border-rose-500/40 text-rose-150 font-bold"
        },
        4: {
          bgClass: "bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-700 border border-rose-300 text-white font-extrabold hover:border-white hover:scale-105 shadow-[0_0_24px_rgba(244,63,94,0.55)]",
          label: "4+ sessions: Ultimate Sakura Heat!",
          badgeColor: "bg-rose-500/30 border border-rose-400/65 text-rose-100 animate-pulse"
        }
      },
      cyan: {
        1: {
          bgClass: "bg-gradient-to-br from-cyan-955/60 to-cyan-900/20 border border-cyan-900/40 text-cyan-300 hover:border-cyan-650 shadow-[inset_0_1px_8px_rgba(6,182,212,0.12)]",
          label: "1 session: Fresh frost",
          badgeColor: "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
        },
        2: {
          bgClass: "bg-gradient-to-br from-cyan-900/45 to-cyan-805/30 border border-cyan-707/60 text-cyan-200 hover:border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.18)]",
          label: "2 sessions: Glowing ice",
          badgeColor: "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
        },
        3: {
          bgClass: "bg-gradient-to-br from-cyan-805/40 to-cyan-705 border border-cyan-555/70 text-cyan-100 hover:border-cyan-400 shadow-[0_4px_16px_rgba(6,182,212,0.28)]",
          label: "3 sessions: Cyan blizzard sprint!",
          badgeColor: "bg-cyan-500/20 border border-cyan-500/40 text-cyan-100 font-bold"
        },
        4: {
          bgClass: "bg-gradient-to-tr from-cyan-600 via-cyan-500 to-cyan-700 border border-cyan-300 text-white font-extrabold hover:border-white hover:scale-105 shadow-[0_0_24px_rgba(6,182,212,0.55)]",
          label: "4+ sessions: Glacial SVD Matrix!",
          badgeColor: "bg-cyan-500/30 border border-cyan-400/65 text-cyan-100 animate-pulse"
        }
      },
      rainbow: {
        1: {
          bgClass: "bg-gradient-to-br from-blue-955/60 to-blue-900/20 border border-blue-500/40 text-blue-300 hover:border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
          label: "1 session: Sky blue",
          badgeColor: "bg-blue-500/15 border border-blue-500/20 text-blue-300"
        },
        2: {
          bgClass: "bg-gradient-to-br from-emerald-955/60 to-emerald-900/20 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
          label: "2 sessions: Forest gold",
          badgeColor: "bg-emerald-500/15 border border-emerald-500/20 text-emerald-300"
        },
        3: {
          bgClass: "bg-gradient-to-br from-purple-955/60 to-purple-900/20 border border-purple-500/45 text-purple-200 hover:border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.25)]",
          label: "3 sessions: Orchid light",
          badgeColor: "bg-purple-500/15 border border-purple-500/30 text-purple-200"
        },
        4: {
          bgClass: "bg-gradient-to-tr from-rose-500 to-amber-505 border border-rose-300 text-white font-extrabold hover:border-white hover:scale-105 shadow-[0_0_24px_rgba(244,63,94,0.65)]",
          label: "4+ sessions: Rainbow Supernova!",
          badgeColor: "bg-gradient-to-r from-rose-500/15 to-amber-500/15 border border-amber-500/20 text-amber-300 animate-bounce"
        }
      }
    };

    const cappedCount = Math.min(count, 4);
    return colors[activeTheme][cappedCount];
  };

  // Quick theme metadata descriptors
  const themeLabels: Record<ColorTheme, string> = {
    indigo: "Cosmic Indigo",
    emerald: "Forest Mint (GitHub Style)",
    amber: "Solar Amber",
    rose: "Sakura Cherry",
    cyan: "Neon Ice Glazier",
    rainbow: "Arcade Rainbow"
  };

  return (
    <div 
      id="study-intensity-calendar-panel" 
      className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden shadow-lg"
    >
      {/* Decorative Light Glows */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-500/5 to-transparent blur-2xl pointer-events-none" />

      {/* Header Area */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 mb-5 border-b border-slate-800/80 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Study Intensity Calendar</span>
            </h3>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded uppercase tracking-wider block">
              IMPROVED COLOR PRESETS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize your daily active study intensity to keep your streak glowing
          </p>
        </div>

        {/* Dynamic Theme Color selection dropdown/buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-850">
          <div className="flex items-center gap-1.5 px-2 text-slate-500 text-[10px] font-mono">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Theme:</span>
          </div>
          
          {(["indigo", "emerald", "amber", "rose", "cyan", "rainbow"] as ColorTheme[]).map((thm) => {
            const isSelected = activeTheme === thm;
            let themeDot = "bg-indigo-400";
            if (thm === "emerald") themeDot = "bg-emerald-400";
            if (thm === "amber") themeDot = "bg-amber-400";
            if (thm === "rose") themeDot = "bg-rose-400";
            if (thm === "cyan") themeDot = "bg-cyan-400";
            if (thm === "rainbow") themeDot = "bg-gradient-to-r from-rose-400 to-blue-400";

            return (
              <button
                key={thm}
                onClick={() => setActiveTheme(thm)}
                className={`text-[9.5px] font-mono font-bold px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer select-none ${
                  isSelected 
                    ? "bg-slate-900 border border-slate-800 text-white font-extrabold" 
                    : "text-slate-500 hover:text-slate-350"
                }`}
                title={`Switch to ${themeLabels[thm]} style`}
              >
                <span className={`w-2 h-2 rounded-full ${themeDot}`} />
                <span className="capitalize">{thm}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Calendar visualizer column */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Controls bar / Legend merged */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/30 border border-slate-850 p-3 rounded-xl">
            
            {/* Nav button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-black text-slate-100 uppercase tracking-widest min-w-[110px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>

              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Micro legend indicators */}
            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 select-none bg-slate-950 px-2 py-1 rounded border border-slate-900/60 scale-95 sm:scale-100 origin-right">
              <span>0 Logs</span>
              <div className="w-2.5 h-2.5 rounded bg-slate-950/40 border border-slate-900/60" />
              {/* Dynamic legend dots */}
              <div className={`w-2.5 h-2.5 rounded ${getIntensityInfo(1).bgClass.split(" ")[0]} border border-slate-900/60`} />
              <div className={`w-2.5 h-2.5 rounded ${getIntensityInfo(2).bgClass.split(" ")[0]} border border-slate-900/60`} />
              <div className={`w-2.5 h-2.5 rounded ${getIntensityInfo(3).bgClass.split(" ")[0]} border border-slate-900/60`} />
              <div className={`w-2.5 h-2.5 rounded ${getIntensityInfo(4).bgClass.split(" ")[0]} border border-slate-900/60`} />
              <span>4+ Logs</span>
            </div>
          </div>

          {/* Core Calendar Days grid */}
          <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-2xl relative">
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1.5 mb-2.5">
              {daysOfWeek.map(day => (
                <div 
                  key={day} 
                  className="text-center text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                if (day.isEmpty || !day.dateStr) {
                  return (
                    <div 
                      key={`empty-${idx}`} 
                      className="aspect-square bg-transparent rounded-lg" 
                    />
                  );
                }

                const dayLogs = logsByDate[day.dateStr] || [];
                const logCount = dayLogs.length;
                const { bgClass } = getIntensityInfo(logCount);
                const isSelected = selectedDateStr === day.dateStr;
                
                // Check if it's today
                const isTodayStr = today.toISOString().split("T")[0];
                const isToday = day.dateStr === isTodayStr;

                // Dynamic selected glow matching the theme
                let activeRingClass = "ring-2 ring-indigo-500 scale-105 z-10 shadow-[0_0_15px_rgba(99,102,241,0.5)]";
                if (activeTheme === "emerald") activeRingClass = "ring-2 ring-emerald-500 scale-105 z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
                if (activeTheme === "amber") activeRingClass = "ring-2 ring-amber-500 scale-105 z-10 shadow-[0_0_15px_rgba(245,158,11,0.5)]";
                if (activeTheme === "rose") activeRingClass = "ring-2 ring-rose-500 scale-105 z-10 shadow-[0_0_15px_rgba(244,63,94,0.5)]";
                if (activeTheme === "cyan") activeRingClass = "ring-2 ring-cyan-500 scale-105 z-10 shadow-[0_0_15px_rgba(6,182,212,0.5)]";
                if (activeTheme === "rainbow") activeRingClass = "ring-2 ring-purple-500 scale-105 z-10 shadow-[0_0_15px_rgba(168,85,247,0.5)]";

                // Unique highlighted ring outline for Today
                let todayStyle = "";
                if (isToday) {
                  if (activeTheme === "indigo") todayStyle = "ring-1.5 ring-indigo-400 bg-indigo-500/10 font-bold";
                  else if (activeTheme === "emerald") todayStyle = "ring-1.5 ring-emerald-400 bg-emerald-500/10 font-bold";
                  else if (activeTheme === "amber") todayStyle = "ring-1.5 ring-amber-400 bg-amber-500/10 font-bold";
                  else if (activeTheme === "rose") todayStyle = "ring-1.5 ring-rose-400 bg-rose-500/10 font-bold";
                  else if (activeTheme === "cyan") todayStyle = "ring-1.5 ring-cyan-400 bg-cyan-500/10 font-bold";
                  else todayStyle = "ring-1.5 ring-purple-400 bg-purple-500/10 font-bold";
                }

                return (
                  <motion.button
                    key={day.dateStr}
                    onClick={() => setSelectedDateStr(day.dateStr)}
                    className={`aspect-square rounded-2xl p-1.5 flex flex-col justify-between transition-all relative cursor-pointer outline-none ${bgClass} ${
                      isSelected ? activeRingClass : todayStyle
                    }`}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <div className="flex justify-between items-center w-full">
                      {/* Day Number */}
                      <span className={`text-[11px] font-mono font-black transition-all ${
                        isSelected 
                          ? "text-white scale-110" 
                          : isToday 
                            ? "text-white" 
                            : "text-slate-300"
                      }`}>
                        {day.dayNumber}
                      </span>
                      
                      {/* Pulsing state if Today */}
                      {isToday && (
                        <span className="absolute top-1.5 right-1.5 flex h-1 w-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1 w-1 bg-sky-505"></span>
                        </span>
                      )}
                    </div>

                    {/* Category color indicator pills at the bottom */}
                    {logCount > 0 && (
                      <div className="flex items-center gap-1 self-start mt-1.5 max-w-full overflow-hidden flex-wrap">
                        {Array.from(new Set(dayLogs.map(l => l.category))).map((cat) => {
                          const typedCat = cat as "dsa" | "web_dev" | "core_cse" | "lab_practical";
                          let dotColor = "bg-indigo-400 text-indigo-500";
                          if (typedCat === "web_dev") dotColor = "bg-blue-400 text-blue-500";
                          if (typedCat === "dsa") dotColor = "bg-amber-400 text-amber-500";
                          if (typedCat === "core_cse") dotColor = "bg-purple-400 text-purple-500";
                          if (typedCat === "lab_practical") dotColor = "bg-emerald-400 text-emerald-500";
                          return (
                            <span 
                              key={typedCat} 
                              className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} 
                              style={{ boxShadow: "0 0 6px currentColor" }}
                              title={`Studied: ${typedCat.replace("_", " ")}`}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Compact count text */}
                    {logCount > 0 && (
                      <span className="text-[8.5px] font-mono font-black leading-none self-end scale-90 text-white opacity-95">
                        {logCount}x
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Stats Logs Drawer Column */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/25 border border-slate-900 rounded-2xl p-4.5 min-h-[300px] relative">
          <div className="space-y-4">
            
            {/* Context title */}
            <div className="border-b border-slate-900/80 pb-2.5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-350">
                {selectedDateStr ? (
                  new Date(selectedDateStr).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })
                ) : (
                  "Selected Study Details"
                )}
              </span>

              <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-lg border ${
                getIntensityInfo(selectedDayLogs.length).badgeColor
              }`}>
                {selectedDayLogs.length} Completed Logs
              </span>
            </div>

            {/* Content info wrapper */}
            {selectedDayLogs.length === 0 ? (
              <div className="py-14 text-center space-y-2.5">
                <p className="text-xs text-slate-500 font-mono italic">
                  No completed study logs recorded on this calendar block yet.
                </p>
                <p className="text-[10px] text-slate-600 max-w-[210px] mx-auto leading-relaxed">
                  Log a study session or complete your Pomodoro matrix sprints to write records automatically!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {selectedDayLogs.map((log) => {
                  let catColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/10";
                  if (log.category === "web_dev") catColor = "text-blue-400 bg-blue-500/10 border-blue-500/10";
                  if (log.category === "core_cse") catColor = "text-purple-400 bg-purple-500/10 border-purple-500/10";
                  if (log.category === "lab_practical") catColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/10";

                  return (
                    <div 
                      key={log.id} 
                      className="border border-slate-900 hover:border-slate-800 bg-slate-950/45 p-3 rounded-xl space-y-1.5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <h4 className="text-[11.5px] font-bold text-slate-200 leading-normal line-clamp-1">{log.title}</h4>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border capitalize shrink-0 ${catColor}`}>
                          {log.category.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3 text-slate-655" />
                        <span>{log.duration} mins logged study</span>
                      </div>

                      {log.notes && (
                        <p className="text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-900/60 leading-relaxed line-clamp-2">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick info status footer */}
          <div className="border-t border-slate-900/80 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-550">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Theme: {themeLabels[activeTheme]}</span>
            </span>
            <span>Total records: {logs.length} logs</span>
          </div>

        </div>

      </div>

    </div>
  );
}
