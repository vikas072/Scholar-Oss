import React, { useMemo } from "react";
import { 
  Trophy, 
  Flame, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle2, 
  Award, 
  ChevronRight,
  TrendingUp,
  Activity,
  HeartCrack
} from "lucide-react";
import { motion } from "motion/react";
import { StudyLog, DsaProblem, DailyGoal } from "../types";

interface DailyProgressBarWidgetProps {
  logs: StudyLog[];
  problems: DsaProblem[];
  goal: DailyGoal;
}

export default function DailyProgressBarWidget({ logs, problems, goal }: DailyProgressBarWidgetProps) {
  // Get active local date key
  const todayStr = useMemo(() => {
    // Return relative 2026-06-18 context 
    return "2026-06-18";
  }, []);

  // Compute logs completed today
  const minsToday = useMemo(() => {
    const logsToday = logs.filter(log => log.date === todayStr);
    return logsToday.reduce((sum, log) => sum + log.duration, 0);
  }, [logs, todayStr]);

  // Compute dsa solved today
  const dsaToday = useMemo(() => {
    return problems.filter(p => p.dateSolved === todayStr).length;
  }, [problems, todayStr]);

  // Targets
  const targetMins = Math.max(goal.studyMinutesTarget, 1);
  const targetDsa = Math.max(goal.dsaProblemsTarget, 1);

  // Percentages capped at 120% visually, but actual can be higher
  const minsPercent = Math.round((minsToday / targetMins) * 100);
  const dsaPercent = Math.round((dsaToday / targetDsa) * 100);

  // Overall aggregate completion score
  const overallScore = Math.min(Math.round((minsPercent + dsaPercent) / 2), 100);

  // Determine encouragement vibe title & details
  const progressVibe = useMemo(() => {
    if (overallScore === 0) {
      return {
        title: "Day is fresh! Let's get started",
        color: "text-slate-400 border-slate-800 bg-slate-950/20",
        barColor: "bg-slate-700",
        percentageColor: "text-slate-500",
        quote: "Every master programmer once struggled with print statements. Pick a task below to warm up!",
        icon: Target
      };
    } else if (overallScore < 30) {
      return {
        title: "Activating Core Study Rhythm",
        color: "text-rose-400 border-rose-500/10 bg-rose-500/5",
        barColor: "bg-rose-500",
        percentageColor: "text-rose-450",
        quote: "Solid start! You have taken the hardest step: beginning. Keep typing!",
        icon: Flame
      };
    } else if (overallScore < 70) {
      return {
        title: "Dynamic Flow Mode Achieved!",
        color: "text-amber-400 border-amber-500/10 bg-amber-500/5",
        barColor: "bg-amber-500",
        percentageColor: "text-amber-400",
        quote: "You are halfway to your daily goal set! Focus on your active dsa tracker or web dev loops next.",
        icon: Zap
      };
    } else if (overallScore < 100) {
      return {
        title: "Striking Distance From Target!",
        color: "text-indigo-400 border-indigo-500/10 bg-indigo-505/5",
        barColor: "bg-indigo-500",
        percentageColor: "text-indigo-400",
        quote: "Just a tiny bit more effort and you will top off your active study meters!",
        icon: TrendingUp
      };
    } else {
      return {
        title: "Milestone Smashed! Supercoder!",
        color: "text-emerald-400 border-emerald-500/15 bg-emerald-500/5",
        barColor: "bg-emerald-500",
        percentageColor: "text-emerald-400",
        quote: "Outstanding! All daily academy targets have been fulfilled. You are building top-tier consistency.",
        icon: Trophy
      };
    }
  }, [overallScore]);

  const CurrentVibeIcon = progressVibe.icon;

  // Radian stroke dimensions
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetMins = circumference - (Math.min(minsPercent, 100) / 100) * circumference;
  const strokeDashoffsetDsa = circumference - (Math.min(dsaPercent, 100) / 100) * circumference;

  return (
    <div id="daily-vibe-progress-visualizer" className="backdrop-blur-md bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
      {/* Accent light beams */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-500/5 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-sky-505/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Grid Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-880 pb-4.5 mb-5 relative z-10 text-left">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <Activity className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-all" />
            Daily Goal Progress Visualizer
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time analytical comparison of your current logged items versus study targets</p>
        </div>

        {/* Aggregate badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-[10px] uppercase tracking-wider ${progressVibe.color}`}>
          <CurrentVibeIcon className="w-3.5 h-3.5" />
          {progressVibe.title}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Dynamic Aggregate Score Wheel */}
        <div className="md:col-span-3 flex flex-col items-center justify-center bg-slate-950/40 border border-slate-850 p-5 rounded-2xl relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer gauge track */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-slate-900"
                strokeWidth="7.5"
                fill="transparent"
              />
              <motion.circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-indigo-500"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 46) - (overallScore / 100) * (2 * Math.PI * 46) }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner text metric */}
            <div className="text-center space-y-0.5 z-10">
              <span className="text-2xl font-mono font-extrabold text-white block">
                {overallScore}%
              </span>
              <span className="text-[8.5px] font-mono font-bold text-slate-500 block uppercase tracking-wider">
                COMPLETED
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-indigo-300 mt-3 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Cumulative score
          </span>
        </div>

        {/* Detailed Metrics comparisons */}
        <div className="md:col-span-5 space-y-4 text-left">
          {/* Study Minutes Progress */}
          <div className="bg-slate-950/30 p-3.5 border border-slate-850 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Focus Time metric
              </span>
              <span className="text-[11.5px] font-mono font-extrabold text-sky-300">
                {minsToday} / {targetMins} mins
              </span>
            </div>

            {/* Horizontal progress meter with animated fill */}
            <div className="space-y-1">
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden relative border border-slate-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(minsPercent, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 ${
                    minsPercent >= 100 ? "shadow-[0_0_8px_rgba(58,191,248,0.3)]" : ""
                  }`}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-550">
                <span>0%</span>
                <span className={minsPercent >= 100 ? "text-emerald-400 font-bold" : ""}>
                  {minsPercent}% {minsPercent >= 100 ? "Goal met!" : "Completed"}
                </span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* DSA Solved Problems Progress */}
          <div className="bg-slate-950/30 p-3.5 border border-slate-850 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" /> Solution Solves
              </span>
              <span className="text-[11.5px] font-mono font-extrabold text-indigo-300">
                {dsaToday} / {targetDsa} problems
              </span>
            </div>

            {/* Horizontal progress meter with animated fill */}
            <div className="space-y-1">
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden relative border border-slate-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(dsaPercent, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.15 }}
                  className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 ${
                    dsaPercent >= 100 ? "shadow-[0_0_8px_rgba(99,102,241,0.3)]" : ""
                  }`}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-550">
                <span>0%</span>
                <span className={dsaPercent >= 100 ? "text-emerald-400 font-bold" : ""}>
                  {dsaPercent}% {dsaPercent >= 100 ? "Target hit!" : "Completed"}
                </span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Sidebar Advisory Panel */}
        <div className="md:col-span-4 flex flex-col justify-between h-full bg-gradient-to-b from-slate-950/50 to-slate-950/70 p-4.5 border border-slate-850 rounded-2xl text-left space-y-2.5">
          <div className="space-y-1">
            <span className="text-[9.5px] font-mono font-extrabold text-slate-500 uppercase tracking-wider block">
              💡 Smart Study Advisor:
            </span>
            <p className="text-[11px] text-slate-450 leading-relaxed font-sans italic">
              "{progressVibe.quote}"
            </p>
          </div>

          <div className="border-t border-slate-900/60 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Streak health:</span>
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              🔥 Consistent logs logs logs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
