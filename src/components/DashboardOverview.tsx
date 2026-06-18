import { useState, FormEvent, useMemo, useEffect } from "react";
import { StudyLog, UserStats, DailyGoal, DsaProblem, WebDevLog, Project } from "../types";
import { BookOpen, Code2, Plus, Play, Clock, Flame, CheckCircle, HelpCircle, Edit3, Target, Calendar, X, Sparkles, Brain, CheckSquare, ArrowRight, ShieldCheck, Quote, RefreshCw, Heart, History, Globe, Terminal, Wrench, Compass, Construction, Hammer } from "lucide-react";
import { motion } from "motion/react";
import PomodoroTimer from "./PomodoroTimer";
import GoogleSearchBar from "./GoogleSearchBar";
import BTechAcademicDesk from "./BTechAcademicDesk";
import EverydayStudyHours from "./EverydayStudyHours";
import DeadlinesCountdown from "./DeadlinesCountdown";
import DailyProgressBarWidget from "./DailyProgressBarWidget";
import FloatingTooltip from "./CustomTooltip";
import StudyIntensityCalendar from "./StudyIntensityCalendar";
import MotivationalQuoteWidget from "./MotivationalQuoteWidget";
import DailyActiveStudyTimer from "./DailyActiveStudyTimer";
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
  PieChart,
  Pie,
  Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isHours = payload.some((item: any) => 
      item.name.toLowerCase().includes("hour") || 
      item.name.toLowerCase().includes("hr")
    );
    const unit = isHours ? "hrs" : "mins";
    
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs shadow-xl font-mono text-slate-300">
        <p className="font-bold text-white mb-1">{label}</p>
        {payload.map((item: any, idx: number) => {
          const val = typeof item.value === 'number' 
            ? (isHours ? item.value.toFixed(2) : item.value) 
            : item.value;
          return (
            <p key={idx} style={{ color: item.color }} className="flex justify-between gap-4 py-0.5">
              <span>{item.name}:</span>
              <span className="font-bold">{val} {unit}</span>
            </p>
          );
        })}
        <div className="border-t border-slate-800/80 mt-1.5 pt-1 flex justify-between gap-4 font-bold text-slate-400">
          <span>Total:</span>
          <span>
            {payload.reduce((acc: number, item: any) => acc + (Number(item.value) || 0), 0).toFixed(isHours ? 2 : 0)} {unit}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const STUDY_QUOTES = [
  {
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    tag: "Axiom of Knowledge"
  },
  {
    quote: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    tag: "Problem Solving"
  },
  {
    quote: "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
    tag: "C Creator Philosophy"
  },
  {
    quote: "It's not that I'm so smart, it's just that I stay with problems longer.",
    author: "Albert Einstein",
    tag: "Tenacity"
  },
  {
    quote: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    tag: "Linux Axiom"
  },
  {
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    tag: "Consistency"
  },
  {
    quote: "Computer science is no more about computers than astronomy is about telescopes.",
    author: "Edsger W. Dijkstra",
    tag: "Core Foundations"
  },
  {
    quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    tag: "Refactoring"
  },
  {
    quote: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
    tag: "Beginner Mindset"
  },
  {
    quote: "Consistency beats intensity every single time. 10 minutes a day is better than 5 hours on Sunday.",
    author: "Software Rule",
    tag: "Study Rhythm"
  },
  {
    quote: "Perseverance is not a long race; it is many short races one after the other.",
    author: "Walter Elliot",
    tag: "Endurance"
  },
  {
    quote: "Every elegant line of code begins with a messy draft and a stubborn mind.",
    author: "Syllabus Wisdom",
    tag: "Practice"
  },
  {
    quote: "Algorithms are nothing but ideas made crisp. Keep refining, keep debugging.",
    author: "Sanjay Classes Philosophy",
    tag: "Mastery"
  },
  {
    quote: "Your mind is for having ideas, not holding them. Put your concepts into code.",
    author: "David Allen",
    tag: "Academic Focus"
  },
  {
    quote: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
    tag: "Software Design"
  }
];

const formatRecentActivityDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
  } catch (e) {
    return dateStr;
  }
};

interface DashboardOverviewProps {
  logs: StudyLog[];
  stats: UserStats;
  goal: DailyGoal;
  updateGoal: (g: DailyGoal) => void;
  onAddLog: (category: 'dsa' | 'web_dev' | 'core_cse' | 'lab_practical', title: string, duration: number, notes: string, date?: string) => void;
  onDeleteLog: (id: string, category: 'dsa' | 'web_dev' | 'core_cse' | 'lab_practical') => void;
  problems?: DsaProblem[];
  webDevLogs?: WebDevLog[];
  projects?: Project[];
  onAddProject?: (name: string, description: string, completion: number) => void;
  onUpdateProject?: (id: string, name: string, description: string, completion: number) => void;
  onDeleteProject?: (id: string) => void;
}

export default function DashboardOverview({
  logs,
  stats,
  goal,
  updateGoal,
  onAddLog,
  onDeleteLog,
  problems = [],
  webDevLogs = [],
  projects = [],
  onAddProject,
  onUpdateProject,
  onDeleteProject
}: DashboardOverviewProps) {
  // Local form states
  const [category, setCategory] = useState<'dsa' | 'web_dev' | 'core_cse' | 'lab_practical'>('dsa');

  // Local project form states
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projCompletion, setProjCompletion] = useState(0);

  const handleProjectSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    if (editingProjectId) {
      if (onUpdateProject) {
        onUpdateProject(editingProjectId, projName, projDesc, projCompletion);
      }
    } else {
      if (onAddProject) {
        onAddProject(projName, projDesc, projCompletion);
      }
    }

    // Reset
    setProjName("");
    setProjDesc("");
    setProjCompletion(0);
    setIsAddingProject(false);
    setEditingProjectId(null);
  };

  const handleEditProjectClick = (proj: Project) => {
    setEditingProjectId(proj.id);
    setProjName(proj.name);
    setProjDesc(proj.description || "");
    setProjCompletion(proj.completion);
    setIsAddingProject(true);
  };

  const handleCancelProjectEdit = () => {
    setProjName("");
    setProjDesc("");
    setProjCompletion(0);
    setIsAddingProject(false);
    setEditingProjectId(null);
  };

  // 12-Hour Study Quotes rotating engine
  const [quoteOffset, setQuoteOffset] = useState<number>(() => {
    const saved = localStorage.getItem("workspace_quote_offset");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [favoriteQuotes, setFavoriteQuotes] = useState<Set<number>>(() => {
    const saved = localStorage.getItem("workspace_favorite_quotes");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [timeUntilNextRotation, setTimeUntilNextRotation] = useState("");

  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

  // Calculate deterministic index
  const getDeterministicIndex = () => {
    const now = Date.now();
    const blockIndex = Math.floor(now / TWELVE_HOURS_MS);
    return (blockIndex + quoteOffset) % STUDY_QUOTES.length;
  };

  const currentQuoteIndex = getDeterministicIndex();
  const currentQuote = STUDY_QUOTES[currentQuoteIndex];

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const currentBlockIndex = Math.floor(now / TWELVE_HOURS_MS);
      const nextBlockTime = (currentBlockIndex + 1) * TWELVE_HOURS_MS;
      const msRemaining = nextBlockTime - now;

      if (msRemaining <= 0) return;

      const hrs = Math.floor(msRemaining / (1000 * 60 * 60));
      const mins = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((msRemaining % (1000 * 60)) / 1000);

      setTimeUntilNextRotation(
        `${hrs.toString().padStart(2, "0")}h ${mins
          .toString()
          .padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
      );
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [quoteOffset]);

  const handleNextQuoteManual = () => {
    const nextOffset = quoteOffset + 1;
    setQuoteOffset(nextOffset);
    localStorage.setItem("workspace_quote_offset", nextOffset.toString());
  };

  const handleToggleFavoriteQuote = () => {
    setFavoriteQuotes(prev => {
      const next = new Set(prev);
      if (next.has(currentQuoteIndex)) {
        next.delete(currentQuoteIndex);
      } else {
        next.add(currentQuoteIndex);
      }
      localStorage.setItem("workspace_favorite_quotes", JSON.stringify(Array.from(next)));
      return next;
    });
  };
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number>(45);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSuccess, setFormSuccess] = useState(false);

  // Goal config toggle
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalProblems, setTempGoalProblems] = useState(goal.dsaProblemsTarget);
  const [tempGoalMinutes, setTempGoalMinutes] = useState(goal.studyMinutesTarget);

  const openGoalEditor = () => {
    setTempGoalProblems(goal.dsaProblemsTarget);
    setTempGoalMinutes(goal.studyMinutesTarget);
    setIsEditingGoal(true);
  };

  // AI Daily Study Insights States
  const [insightDate, setInsightDate] = useState(new Date().toISOString().split('T')[0]);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [studyInsight, setStudyInsight] = useState<{
    summary: string;
    achievements: string[];
    feedback: string;
    nextSteps: string[];
  } | null>(() => {
    const cached = localStorage.getItem("workspace_cached_insight");
    return cached ? JSON.parse(cached) : null;
  });

  const handleGenerateInsight = async () => {
    setInsightLoading(true);
    setInsightError("");
    setStudyInsight(null);

    const filteredLogsDate = logs.filter(l => l.date === insightDate);
    const filteredProblemsDate = problems.filter(p => p.dateSolved === insightDate);
    const filteredWebDevDate = webDevLogs.filter(wl => wl.dateLogged === insightDate);

    try {
      const response = await fetch("/api/gemini/study-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyLogs: filteredLogsDate,
          dsaProblems: filteredProblemsDate,
          webDevLogs: filteredWebDevDate,
          date: insightDate
        })
      });

      if (!response.ok) {
        throw new Error("Advisory insight synthesized empty or failed. Please retry.");
      }

      const data = await response.json();
      setStudyInsight(data);
      localStorage.setItem("workspace_cached_insight", JSON.stringify(data));
    } catch (err: any) {
      setInsightError(err.message || "Failed to generate AI study insights.");
    } finally {
      setInsightLoading(false);
    }
  };

  // GitHub contribution grid data builder
  const contributionDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sun, 6 is Sat
    const numWeeks = 16;
    const totalDays = numWeeks * 7 + dayOfWeek + 1;
    const days = [];
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayLogs = logs.filter(log => log.date === dateStr);
      const dsaMinutes = dayLogs.filter(log => log.category === 'dsa').reduce((sum, l) => sum + l.duration, 0);
      const webMinutes = dayLogs.filter(log => log.category === 'web_dev').reduce((sum, l) => sum + l.duration, 0);
      const totalMinutes = dsaMinutes + webMinutes;
      
      days.push({
        dateStr,
        date: d,
        dayOfWeek: d.getDay(),
        totalMinutes,
        dsaMinutes,
        webMinutes
      });
    }
    return days;
  }, [logs]);

  const [hoveredContributionDay, setHoveredContributionDay] = useState<any>(null);

  // Today calculations
  const todayStr = new Date().toISOString().split('T')[0];

  // Time category breakdown state and calculations
  const [breakdownTimeframe, setBreakdownTimeframe] = useState<'all' | 'weekly' | 'today'>('all');

  const categoryBreakdownData = useMemo(() => {
    let filteredLogs = [...logs];
    
    if (breakdownTimeframe === 'weekly') {
      const last7Days: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        last7Days.push(`${year}-${month}-${day}`);
      }
      filteredLogs = logs.filter(log => last7Days.includes(log.date));
    } else if (breakdownTimeframe === 'today') {
      filteredLogs = logs.filter(log => log.date === todayStr);
    }
    
    const dsaMins = filteredLogs.filter(log => log.category === 'dsa').reduce((sum, l) => sum + l.duration, 0);
    const webDevMins = filteredLogs.filter(log => log.category === 'web_dev').reduce((sum, l) => sum + l.duration, 0);
    const coreCseMins = filteredLogs.filter(log => log.category === 'core_cse').reduce((sum, l) => sum + l.duration, 0);
    const labMins = filteredLogs.filter(log => log.category === 'lab_practical').reduce((sum, l) => sum + l.duration, 0);
    const total = dsaMins + webDevMins + coreCseMins + labMins;

    return {
      chartData: [
        { name: 'DSA Training', value: dsaMins, percentage: total > 0 ? Math.round((dsaMins / total) * 100) : 0, color: '#6366f1' },
        { name: 'Web Dev Builds', value: webDevMins, percentage: total > 0 ? Math.round((webDevMins / total) * 100) : 0, color: '#3b82f6' },
        { name: 'CSE Core Theory', value: coreCseMins, percentage: total > 0 ? Math.round((coreCseMins / total) * 100) : 0, color: '#f59e0b' },
        { name: 'Lab Practicals', value: labMins, percentage: total > 0 ? Math.round((labMins / total) * 100) : 0, color: '#10b981' }
      ],
      total,
      dsaMins,
      webDevMins,
      coreCseMins,
      labMins
    };
  }, [logs, breakdownTimeframe, todayStr]);

  const logsToday = logs.filter(log => log.date === todayStr);
  const dsaTodayCount = logsToday.filter(log => log.category === 'dsa').length; // or we can measure active solved problems added today
  const minutesToday = logsToday.reduce((sum, log) => sum + log.duration, 0);

  const durationPercentage = Math.min(Math.round((minutesToday / goal.studyMinutesTarget) * 100), 100);
  const problemsTodayCount = problems.filter(p => p.dateSolved === todayStr).length;
  const dsaProgressPercentage = Math.min(Math.round((problemsTodayCount / Math.max(goal.dsaProblemsTarget, 1)) * 100), 100);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddLog(category, title, duration, notes, date);
    setTitle("");
    setNotes("");
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  const saveGoal = () => {
    updateGoal({
      dsaProblemsTarget: tempGoalProblems,
      studyMinutesTarget: tempGoalMinutes
    });
    setIsEditingGoal(false);
  };

  const getLast7DaysData = () => {
    const data = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Use the current local timezone date as today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`; // ISO formatted date matches log.date
      
      const dayLogs = logs.filter(log => log.date === dateStr);
      const dsaMins = dayLogs.filter(log => log.category === 'dsa').reduce((sum, l) => sum + l.duration, 0);
      const webDevMins = dayLogs.filter(log => log.category === 'web_dev').reduce((sum, l) => sum + l.duration, 0);
      
      const dayLabel = daysOfWeek[d.getDay()];
      const dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      data.push({
        dateStr,
        dayLabel: `${dayLabel} ${d.getDate()}`,
        dateLabel,
        "DSA": dsaMins,
        "Web Dev": webDevMins,
        Total: dsaMins + webDevMins
      });
    }
    return data;
  };

  const getWeeklyHoursData = () => {
    return getLast7DaysData().map(day => ({
      ...day,
      "DSA Hours": parseFloat((day["DSA"] / 60).toFixed(2)),
      "Web Dev Hours": parseFloat((day["Web Dev"] / 60).toFixed(2)),
      "Total Hours": parseFloat((day.Total / 60).toFixed(2))
    }));
  };

  const recentActivities = useMemo(() => {
    const activityItems: Array<{
      id: string;
      type: 'study_log' | 'dsa_problem' | 'web_dev_log';
      category: 'dsa' | 'web_dev';
      title: string;
      notes: string;
      meta: string;
      date: string;
      createdAt: number;
      extraInfo?: string;
    }> = [];

    // 1. Filtered StudyLogs
    logs.forEach(log => {
      if (log.category === 'dsa' || log.category === 'web_dev') {
        activityItems.push({
          id: log.id,
          type: 'study_log',
          category: log.category,
          title: log.title,
          notes: log.notes || '',
          meta: `${log.duration} mins session`,
          date: log.date,
          createdAt: log.createdAt || 0
        });
      }
    });

    // 2. DSA Problems
    problems.forEach(prob => {
      activityItems.push({
        id: prob.id,
        type: 'dsa_problem',
        category: 'dsa',
        title: `Solved ${prob.problemName}`,
        notes: prob.notes || '',
        meta: `Platform: ${prob.platform} • Topic: ${prob.topic}`,
        date: prob.dateSolved,
        createdAt: prob.createdAt || 0,
        extraInfo: prob.difficulty.toUpperCase()
      });
    });

    // 3. Web Dev Logs
    webDevLogs.forEach(wl => {
      activityItems.push({
        id: wl.id,
        type: 'web_dev_log',
        category: 'web_dev',
        title: `Built: ${wl.projectTitle}`,
        notes: wl.learnings || '',
        meta: `Skills: ${wl.skillsUsed.join(', ')}`,
        date: wl.dateLogged,
        createdAt: wl.createdAt || 0
      });
    });

    // Sort by createdAt descending
    return activityItems
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [logs, problems, webDevLogs]);

  const streakTooltipContent = useMemo(() => {
    const hasActiveStreak = stats.streak > 0;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          <h4 className="font-bold text-white text-xs uppercase tracking-wide">Daily Momentum</h4>
        </div>
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Current Streak:</span>
            <span className="font-mono font-bold text-white">{stats.streak} Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last Active Date:</span>
            <span className="font-mono font-semibold text-amber-400">
              {stats.lastStudyDate ? formatRecentActivityDate(stats.lastStudyDate) : "None yet"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Logs:</span>
            <span className="font-mono font-bold text-slate-100">{logs.length} sessions</span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 italic">
          {hasActiveStreak 
            ? "Keep the momentum! Daily study habits build outstanding engineering performance." 
            : "Let's begin! Log any DSA problem or study hour to start a new streak."}
        </div>
      </div>
    );
  }, [stats.streak, stats.lastStudyDate, logs.length]);

  const dsaSolvedTooltipContent = useMemo(() => {
    const platformCounts = problems.reduce((acc, p) => {
      const plat = p.platform || 'Other';
      acc[plat] = (acc[plat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          <h4 className="font-bold text-white text-xs uppercase tracking-wide">DSA Problems Breakdown</h4>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-emerald-400">
            <span>🟢 Easy Problems:</span>
            <span className="font-mono font-bold">{stats.easyCount || 0}</span>
          </div>
          <div className="flex justify-between text-amber-400">
            <span>🟡 Medium Problems:</span>
            <span className="font-mono font-bold">{stats.mediumCount || 0}</span>
          </div>
          <div className="flex justify-between text-rose-400">
            <span>🔴 Hard Problems:</span>
            <span className="font-mono font-bold">{stats.hardCount || 0}</span>
          </div>
        </div>

        {Object.keys(platformCounts).length > 0 && (
          <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Platforms Distribution</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 font-mono">
              {Object.entries(platformCounts).map(([platform, count]) => (
                <div key={platform} className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-md truncate" title={platform}>
                  <span className="text-slate-400 font-semibold">{platform}:</span> {count}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [problems, stats.easyCount, stats.mediumCount, stats.hardCount]);

  const webDevTooltipContent = useMemo(() => {
    const totalMins = stats.totalWebDevHours;
    const projectCount = new Set(webDevLogs.map(wl => wl.projectTitle)).size;

    const skillCounts = webDevLogs.reduce((acc, wl) => {
      wl.skillsUsed.forEach(skill => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h4 className="font-bold text-white text-xs uppercase tracking-wide">Web Dev Activity</h4>
        </div>
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Cumulative Time:</span>
            <span className="font-mono font-bold text-white">{totalMins} Mins</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Unique Projects:</span>
            <span className="font-mono font-bold text-emerald-400">{projectCount} Built</span>
          </div>
        </div>

        {topSkills.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60 space-y-2">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Core Technologies</span>
            <div className="flex flex-wrap gap-1">
              {topSkills.map(([skill, count]) => (
                <span key={skill} className="text-[9px] font-bold font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  {skill} <span className="opacity-60 text-[8px]">x{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [stats.totalWebDevHours, webDevLogs]);

  const dsaHrsTooltipContent = useMemo(() => {
    const totalMins = stats.totalDsaHours;

    const topicCounts = problems.reduce((acc, p) => {
      if (p.topic) {
        acc[p.topic] = (acc[p.topic] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h4 className="font-bold text-white text-xs uppercase tracking-wide">DSA Study Metrics</h4>
        </div>
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Session Minutes:</span>
            <span className="font-mono font-bold text-white">{totalMins} Mins</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">DSA Sessions:</span>
            <span className="font-mono font-bold text-indigo-400">
              {logs.filter(l => l.category === 'dsa').length} logged
            </span>
          </div>
        </div>

        {topTopics.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60 space-y-2">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Hot Topics Investigated</span>
            <div className="flex flex-wrap gap-1">
              {topTopics.map(([topic, count]) => (
                <span key={topic} className="text-[9px] font-bold font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                  {topic} <span className="opacity-60 text-[8px]">x{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [stats.totalDsaHours, problems, logs]);

  const getActivityTooltipContent = (activity: any) => {
    const isDsa = activity.category === 'dsa';
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDsa ? 'bg-indigo-400' : 'bg-blue-400'}`} />
            <h4 className="font-bold text-white text-xs uppercase tracking-wide">
              {activity.type === 'dsa_problem' 
                ? 'DSA Solve Log' 
                : activity.type === 'web_dev_log' 
                ? 'Web Build details' 
                : 'Focus Session'}
            </h4>
          </div>
          <span className="text-[9px] font-mono font-semibold text-slate-500">
            {formatRecentActivityDate(activity.date)}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 block uppercase tracking-widest text-[9px] font-bold">Activity Name</span>
            <span className="text-slate-200 font-semibold leading-relaxed block truncate">{activity.title}</span>
          </div>

          <div className="pt-1 flex justify-between gap-4">
            <span className="text-slate-500">Context Specs:</span>
            <span className="font-mono font-bold text-slate-200 text-[11px] truncate" title={activity.meta}>{activity.meta}</span>
          </div>
        </div>

        {activity.notes && (
          <div className="pt-2 border-t border-slate-850 space-y-1">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Personal Logs & Milestones</span>
            <p className="text-[11px] text-slate-400 font-sans leading-normal bg-slate-900/60 p-2 rounded-xl border border-slate-850/80 italic max-h-24 overflow-y-auto">
              "{activity.notes}"
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 2-Column Left: Core Metrics, Streak, and Log forms */}
      <div className="lg:col-span-2 space-y-6">

        {/* Custom Developer Motivational Quote block */}
        <MotivationalQuoteWidget />

        {/* Real-Time Active Study Stopwatch and Custom Timer */}
        <DailyActiveStudyTimer onAddLog={onAddLog} />
        
        {/* Dynamic visual progress bar against configured DailyGoal */}
        <DailyProgressBarWidget logs={logs} problems={problems} goal={goal} />
        
        {/* Banner Section with Quick Progress circles */}
        <div className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Target className="w-48 h-48 text-indigo-500" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Daily Focus Goals</h2>
                <p className="text-slate-400 text-sm mt-1">Keep up your academic momentum! Log your core classes, lab experiments, web builds, and coding streaks.</p>
              </div>

              {/* Dynamic Linear Progress Bars with spring animation */}
              <div className="space-y-3 max-w-lg bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                {/* Study Minutes Progress Row */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Focus Time Completion
                    </span>
                    <span className={durationPercentage >= 100 ? "text-emerald-400 font-bold" : "text-white font-bold"}>
                      {minutesToday} / {goal.studyMinutesTarget} mins ({durationPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden relative border border-slate-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${durationPercentage}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 14 }}
                      className={`h-full rounded-full ${
                        durationPercentage >= 100 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]" 
                          : "bg-gradient-to-r from-blue-500 to-indigo-500"
                      }`}
                    />
                  </div>
                </div>

                {/* DSA Solved Progress Row */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Daily solved DSA Problems
                    </span>
                    <span className={dsaProgressPercentage >= 100 ? "text-amber-400 font-bold" : "text-white font-bold"}>
                      {problemsTodayCount} / {goal.dsaProblemsTarget} problems ({dsaProgressPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden relative border border-slate-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dsaProgressPercentage}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.1 }}
                      className={`h-full rounded-full ${
                        dsaProgressPercentage >= 100 
                          ? "bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.35)]" 
                          : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Daily Targets Parameters controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={openGoalEditor}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center gap-1.5 px-2 py-1 transition-colors duration-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Customize Target Goals
                </button>
              </div>
            </div>

            {/* Custom Circular Progress Indicators Side-by-Side */}
            <div className="flex items-center gap-6 shrink-0 bg-slate-950/20 p-4 rounded-3xl border border-slate-850/50 md:self-stretch justify-center">
              {/* Study Minutes Circular Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="#111827" strokeWidth="5" fill="transparent" />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={durationPercentage >= 100 ? "url(#successGradient)" : "url(#progressGradient)"}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 32}
                      initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 32) * (1 - durationPercentage / 100) }}
                      strokeLinecap="round"
                      transition={{ type: "spring", stiffness: 45, damping: 12, mass: 0.8 }}
                    />
                  </svg>
                  <div className="absolute text-center mt-0.5 select-none">
                    <span className="text-sm font-black font-mono text-white block leading-none">{durationPercentage}%</span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tight block mt-0.5">mins</span>
                  </div>
                  {durationPercentage >= 100 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-slate-900 shadow-[0_2px_8px_rgba(16,185,129,0.5)]"
                    >
                      <Sparkles className="w-3 h-3" />
                    </motion.div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-2 font-bold uppercase tracking-wider">Minutes</span>
              </div>

              {/* DSA Solved Circular Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="#111827" strokeWidth="5" fill="transparent" />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={dsaProgressPercentage >= 100 ? "url(#dsaSuccessGradient)" : "url(#dsaProgressGradient)"}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 32}
                      initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 32) * (1 - dsaProgressPercentage / 100) }}
                      strokeLinecap="round"
                      transition={{ type: "spring", stiffness: 45, damping: 12, mass: 0.8, delay: 0.15 }}
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="dsaProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                      <linearGradient id="dsaSuccessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center mt-0.5 select-none">
                    <span className="text-sm font-black font-mono text-white block leading-none">{dsaProgressPercentage}%</span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tight block mt-0.5">solve</span>
                  </div>
                  {dsaProgressPercentage >= 100 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, -15, 15, 0] }}
                      transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.15 }}
                      className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border-2 border-slate-900 shadow-[0_2px_8px_rgba(245,158,11,0.5)]"
                    >
                      <CheckCircle className="w-3 h-3" />
                    </motion.div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-2 font-bold uppercase tracking-wider">DSA SVD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <FloatingTooltip content={streakTooltipContent} position="bottom">
            <div className="backdrop-blur-md bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-3xl flex items-center gap-3 transition-colors duration-300 h-full cursor-help shadow-md">
              <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/10">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Streak</span>
                <span className="text-base sm:text-lg font-bold text-white font-mono block truncate">{stats.streak} Days</span>
              </div>
            </div>
          </FloatingTooltip>

          <FloatingTooltip content={dsaSolvedTooltipContent} position="bottom">
            <div className="backdrop-blur-md bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-3xl flex items-center gap-3 transition-colors duration-300 h-full cursor-help shadow-md">
              <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/10">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">DSA Solved</span>
                <span className="text-base sm:text-lg font-bold text-white font-mono block truncate">{stats.totalDsaSolved}</span>
              </div>
            </div>
          </FloatingTooltip>

          <FloatingTooltip content={webDevTooltipContent} position="bottom">
            <div className="backdrop-blur-md bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-3xl flex items-center gap-3 transition-colors duration-300 h-full cursor-help shadow-md">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Web Dev Hrs</span>
                <span className="text-base sm:text-lg font-bold text-white font-mono block truncate">{(stats.totalWebDevHours / 60).toFixed(1)}h</span>
              </div>
            </div>
          </FloatingTooltip>

          <FloatingTooltip content={dsaHrsTooltipContent} position="bottom">
            <div className="backdrop-blur-md bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-3xl flex items-center gap-3 transition-colors duration-300 h-full cursor-help shadow-md">
              <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/10">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">DSA Hrs</span>
                <span className="text-base sm:text-lg font-bold text-white font-mono block truncate">{(stats.totalDsaHours / 60).toFixed(1)}h</span>
              </div>
            </div>
          </FloatingTooltip>

        </div>

        {/* AI Daily Study Insights Section */}
        <div id="ai-daily-study-insights" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Brain className="w-48 h-48 text-indigo-500" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> AI Daily Diagnostics & Study Insights
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Let Gemini analyze today's logs, active problem-solving, and provide constructive feedback</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="date"
                  value={insightDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setInsightDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateInsight}
                  disabled={insightLoading}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {insightLoading ? (
                    <>
                      <X className="w-3.5 h-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Insight
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error state */}
            {insightError && (
              <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 p-3.5 rounded-xl text-xs">
                <p className="font-bold mb-0.5">Diagnostician error</p>
                <p>{insightError}</p>
              </div>
            )}

            {/* Loading state skeleton */}
            {insightLoading && (
              <div className="space-y-4 py-3 animate-pulse">
                <div className="h-4 bg-slate-800/40 rounded-md w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-800/40 rounded-md" />
                  <div className="h-3 bg-slate-800/40 rounded-md w-5/6" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                    <div className="h-3 bg-slate-800/40 rounded-md w-1/3" />
                    <div className="h-3 bg-slate-800/40 rounded-md" />
                  </div>
                  <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                    <div className="h-3 bg-slate-800/40 rounded-md w-1/3" />
                    <div className="h-3 bg-slate-800/40 rounded-md" />
                  </div>
                </div>
              </div>
            )}

            {/* Empty study logs reminder */}
            {!studyInsight && !insightLoading && (
              (() => {
                const dayLogsCount = logs.filter(l => l.date === insightDate).length;
                const dsaProbCount = problems.filter(p => p.dateSolved === insightDate).length;
                const devLogCount = webDevLogs.filter(wl => wl.dateLogged === insightDate).length;
                const totalEntries = dayLogsCount + dsaProbCount + devLogCount;

                return (
                  <div className="text-center py-6 bg-slate-950/30 rounded-2xl border border-slate-950/60 mt-2">
                    <Brain className="w-8 h-8 text-slate-700 mx-auto mb-1 stroke-1" />
                    <p className="text-xs font-semibold text-slate-400">
                      {totalEntries > 0 
                        ? `${totalEntries} entries recorded for ${insightDate}` 
                        : `No study sessions, problems, or web dev logs logged for ${insightDate}`}
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5 leading-normal">
                      {totalEntries > 0 
                        ? "Click the button above to generate a professional performance audit from your logged study sessions."
                        : "You can still run a general planning advisory with empty logs, or make an entry above first to unlock premium metrics!"}
                    </p>
                  </div>
                );
              })()
            )}

            {/* Generated results cards */}
            {studyInsight && !insightLoading && (
              <div className="space-y-6 pt-2">
                
                {/* 1. Daily Dynamic Review Summary */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl text-left">
                  <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                    AI Study Diagnostician Overview ({insightDate})
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {studyInsight.summary}
                  </p>
                </div>

                {/* 2. Achievements and Constructive Critique */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Achievements */}
                  <div className="bg-indigo-950/15 border border-indigo-900/10 p-4 rounded-2xl text-left">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Highpoints & Milestones
                    </span>
                    <div className="space-y-2">
                      {studyInsight.achievements?.map((ach, idx) => (
                        <div key={idx} className="flex gap-2 items-start text-xs font-medium text-slate-300">
                          <span className="text-indigo-400 mt-0.5 font-bold shrink-0">✦</span>
                          <span>{ach}</span>
                        </div>
                      ))}
                      {(!studyInsight.achievements || studyInsight.achievements.length === 0) && (
                        <p className="text-slate-500 text-xs italic">Consistency log active.</p>
                      )}
                    </div>
                  </div>

                  {/* Feedback Critique */}
                  <div className="bg-slate-950/55 border border-slate-850 p-4 rounded-2xl text-left">
                    <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-teal-400" /> Focus critique & Edge Cases
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {studyInsight.feedback}
                    </p>
                  </div>

                </div>

                {/* 3. Actionable Next steps recommendations */}
                <div className="bg-slate-950/45 border border-slate-850/60 p-4 rounded-2xl text-left">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-3">
                    Recommended steps for your next study block
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {studyInsight.nextSteps?.map((step, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 flex gap-2 items-start">
                        <div className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-300 leading-relaxed">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* GitHub Style Contribution Streak Heatmap */}
        <div id="contribution-heatmap" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 group shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" /> Consistent Study Heatmap
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Visually track your daily study submissions over the last 16 weeks</p>
            </div>
            
            {/* Color key */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 self-start sm:self-auto select-none">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-950/80" />
              <div className="w-2.5 h-2.5 rounded bg-indigo-950/70 border border-indigo-900/10" />
              <div className="w-2.5 h-2.5 rounded bg-indigo-800 border border-indigo-700/60" />
              <div className="w-2.5 h-2.5 rounded bg-indigo-600 border border-indigo-500" />
              <div className="w-2.5 h-2.5 rounded bg-cyan-500 border border-cyan-400 shadow-sm" />
              <span>More</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Main Interactive Grid */}
            <div className="relative overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <div className="min-w-[620px]">
                {/* Months Labels Row */}
                <div className="flex pl-8 mb-1.5 h-4 select-none relative">
                  {(() => {
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const columnsCount = Math.ceil(contributionDays.length / 7);
                    const labels: { text: string; offsetLeft: number }[] = [];
                    let lastMonth = -1;
                    
                    for (let col = 0; col < columnsCount; col++) {
                      const firstDayIndex = col * 7;
                      if (firstDayIndex < contributionDays.length) {
                        const d = contributionDays[firstDayIndex].date;
                        const m = d.getMonth();
                        if (m !== lastMonth) {
                          // Standard gap-1 spacing: each square is 12px (w-3) + 4px (gap-1) = 16px. Note: 16px per column
                          labels.push({ text: monthNames[m], offsetLeft: col * 16 });
                          lastMonth = m;
                        }
                      }
                    }
                    
                    return labels.map((lbl, idx) => (
                      <span
                        key={idx}
                        className="absolute text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-wide"
                        style={{ left: `${lbl.offsetLeft + 32}px` }}
                      >
                        {lbl.text}
                      </span>
                    ));
                  })()}
                </div>

                {/* Day rows and squares columns */}
                <div className="flex gap-2">
                  {/* Day of week indicator column */}
                  <div className="flex flex-col justify-between text-[9px] font-mono text-slate-500 h-[106px] w-6 py-0.5 select-none">
                    <span>Sun</span>
                    <span>Tue</span>
                    <span>Thu</span>
                    <span>Sat</span>
                  </div>

                  {/* Heat squares in col-flow grid */}
                  <div className="grid grid-flow-col grid-rows-7 gap-1 auto-cols-max">
                    {contributionDays.map((day) => {
                      const isHovered = hoveredContributionDay && hoveredContributionDay.dateStr === day.dateStr;
                      
                      // Get colors
                      let bgClass = "bg-slate-950 border border-slate-900";
                      if (day.totalMinutes > 0) {
                        if (day.totalMinutes <= 15) {
                          bgClass = "bg-indigo-950/70 border border-indigo-900/10 hover:border-indigo-800";
                        } else if (day.totalMinutes <= 45) {
                          bgClass = "bg-indigo-800 border border-indigo-700/60 hover:border-indigo-600";
                        } else if (day.totalMinutes <= 90) {
                          bgClass = "bg-indigo-600 border border-indigo-500 hover:border-indigo-400";
                        } else {
                          bgClass = "bg-cyan-500 border border-cyan-400 hover:border-cyan-300 shadow-sm shadow-cyan-500/15";
                        }
                      }

                      return (
                        <div
                          key={day.dateStr}
                          onMouseEnter={() => setHoveredContributionDay(day)}
                          className={`w-3 h-3 rounded-[3px] transition-all duration-150 cursor-pointer ${bgClass} ${
                            isHovered ? "ring-2 ring-white scale-125 z-10" : ""
                          }`}
                          title={`${day.dateStr}: ${day.totalMinutes}m studied`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Readout Highlight Card to prevent tooltip clipping */}
            <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-slate-400">
                  {hoveredContributionDay ? (
                    <>
                      <span className="font-bold text-slate-200 font-mono">
                        {new Date(hoveredContributionDay.dateStr).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                      {" • "}
                      <span className="text-slate-300 font-semibold">{hoveredContributionDay.totalMinutes} Mins logged</span>
                    </>
                  ) : (
                    <span className="italic text-slate-500">Hover over any grid block to view detailed logs</span>
                  )}
                </span>
              </div>

              {hoveredContributionDay && hoveredContributionDay.totalMinutes > 0 && (
                <div className="flex gap-3 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    DSA: {hoveredContributionDay.dsaMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Web Dev: {hoveredContributionDay.webMinutes} mins
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar intensity visualizer row */}
        <StudyIntensityCalendar logs={logs} />

        {/* Weekly Analysis Grid: Trends Area & Comparison Bar */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Chart 1: Weekly Study Duration Trends Chart */}
          <div id="weekly-trends-chart" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Weekly Trends
                </h3>
                <p className="text-xs text-slate-500 mt-1">Daily learning breakdown of logged minutes</p>
              </div>
              <span className="text-[10px] bg-slate-950 text-slate-400 font-bold px-2.5 py-1.5 rounded-xl border border-slate-850 uppercase tracking-wider">
                Last 7 Days
              </span>
            </div>

            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getLast7DaysData()}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorDsaSec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWebSec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="dayLabel" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `${v}m`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="DSA" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorDsaSec)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Web Dev" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorWebSec)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Weekly Comparison Bar Chart */}
          <div id="weekly-comparison-bar-chart" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" /> Weekly Hourly Comparison
                </h3>
                <p className="text-xs text-slate-500 mt-1">Study hours comparison: DSA vs Web Dev</p>
              </div>
              <span className="text-[10px] bg-slate-950 text-slate-400 font-bold px-2.5 py-1.5 rounded-xl border border-slate-850 uppercase tracking-wider">
                Hours Units
              </span>
            </div>

            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getWeeklyHoursData()}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="dayLabel" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}
                  />
                  <Bar 
                    dataKey="DSA Hours" 
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar 
                    dataKey="Web Dev Hours" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Recent Activity Feed */}
        <div id="recent-activity-feed" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-emerald-400 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <History className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400 animate-pulse" /> Recent DSA & Web Dev Activity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Quick summary of study progress across key domains</p>
              </div>
              <span className="text-[10px] bg-slate-950 text-slate-400 font-bold px-2.5 py-1.5 rounded-xl border border-slate-850 uppercase tracking-wider self-start sm:self-auto select-none">
                Last 5 Logs
              </span>
            </div>

            {recentActivities.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/30 rounded-2xl border border-slate-950/60">
                <History className="w-8 h-8 text-slate-700 mx-auto mb-1 stroke-1" />
                <p className="text-xs font-semibold text-slate-400">No recent DSA or Web Dev activities logged yet.</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5 leading-normal">
                  Log your first study session below, or solve a DSA problem to populate your live feed!
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentActivities.map((activity, idx) => {
                  const isDsa = activity.category === 'dsa';
                  
                  return (
                    <FloatingTooltip key={activity.id || idx} content={getActivityTooltipContent(activity)} position="top">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group/item flex gap-4 bg-slate-950/45 hover:bg-slate-900/40 border border-slate-850 hover:border-slate-800 p-4 rounded-2xl transition-all duration-300 cursor-help"
                      >
                        {/* Left category-specific dynamic icon sphere */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover/item:scale-105 ${
                          isDsa 
                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                          {activity.type === 'dsa_problem' ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : activity.type === 'web_dev_log' ? (
                            <Globe className="w-5 h-5" />
                          ) : isDsa ? (
                            <Terminal className="w-5 h-5" />
                          ) : (
                            <Code2 className="w-5 h-5" />
                          )}
                        </div>

                        {/* Content column */}
                        <div className="flex-1 space-y-1 text-left min-w-0">
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            {/* Feed meta tag */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                                activity.type === 'dsa_problem'
                                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                  : activity.type === 'web_dev_log'
                                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                  : isDsa
                                  ? 'bg-indigo-500/10 border-indigo-500/30 text-violet-400'
                                  : 'bg-blue-500/10 border-blue-500/30 text-cyan-400'
                              }`}>
                                {activity.type === 'dsa_problem' 
                                  ? 'DSA Solved' 
                                  : activity.type === 'web_dev_log' 
                                  ? 'Web Dev Build' 
                                  : isDsa 
                                  ? 'DSA Session' 
                                  : 'Web Dev Session'}
                              </span>
                              
                              {activity.extraInfo && (
                                <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md border ${
                                  activity.extraInfo === 'HARD'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    : activity.extraInfo === 'MEDIUM'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                }`}>
                                  {activity.extraInfo}
                                </span>
                              )}
                            </div>

                            {/* Human readable Date stamp */}
                            <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-wider">
                              {formatRecentActivityDate(activity.date)}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-slate-200 text-xs md:text-sm font-semibold tracking-wide leading-snug group-hover/item:text-white transition-colors duration-200 truncate">
                            {activity.title}
                          </h4>

                          {/* Summary metadata details */}
                          <p className="text-[10px] md:text-xs font-mono font-semibold text-slate-500">
                            {activity.meta}
                          </p>

                          {/* Render notes if they exist */}
                          {activity.notes && (
                            <div className="pt-1.5">
                              <span className="text-[10px] md:text-[11px] font-sans text-slate-400 line-clamp-2 italic pl-2.5 border-l-2 border-slate-800 dark:border-slate-800 leading-normal block">
                                "{activity.notes}"
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </FloatingTooltip>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Log Study Session Form */}
        <div className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Log Your Daily Session</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category selector */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Study Focus Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCategory('dsa')}
                    className={`text-xs py-2 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      category === 'dsa'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    DSA Algorithms
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('web_dev')}
                    className={`text-xs py-2 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      category === 'web_dev'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Web Dev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('core_cse')}
                    className={`text-xs py-2 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      category === 'core_cse'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    CSE Core Theory
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('lab_practical')}
                    className={`text-xs py-2 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      category === 'lab_practical'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    B.Tech Lab Pracs
                  </button>
                </div>
              </div>

              {/* Study Date log */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Study Log Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Title / Objective */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {category === 'dsa' 
                  ? 'Algorithm Topic / Solved problem name' 
                  : category === 'web_dev'
                  ? 'Web Feature Built / Portfolio Learning'
                  : category === 'core_cse'
                  ? 'Core CS Academic Topic / Exam Prep Concepts'
                  : 'Lab Experiment Name / Practical Task'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={
                  category === 'dsa' 
                    ? "e.g. Reverse Linked List, Binary Search tree" 
                    : category === 'web_dev'
                    ? "e.g. Set up JWT Auth in express, CSS flexbox layout"
                    : category === 'core_cse'
                    ? "e.g. DBMS Normalization (3NF/BCNF), OS Dijkstra's Banker's Algorithm, CN Subnetting"
                    : "e.g. DBMS Lab (SQL Triggers), Python Socket Programming Lab, Compiler Lexer in Lex/Yacc"
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Slider Duration setting */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Time Spent (Minutes)</label>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                  {duration} Mins (~{(duration / 60).toFixed(1)}h)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="360"
                step="5"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Notes content */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Learnings & Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder={
                  category === 'dsa' 
                    ? "Detail the space complexity or optimization steps you took..." 
                    : category === 'web_dev'
                    ? "What challenges did you face? What NPM packages did you use?..."
                    : category === 'core_cse'
                    ? "Write down core definitions, formulas, or key exam questions studied..."
                    : "Detail lab objective, code setup used, hardware/simulation tool, or viva questions asked..."
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              {formSuccess ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 animated fade-in">
                  <CheckCircle className="w-4 h-4" /> Logger success! Streak maintained.
                </span>
              ) : (
                <span className="text-xs text-slate-500">Every log updates study analytics.</span>
              )}
              
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all outline-none"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Submit Study Log
              </button>
            </div>

          </form>
        </div>

        {/* Project Portfolio & Build Tracker */}
        <div id="projects-portfolio-section" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                <Terminal className="w-5 h-5 text-emerald-400" /> Project Build & Portfolio Tracker
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Track your software applications and completion progress</p>
            </div>
            
            {!isAddingProject && (
              <button
                onClick={() => {
                  setEditingProjectId(null);
                  setProjName("");
                  setProjDesc("");
                  setProjCompletion(0);
                  setIsAddingProject(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            )}
          </div>

          {/* New / Edit Project Inline Form */}
          {isAddingProject && (
            <form onSubmit={handleProjectSubmit} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-4 mb-6 animated fade-in">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                {editingProjectId ? '✏️ Edit Project details' : '🚀 Add New Project'}
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projName}
                    onChange={e => setProjName(e.target.value)}
                    placeholder="e.g. My E-Commerce App, Compiler Lab, Chess Engine..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Description / Key Features</label>
                  <textarea
                    value={projDesc}
                    onChange={e => setProjDesc(e.target.value)}
                    placeholder="Describe main features, technologies (React, Node, Firebase), and algorithms used..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 font-sans"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-400">Completion Status</label>
                    <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                      {projCompletion}% Done
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={projCompletion}
                      onChange={e => setProjCompletion(Number(e.target.value))}
                      className="flex-1 accent-emerald-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1 font-mono">
                      {[0, 25, 50, 75, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setProjCompletion(val)}
                          className="text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 px-1.5 py-0.5 rounded transition-all"
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={handleCancelProjectEdit}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold px-3 py-2 rounded-xl border border-slate-850 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all"
                >
                  {editingProjectId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          )}

          {/* Projects lists */}
          {projects.length === 0 ? (
            <div className="text-center py-8 bg-slate-950/30 rounded-2xl border border-slate-950/65">
              <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-1 stroke-1" />
              <p className="text-xs font-semibold text-slate-400">No active projects logged yet.</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5 leading-normal">
                Click "Add Project" to track your engineering applications, capstones, or GitHub portfolio repositories.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => {
                const completionVal = proj.completion;
                
                // Determine phase attributes based on completion value
                let phaseTitle = "Planning Phase";
                let phaseDetail = "Designing schema, requirements draft, files setup.";
                let statusBadgeColor = "text-rose-450 border-rose-500/10 bg-rose-500/5";
                let barColor = "bg-rose-500";
                let IconComponent = Compass;

                if (completionVal >= 100) {
                  phaseTitle = "Production-Ready";
                  phaseDetail = "App fully built, compiled, and added to portfolio.";
                  statusBadgeColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
                  barColor = "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]";
                  IconComponent = CheckCircle;
                } else if (completionVal >= 90) {
                  phaseTitle = "Deployment Prep";
                  phaseDetail = "Optimizing configs, lint checks, and pre-bundling tests.";
                  statusBadgeColor = "text-indigo-400 border-indigo-500/20 bg-indigo-500/5";
                  barColor = "bg-gradient-to-r from-indigo-500 to-violet-500";
                  IconComponent = Wrench;
                } else if (completionVal >= 70) {
                  phaseTitle = "Interface Polish";
                  phaseDetail = "Refactoring layout styles, animation transitions, micro-UX.";
                  statusBadgeColor = "text-teal-400 border-teal-500/15 bg-teal-500/5";
                  barColor = "bg-gradient-to-r from-teal-500 to-cyan-400";
                  IconComponent = Sparkles;
                } else if (completionVal >= 35) {
                  phaseTitle = "Core Development";
                  phaseDetail = "Implementing APIs, forms state control, and database features.";
                  statusBadgeColor = "text-amber-400 border-amber-500/15 bg-amber-500/5";
                  barColor = "bg-gradient-to-r from-amber-500 to-yellow-400";
                  IconComponent = Hammer;
                } else if (completionVal >= 15) {
                  phaseTitle = "Alpha Implementation";
                  phaseDetail = "Structuring routing setup and local validation logs.";
                  statusBadgeColor = "text-orange-400 border-orange-500/15 bg-orange-500/5";
                  barColor = "bg-orange-500";
                  IconComponent = Construction;
                }

                return (
                  <div
                    key={proj.id}
                    className="bg-slate-950/40 border border-slate-850 hover:border-slate-800 p-5 rounded-2xl transition-all duration-300 relative group/p-card animate-fade-in"
                  >
                    {/* Header: Title, Description and control buttons */}
                    <div className="flex justify-between items-start gap-4 mb-3.5">
                      <div className="space-y-1 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-wide">{proj.name}</h4>
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${statusBadgeColor}`}>
                            <IconComponent className="w-3 h-3 shrink-0" />
                            <span>{phaseTitle} ({completionVal}%)</span>
                          </div>
                        </div>
                        {proj.description && (
                          <p className="text-xs text-slate-400 leading-normal max-w-2xl">{proj.description}</p>
                        )}
                        <p className="text-[10px] text-slate-500 font-mono italic">
                          💡 Status: {phaseDetail}
                        </p>
                      </div>

                      {/* Edit or Delete Action Controls */}
                      <div className="flex gap-1.5 opacity-0 group-hover/p-card:opacity-100 transition-opacity duration-200 shrink-0">
                        <button
                          onClick={() => handleEditProjectClick(proj)}
                          title="Edit project name & progress status"
                          className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/30 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${proj.name}?`)) {
                              if (onDeleteProject) onDeleteProject(proj.id);
                            }
                          }}
                          title="Permanently remove project tracking"
                          className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:bg-rose-950 hover:border-rose-800/40 text-slate-400 hover:text-rose-400 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Highly Visual Progress Bar with markers */}
                    <div className="space-y-2 pt-1 text-left">
                      {/* Interactive Track bar */}
                      <div className="relative">
                        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-850 p-[1.5px]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                            style={{ width: `${completionVal}%` }}
                          />
                        </div>
                        
                        {/* Shimmer overlay animation on active bar */}
                        {completionVal > 0 && completionVal < 100 && (
                          <div className="absolute top-[1.5px] left-0 h-2 bg-white/10 rounded-full animate-pulse pointer-events-none" style={{ width: `${completionVal}%` }} />
                        )}
                      </div>

                      {/* Visual Milestone indicators mapped along the track */}
                      <div className="grid grid-cols-5 text-[9px] font-mono font-bold text-slate-600 px-1 border-t border-slate-900/40 pt-1.5">
                        <div className={`text-left transition-colors duration-300 ${completionVal >= 0 ? "text-indigo-400" : ""}`}>
                          <span>• 0% Setup</span>
                        </div>
                        <div className={`text-center transition-colors duration-300 ${completionVal >= 25 ? "text-orange-400" : ""}`}>
                          <span>• 25% Alpha</span>
                        </div>
                        <div className={`text-center transition-colors duration-300 ${completionVal >= 50 ? "text-amber-400" : ""}`}>
                          <span>• 50% Core</span>
                        </div>
                        <div className={`text-center transition-colors duration-300 ${completionVal >= 75 ? "text-teal-400" : ""}`}>
                          <span>• 75% Polish</span>
                        </div>
                        <div className={`text-right transition-colors duration-300 ${completionVal >= 100 ? "text-emerald-400" : ""}`}>
                          <span>• 100% Done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Everyday Total Study Hour Records with Stacked Bar / Area charts */}
        <EverydayStudyHours logs={logs} goal={goal} />

        {/* Milestone Countdown for placement and semesters */}
        <DeadlinesCountdown />

        {/* B.Tech CSE CGPA & GATE/Placement Prep Companion Desk */}
        <BTechAcademicDesk />

      </div>

      {/* 1-Column Right: Timeline and DSA distribution */}
      <div className="space-y-6">
        
        {/* Integrated ScholarOS Google search bar */}
        <GoogleSearchBar />
        
        {/* Academic Study Motivation Quote */}
        {currentQuote && (
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/40 to-slate-950/70 border border-slate-800/80 hover:border-indigo-500/30 rounded-3xl p-6 overflow-hidden relative group shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all duration-500">
            {/* Blurry ambient light blobs to create a gorgeous visual depth (making it "bloom") */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/15 transition-all duration-700" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-700" />

            {/* Elegant oversized double quote icon */}
            <div className="absolute top-4 right-4 opacity-5 text-indigo-400 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 pointer-events-none">
              <Quote className="w-16 h-16 rotate-180" />
            </div>

            <div className="relative z-10 space-y-5">
              {/* Header Badge Row */}
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
                <span className="text-[10px] bg-gradient-to-r from-rose-500/10 to-indigo-500/10 text-rose-300 font-mono font-bold px-3 py-1 rounded-xl border border-rose-500/15 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin-slow" /> {currentQuote.tag}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    12H MOTTO LIVE
                  </span>
                </div>
              </div>

              {/* Main Gorgeous Quote Body */}
              <div className="space-y-3.5">
                <p className="text-sm md:text-sm font-semibold leading-relaxed tracking-wide bg-gradient-to-r from-slate-100 via-slate-50 to-slate-200 bg-clip-text text-transparent italic pl-1 border-l-2 border-indigo-500/40">
                  "{currentQuote.quote}"
                </p>
                
                <div className="flex items-center justify-end gap-2 text-right">
                  <span className="w-5 h-px bg-slate-800" />
                  <p className="text-xs text-indigo-300/80 font-mono font-semibold tracking-wide">
                    {currentQuote.author}
                  </p>
                </div>
              </div>

              {/* Footer Rotator Controls */}
              <div className="pt-3.5 border-t border-slate-850/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-indigo-400/80" /> 
                  Next: <span className="text-indigo-300 font-bold font-mono">{timeUntilNextRotation}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={favoriteQuotes.has(currentQuoteIndex) ? "Remove Favorite Motto" : "Mark as Daily Motto"}
                    onClick={handleToggleFavoriteQuote}
                    className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${
                      favoriteQuotes.has(currentQuoteIndex)
                        ? "bg-rose-500/20 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                        : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300 hover:bg-slate-900 hover:scale-105"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${favoriteQuotes.has(currentQuoteIndex) ? "fill-rose-500 text-rose-400" : ""}`} />
                  </button>
                  
                  <button
                    type="button"
                    title="Cycle Next Quote"
                    onClick={handleNextQuoteManual}
                    className="p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-650/15 text-indigo-400 hover:text-indigo-300 hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Study Pomodoro Timer Card */}
        <PomodoroTimer onAddLog={onAddLog} />
        
        {/* DSA Difficulty distribution card */}
        <div className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 shadow-lg">
          <h4 className="text-xs font-bold font-mono uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> DSA Distribution
          </h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">Easy ({stats.easyCount})</span>
                <span className="text-slate-400">{stats.totalDsaSolved ? Math.round((stats.easyCount / stats.totalDsaSolved) * 100) : 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalDsaSolved ? (stats.easyCount / stats.totalDsaSolved) * 100 : 0}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-400">Medium ({stats.mediumCount})</span>
                <span className="text-slate-400">{stats.totalDsaSolved ? Math.round((stats.mediumCount / stats.totalDsaSolved) * 100) : 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalDsaSolved ? (stats.mediumCount / stats.totalDsaSolved) * 100 : 0}%` }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-400">Hard ({stats.hardCount})</span>
                <span className="text-slate-400">{stats.totalDsaSolved ? Math.round((stats.hardCount / stats.totalDsaSolved) * 100) : 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-rose-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalDsaSolved ? (stats.hardCount / stats.totalDsaSolved) * 100 : 0}%` }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Donut Chart Card */}
        <div id="category-breakdown-chart" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" /> Time Breakdown
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Focus share of study categories</p>
            </div>
            
            {/* Timeframe Toggles */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
              {(['all', 'weekly', 'today'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBreakdownTimeframe(t)}
                  className={`text-[9px] font-mono font-bold px-2 py-1 rounded-lg uppercase tracking-wider transition-all select-none cursor-pointer ${
                    breakdownTimeframe === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'weekly' ? '7D' : '1D'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center gap-4 py-1 justify-center">
            {/* The Donut Chart */}
            <div className="relative w-44 h-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 shadow-xl">
                            <span className="font-bold text-white block mb-0.5">{data.name}</span>
                            <span>{data.value} mins ({data.percentage}%)</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={categoryBreakdownData.chartData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={65}
                    paddingAngle={categoryBreakdownData.total > 0 ? 5 : 0}
                    dataKey="value"
                  >
                    {categoryBreakdownData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Absolute center text inside the Donut hole */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {categoryBreakdownData.total > 0 ? (
                  <>
                    <span className="text-base font-extrabold text-white font-mono leading-none">
                      {categoryBreakdownData.total}
                    </span>
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
                      Mins
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] italic font-semibold text-slate-605 text-center px-2">
                    0 mins
                  </span>
                )}
              </div>
            </div>

            {/* Readout stats breakdown lists */}
            <div className="flex-1 space-y-2.5 w-full">
              {categoryBreakdownData.chartData.map((data, index) => {
                return (
                  <div key={data.name} className="bg-slate-950/40 border border-slate-850/60 p-2.5 rounded-xl flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                      <div>
                        <span className="text-[10px] font-bold text-slate-300 block leading-tight">
                          {data.name}
                        </span>
                        <span className="text-[9px] font-mono font-semibold text-slate-500">
                          {data.value} Mins logged
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-white block">
                        {data.percentage}%
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 block">
                        {(data.value / 60).toFixed(1)}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timelines of Logs */}
        <div className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 flex flex-col h-[520px] shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Recent Study Timeline
          </h3>

          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-600 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">No records submitted yet.</p>
              </div>
            ) : (
              logs.slice(0, 15).map((log, index) => (
                <div key={log.id} className="relative pl-5 border-l border-slate-800 group pb-3">
                  {/* Visual timeline bullet */}
                  <span className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    log.category === 'dsa' 
                      ? 'bg-indigo-500' 
                      : log.category === 'web_dev'
                      ? 'bg-blue-400'
                      : log.category === 'core_cse'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`} />

                  {/* Log Content body */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{log.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 font-mono">
                        <span>{log.date}</span>
                        <span>•</span>
                        <span>{log.duration} Mins</span>
                        <span>•</span>
                        <span className="uppercase text-[9px] font-bold text-slate-500">
                          {log.category === 'dsa' 
                            ? 'DSA' 
                            : log.category === 'web_dev'
                            ? 'Web Dev'
                            : log.category === 'core_cse'
                            ? 'CSE Core'
                            : 'Labs / Practicals'}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteLog(log.id, log.category)}
                      className="text-[10px] text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-rose-500/10 rounded"
                      title="Delete entry"
                    >
                      Delete
                    </button>
                  </div>

                  {log.notes && (
                    <p className="text-[10px] text-slate-500 bg-slate-950/40 p-2 rounded-lg border border-slate-950/60 mt-1.5 line-clamp-2">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Target Setup Modal Overlay */}
      {isEditingGoal && (
        <div id="target-setup-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animated fade-in">
          {/* Backdrop Click-to-Close */}
          <div className="absolute inset-0" onClick={() => setIsEditingGoal(false)} />
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animated zoom-in duration-200 z-10">
            {/* Decorative colored glow inside modal */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <Target className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Focus Targets Setup</h3>
                  <p className="text-[10px] text-slate-500">Configure your daily learning targets</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="p-1.5 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Presets Selector */}
            <div className="mb-5 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-2">Preset Study Profiles</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Casual Solver", icon: "🛋️", mins: 30, problems: 1 },
                  { name: "Balanced Cadet", icon: "🏎️", mins: 60, problems: 2 },
                  { name: "Interview Runner", icon: "🔥", mins: 120, problems: 4 },
                  { name: "Scholar Supreme", icon: "👑", mins: 240, problems: 8 }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setTempGoalMinutes(preset.mins);
                      setTempGoalProblems(preset.problems);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col gap-0.5 cursor-pointer ${
                      tempGoalMinutes === preset.mins && tempGoalProblems === preset.problems
                        ? "bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-600/5"
                        : "bg-slate-950/60 border-slate-850 hover:border-slate-800 text-slate-300"
                    }`}
                  >
                    <span className="text-[11px] font-bold flex items-center gap-1">
                      <span>{preset.icon}</span> {preset.name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {preset.mins} mins • {preset.problems} {preset.problems === 1 ? 'prob' : 'probs'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual target fields */}
            <div className="space-y-4 mb-6 text-left">
              {/* Target study minutes */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">Daily Study Target</label>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">{tempGoalMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="480"
                    step="15"
                    value={tempGoalMinutes}
                    onChange={e => setTempGoalMinutes(Number(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="15"
                    max="1440"
                    value={tempGoalMinutes}
                    onChange={e => setTempGoalMinutes(Number(e.target.value))}
                    className="w-16 text-center bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl py-1 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Target solved problems */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">Daily DSA Solved Target</label>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{tempGoalProblems} {tempGoalProblems === 1 ? 'problem' : 'problems'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={tempGoalProblems}
                    onChange={e => setTempGoalProblems(Number(e.target.value))}
                    className="flex-1 accent-emerald-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tempGoalProblems}
                    onChange={e => setTempGoalProblems(Number(e.target.value))}
                    className="w-16 text-center bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl py-1 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save / Cancel controls */}
            <div className="flex gap-2.5 font-mono">
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="flex-1 py-2.5 rounded-xl text-center font-bold text-[10px] uppercase text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-900 border border-slate-850 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveGoal}
                className="flex-1 py-2.5 rounded-xl text-center font-bold text-[10px] uppercase bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
              >
                Apply Targets
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
