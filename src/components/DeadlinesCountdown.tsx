import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Timer,
  Bell,
  X,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Deadline {
  id: string;
  title: string;
  date: string; // ISO state string (YYYY-MM-DDTHH:MM)
  category: "exam" | "placement" | "assignment" | "contest" | "other";
  priority: "high" | "medium" | "low";
  completed: boolean;
}

const CATEGORY_STYLES = {
  exam: { label: "Exam / Quiz", text: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5", icon: AlertCircle },
  placement: { label: "Placement Drive", text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5", icon: Sparkles },
  assignment: { label: "Submissions", text: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5", icon: Calendar },
  contest: { label: "Competitive Contest", text: "text-indigo-400", border: "border-indigo-500/20", bg: "bg-indigo-500/5", icon: Timer },
  other: { label: "Task Goal", text: "text-slate-400", border: "border-slate-500/20", bg: "bg-slate-500/5", icon: Clock }
};

export default function DeadlinesCountdown() {
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => {
    const saved = localStorage.getItem("workspace_exam_deadlines");
    if (saved) return JSON.parse(saved);

    // Dynamic dates so they are always in the future relative to the current local time 2026-06-18
    const baseTime = new Date("2026-06-18T01:20:00");
    
    const gateDate = new Date(baseTime);
    gateDate.setDate(gateDate.getDate() + 245); // ~8 months out for GATE exam
    
    const midtermDate = new Date(baseTime);
    midtermDate.setDate(midtermDate.getDate() + 12); // Under two weeks
    
    const contestDate = new Date(baseTime);
    contestDate.setDate(contestDate.getDate() + 2); // 2 days for next contest
    contestDate.setHours(19, 0, 0, 0);

    return [
      {
        id: "dl-1",
        title: "GATE CSE National Examination Prep Target",
        date: gateDate.toISOString().substring(0, 16),
        category: "exam",
        priority: "high",
        completed: false
      },
      {
        id: "dl-2",
        title: "Semester 5: Operating Systems & DBMS Theory exam",
        date: midtermDate.toISOString().substring(0, 16),
        category: "exam",
        priority: "medium",
        completed: false
      },
      {
        id: "dl-3",
        title: "LeetCode Biweekly Coding Challenge Contest",
        date: contestDate.toISOString().substring(0, 16),
        category: "contest",
        priority: "low",
        completed: false
      }
    ];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<Deadline["category"]>("exam");
  const [priority, setPriority] = useState<Deadline["priority"]>("medium");
  const [now, setNow] = useState(() => new Date());

  // Keep countdown timer synced
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("workspace_exam_deadlines", JSON.stringify(deadlines));
  }, [deadlines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const newDl: Deadline = {
      id: `dl-${Date.now()}`,
      title: title.trim(),
      date,
      category,
      priority,
      completed: false
    };

    setDeadlines(prev => [newDl, ...prev]);
    setTitle("");
    setDate("");
    setCategory("exam");
    setPriority("medium");
    setShowAddForm(false);
  };

  const handleToggleComplete = (id: string) => {
    setDeadlines(prev => prev.map(dl => dl.id === id ? { ...dl, completed: !dl.completed } : dl));
  };

  const handleDelete = (id: string) => {
    setDeadlines(prev => prev.filter(dl => dl.id !== id));
  };

  const getCountdownString = (deadlineStr: string) => {
    const deadlineDate = new Date(deadlineStr);
    const diffMs = deadlineDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { expired: true, text: "Ongoing / Concluded" };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let labelStr = "";
    if (days > 0) labelStr += `${days}d `;
    if (hours > 0 || days > 0) labelStr += `${hours}h `;
    labelStr += `${minutes}m`;

    return { expired: false, text: labelStr, rawDays: days };
  };

  return (
    <div id="deadlines-and-exams-widget" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
      {/* Background lights */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-amber-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-rose-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-880 pb-4 mb-5 relative z-10">
        <div className="text-left">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <Timer className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            Exam Milestone Deadlines & Counter
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Visually track upcoming placement targets, college term exams and contests</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(prev => !prev)}
          className="bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/20 text-rose-300 font-mono font-bold text-[11px] px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer self-start sm:self-auto uppercase tracking-wider"
        >
          {showAddForm ? (
            <>
              <X className="w-3.5 h-3.5" /> Close
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Track Exam
            </>
          )}
        </button>
      </div>

      {/* Modal/Inline Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl mb-5 space-y-3 relative overflow-hidden text-left"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Event Name */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Milestone Name / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems Class Test, GATE 2027 Mock"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600FocusFocus"
                  required
                />
              </div>

              {/* Deadline Date */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Date & Event Time</label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Category Type</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as Deadline["category"])}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
                >
                  <option value="exam">Exam / Test Quiz</option>
                  <option value="placement">Placement Opportunity</option>
                  <option value="assignment">Assignment Submission</option>
                  <option value="contest">Competitive Contest</option>
                  <option value="other">General Target Task</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Urgency Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Deadline["priority"])}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
                >
                  <option value="high">🔴 Critical / High</option>
                  <option value="medium">🟡 Medium Standard</option>
                  <option value="low">🟢 Normal Routine</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-950">
              <button
                type="submit"
                className="bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Add Deadline Track
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Grid of Active Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deadlines.length === 0 ? (
          <div className="col-span-full py-8 text-center bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col items-center justify-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-600 stroke-1" />
            <p className="text-xs font-bold text-slate-400">All milestones clear!</p>
            <p className="text-[10px] text-slate-600 max-w-xs">No upcoming placement, university exam, or assignment tracked.</p>
          </div>
        ) : (
          deadlines.map((dl) => {
            const displayCat = CATEGORY_STYLES[dl.category] || CATEGORY_STYLES.other;
            const CategoryIcon = displayCat.icon;
            const cntInfo = getCountdownString(dl.date);

            let priorityBorder = "border-slate-850 hover:border-slate-800";
            if (dl.priority === "high") {
              priorityBorder = "border-rose-500/10 hover:border-rose-500/20";
            } else if (dl.priority === "medium") {
              priorityBorder = "border-amber-500/10 hover:border-amber-500/20";
            }

            return (
              <div
                key={dl.id}
                className={`flex flex-col justify-between bg-slate-950/40 border p-4.5 rounded-2xl transition-all ${priorityBorder} ${
                  dl.completed ? "opacity-60 grayscale border-slate-900" : ""
                }`}
              >
                <div className="text-left space-y-2">
                  {/* Category and action button header */}
                  <div className="flex justify-between items-start gap-2">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${displayCat.bg} ${displayCat.text} ${displayCat.border}`}>
                      <CategoryIcon className="w-3 h-3" />
                      {displayCat.label}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(dl.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          dl.completed 
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" 
                            : "bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                        title={dl.completed ? "Mark incomplete" : "Conclude / Done"}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(dl.id)}
                        className="p-1 rounded-lg bg-slate-900 hover:bg-rose-950 hover:border-rose-800/40 border border-slate-800 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove tracking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title text */}
                  <div>
                    <h4 className={`text-[12.5px] font-bold tracking-wide transition-all ${dl.completed ? "text-slate-500 line-through" : "text-white"}`}>
                      {dl.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Target: {new Date(dl.date).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {/* Countdown time box */}
                <div className="mt-4 pt-3.5 border-t border-slate-900/50 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className={`w-3.5 h-3.5 ${
                      dl.completed 
                        ? "text-slate-600" 
                        : cntInfo.expired 
                        ? "text-slate-500" 
                        : (cntInfo.rawDays !== undefined && cntInfo.rawDays <= 7) 
                        ? "text-rose-400 animate-pulse" 
                        : "text-indigo-400"
                    }`} />
                    <span className={`text-[10.5px] font-extrabold font-mono uppercase tracking-wide px-2 py-0.5 rounded-lg ${
                      dl.completed
                        ? "bg-slate-950/40 text-slate-500"
                        : cntInfo.expired
                        ? "bg-slate-950/40 text-slate-500"
                        : (cntInfo.rawDays !== undefined && cntInfo.rawDays <= 7)
                        ? "bg-rose-950/40 text-rose-300 border border-rose-900/35"
                        : "bg-slate-950 text-indigo-300"
                    }`}>
                      {cntInfo.text}
                    </span>
                  </div>

                  {/* High urgency icon check */}
                  {!dl.completed && dl.priority === "high" && !cntInfo.expired && (
                    <span className="flex items-center gap-1 text-[8px] font-mono font-bold bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/25 animate-pulse uppercase">
                      CRITICAL PRIORITY
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
