import React, { useState, useMemo } from "react";
import { StudyLog, DailyGoal } from "../types";
import { 
  Clock, 
  Calendar, 
  BarChart2, 
  Trophy, 
  TrendingUp, 
  Flame, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";

interface EverydayStudyHoursProps {
  logs: StudyLog[];
  goal: DailyGoal;
}

export default function EverydayStudyHours({ logs, goal }: EverydayStudyHoursProps) {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);
  const [chartType, setChartType] = useState<"area" | "bar">("bar");
  const [showZeroDays, setShowZeroDays] = useState<boolean>(true);

  // Parse local dates formatted with weekday labels
  const studyDaysData = useMemo(() => {
    const data = [];
    const today = new Date();

    // Map of weekdays
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${monthStr}-${dayStr}`;

      // Retrieve study logs for this specific date
      const dayLogs = logs.filter(log => log.date === formattedDate);
      
      const dsaMins = dayLogs.filter(log => log.category === 'dsa').reduce((sum, l) => sum + l.duration, 0);
      const webMins = dayLogs.filter(log => log.category === 'web_dev').reduce((sum, l) => sum + l.duration, 0);
      const coreMins = dayLogs.filter(log => log.category === 'core_cse').reduce((sum, l) => sum + l.duration, 0);
      const labMins = dayLogs.filter(log => log.category === 'lab_practical').reduce((sum, l) => sum + l.duration, 0);
      
      const totalMins = dsaMins + webMins + coreMins + labMins;
      const totalHours = Number((totalMins / 60).toFixed(2));
      
      const dsaHrs = Number((dsaMins / 60).toFixed(2));
      const webHrs = Number((webMins / 60).toFixed(2));
      const coreHrs = Number((coreMins / 60).toFixed(2));
      const labHrs = Number((labMins / 60).toFixed(2));

      const displayLabel = `${weekdays[d.getDay()]} ${d.getDate()}`;

      data.push({
        date: formattedDate,
        dateLabel: displayLabel,
        fullDateLabel: `${weekdays[d.getDay()]} (${d.getDate()} ${months[d.getMonth()]})`,
        dsa: dsaHrs,
        web_dev: webHrs,
        core_cse: coreHrs,
        lab_practical: labHrs,
        total: totalHours,
        totalMinutes: totalMins,
        goalReached: totalMins >= goal.studyMinutesTarget,
        logCount: dayLogs.length
      });
    }

    return showZeroDays ? data : data.filter(d => d.totalMinutes > 0);
  }, [logs, rangeDays, goal.studyMinutesTarget, showZeroDays]);

  // General summary analytics derived from selection
  const analytics = useMemo(() => {
    let totalMinutesSum = 0;
    let daysWithStudy = 0;
    let daysGoalAchieved = 0;
    let peakDay = { date: "No data", hours: 0 };
    const activeData = studyDaysData;

    activeData.forEach((day) => {
      totalMinutesSum += day.totalMinutes;
      if (day.totalMinutes > 0) {
        daysWithStudy++;
      }
      if (day.totalMinutes >= goal.studyMinutesTarget) {
        daysGoalAchieved++;
      }
      if (day.total > peakDay.hours) {
        peakDay = { date: day.fullDateLabel, hours: day.total };
      }
    });

    const totalHoursStudied = Number((totalMinutesSum / 60).toFixed(1));
    const averageDailyHrs = activeData.length > 0 
      ? Number((totalHoursStudied / activeData.length).toFixed(1)) 
      : 0;

    const consistencyPercent = activeData.length > 0 
      ? Math.round((daysWithStudy / activeData.length) * 100) 
      : 0;

    return {
      totalHours: totalHoursStudied,
      averageHours: averageDailyHrs,
      peakDay,
      consistencyPercent,
      daysGoalAchieved,
      daysInPeriod: activeData.length
    };
  }, [studyDaysData, goal.studyMinutesTarget]);

  return (
    <div id="everyday-study-hour-chart-panel" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
      {/* Visual background lights */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Panel header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6 relative z-10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <BarChart2 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            Daily Study Clock Records
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Track exact hours spent studying and logging course metrics everyday</p>
        </div>

        {/* Action picker configurations */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Day timeframe selection */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRangeDays(days)}
                className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all select-none cursor-pointer ${
                  rangeDays === days
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {days}D
              </button>
            ))}
          </div>

          {/* Type of chart configuration */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === "bar" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" : "text-slate-500 hover:text-slate-400"
              }`}
              title="Show Bar Chart breakdown"
            >
              Bars
            </button>
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === "area" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" : "text-slate-500 hover:text-slate-400"
              }`}
              title="Show Area Chart outline"
            >
              Area
            </button>
          </div>
        </div>
      </div>

      {/* Grid summarizing core metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Total hours */}
        <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl relative overflow-hidden group/m">
          <div className="absolute top-2 right-2 opacity-5 text-indigo-500 transition-transform group-hover/m:scale-110">
            <Clock className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block font-mono">Period Study</span>
          <span className="text-xl font-extrabold text-indigo-300 block mt-1 font-mono">{analytics.totalHours} hr</span>
          <span className="text-[9px] text-slate-500 block mt-0.5 mt-auto">Over last {analytics.daysInPeriod} days</span>
        </div>

        {/* Daily average */}
        <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl relative overflow-hidden group/m">
          <div className="absolute top-2 right-2 opacity-5 text-blue-500 transition-transform group-hover/m:scale-110">
            <TrendingUp className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block font-mono">Daily Average</span>
          <span className="text-xl font-extrabold text-blue-400 block mt-1 font-mono">{analytics.averageHours} hr</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Average focus time</span>
        </div>

        {/* Peak day */}
        <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl relative overflow-hidden group/m">
          <div className="absolute top-2 right-2 opacity-5 text-amber-500 transition-transform group-hover/m:scale-110">
            <Trophy className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block font-mono">Peak Day</span>
          <span className="text-sm font-extrabold text-amber-400 block mt-1.5 truncate leading-tight">
            {analytics.peakDay.hours > 0 ? `${analytics.peakDay.hours} hrs` : "No data"}
          </span>
          <span className="text-[9px] text-slate-500 block truncate mt-0.5">{analytics.peakDay.date}</span>
        </div>

        {/* Consistency streak percentage */}
        <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl relative overflow-hidden group/m">
          <div className="absolute top-2 right-2 opacity-5 text-emerald-500 transition-transform group-hover/m:scale-110">
            <Flame className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block font-mono">Consistency</span>
          <span className="text-xl font-extrabold text-emerald-400 block mt-1 font-mono">{analytics.consistencyPercent}%</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{analytics.daysGoalAchieved} days hit target</span>
        </div>
      </div>

      {/* Main Study Hour visualization canvas */}
      <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl relative h-[250px] mb-4">
        {studyDaysData.length === 0 || analytics.totalHours === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-600 stroke-1" />
            <h5 className="text-xs font-bold text-slate-400">No daily data available for this range</h5>
            <p className="text-[10px] text-slate-600 max-w-xs">Start logging your study sessions in the main logs form to see live everyday hour charts populate here!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={studyDaysData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotalHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#475569" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 9 } }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl shadow-xl text-[10.5px] font-mono text-slate-300">
                          <p className="font-bold text-white mb-1 border-b border-slate-800 pb-1">{data.fullDateLabel}</p>
                          <div className="space-y-0.5">
                            <p className="flex justify-between gap-4 text-indigo-400">
                              <span>Total Study:</span> <strong>{data.total} hrs</strong>
                            </p>
                            <p className="flex justify-between gap-4 text-slate-500">
                              <span>Log Items:</span> <span>{data.logCount} items</span>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span>Goal Status:</span> 
                              <span className={data.goalReached ? "text-emerald-400 font-bold" : "text-rose-400"}>
                                {data.goalReached ? "✓ MET" : "✕ SHORT"}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTotalHours)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={studyDaysData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#475569" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 9 } }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl shadow-xl text-[10.5px] font-mono text-slate-300">
                          <p className="font-bold text-white mb-1 border-b border-slate-800 pb-1">{data.fullDateLabel}</p>
                          <div className="space-y-0.5">
                            <p className="flex justify-between gap-4 text-white">
                              <span>DSA:</span> <span>{data.dsa} hrs</span>
                            </p>
                            <p className="flex justify-between gap-4 text-blue-400">
                              <span>Web Dev:</span> <span>{data.web_dev} hrs</span>
                            </p>
                            <p className="flex justify-between gap-4 text-amber-400">
                              <span>Academics:</span> <span>{data.core_cse} hrs</span>
                            </p>
                            <p className="flex justify-between gap-4 text-emerald-400">
                              <span>Practical Labs:</span> <span>{data.lab_practical} hrs</span>
                            </p>
                            <div className="border-t border-slate-800/80 my-1 pt-1 flex justify-between gap-4 text-indigo-300 font-bold">
                              <span>Total Study:</span> <span>{data.total} hrs</span>
                            </div>
                            <p className="flex justify-between gap-4">
                              <span>Goal Status:</span> 
                              <span className={data.goalReached ? "text-emerald-400 font-bold" : "text-slate-500"}>
                                {data.goalReached ? "✓ Met Target" : `✕ Under (${data.totalMinutes}/${goal.studyMinutesTarget}m)`}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Stacked bar segments to show granular category breakdown */}
                <Bar dataKey="dsa" stackId="study" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="web_dev" stackId="study" fill="#38bdf8" radius={[0, 0, 0, 0]} />
                <Bar dataKey="core_cse" stackId="study" fill="#fbbf24" radius={[0, 0, 0, 0]} />
                <Bar dataKey="lab_practical" stackId="study" fill="#34d399" radius={[2, 2, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend & Details Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] border-t border-indigo-500/5 pt-3">
        <div className="flex gap-3 items-center">
          <span className="text-slate-500 uppercase tracking-wider font-bold">Legend:</span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" /> DSA
          </span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" /> Web Dev
          </span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" /> Academics
          </span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" /> Lab Practicals
          </span>
        </div>

        {/* Show missing/zero days toggle check */}
        <button
          type="button"
          onClick={() => setShowZeroDays(!showZeroDays)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all select-none cursor-pointer ${
            showZeroDays
              ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
              : 'bg-slate-950/50 border-slate-850 text-slate-500 hover:text-slate-400'
          }`}
        >
          <span>Con consecutive view: {showZeroDays ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Accordion detail list of daily study sessions records */}
      <div className="mt-4 bg-slate-950/30 border border-slate-850 rounded-2xl p-3 max-h-48 overflow-y-auto custom-scroll-area">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1 font-mono">Consecutive Days Study Breakdown:</span>
        <div className="space-y-1">
          {studyDaysData.map((day) => {
            return (
              <div 
                key={day.date} 
                className={`flex justify-between items-center px-2.5 py-1.5 rounded-lg text-xs leading-none transition-all ${
                  day.totalMinutes > 0 
                    ? 'bg-slate-900/60 hover:bg-slate-900 border border-slate-850 text-slate-300' 
                    : 'bg-slate-950/20 text-slate-600 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  {day.totalMinutes > 0 ? (
                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${day.goalReached ? 'text-emerald-400 fill-emerald-400/10' : 'text-indigo-400/80'}`} />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-800 shrink-0 flex items-center justify-center text-[8px] font-bold text-slate-700">0</span>
                  )}
                  <span className="font-semibold">{day.fullDateLabel}</span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  {day.totalMinutes > 0 ? (
                    <>
                      <span className="text-[11px] font-bold text-white">{day.total} hrs</span>
                      <span className="text-[9px] text-slate-500">({day.totalMinutes} mins)</span>
                      {day.goalReached && (
                        <span className="text-[8px] font-extrabold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Met</span>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-600 italic">No study logged</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
