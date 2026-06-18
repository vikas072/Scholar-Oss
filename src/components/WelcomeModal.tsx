import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  LayoutDashboard, 
  Code, 
  Terminal, 
  Sparkles, 
  CalendarDays, 
  BookOpen, 
  Clock, 
  Brain, 
  Check, 
  Flame, 
  ArrowRight,
  MonitorPlay,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DailyGoal } from "../types";

interface WelcomeModalProps {
  goal: DailyGoal;
  updateGoal: (newGoal: DailyGoal) => void;
  onClose?: () => void;
}

export default function WelcomeModal({ goal, updateGoal, onClose }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dsaTarget, setDsaTarget] = useState(goal.dsaProblemsTarget);
  const [minutesTarget, setMinutesTarget] = useState(goal.studyMinutesTarget);

  useEffect(() => {
    const hasVisited = localStorage.getItem("scholaros_visited");
    if (!hasVisited) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("scholaros_visited", "true");
    setIsOpen(false);
    // Persist finalized targets if customized
    updateGoal({
      dsaProblemsTarget: dsaTarget,
      studyMinutesTarget: minutesTarget
    });
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Steps Definition
  const steps = [
    {
      title: "Welcome to ScholarOS Mobile & Desktop Workspace",
      subtitle: "The integrated cognitive OS for B.Tech Engineers and Software Developers.",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-tr from-indigo-500/10 to-blue-500/5 border border-indigo-500/10 p-5 rounded-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full" />
            <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-100 font-display">Build, Track, Refactor & Retain</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              ScholarOS bridges the gap between chaotic study periods and structured development sprints. 
              By grouping your daily goals, algorithmic practices, system dev milestones, and AI buddy chats, 
              you establish a robust feedback loop for maximum learning efficiency.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-center">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Algorithmic</span>
              <span className="text-xs font-bold text-indigo-400 mt-1 block">DSA logs</span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-center">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Dynamic</span>
              <span className="text-xs font-bold text-blue-400 mt-1 block">Dev Portfolio</span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-center">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Cognitive</span>
              <span className="text-xs font-bold text-purple-400 mt-1 block">AI Assistance</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Mastering the Workspace Tabs",
      subtitle: "Click through our beautifully curated modules inside the sticky navigation header.",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            
            <div className="p-3 bg-slate-950/30 border border-slate-900 rounded-xl flex gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-[11.5px] font-bold text-slate-205">Workspace Dashboard</h5>
                <p className="text-[10.5px] text-slate-400 mt-0.5 leading-normal">
                  Your primary hub. Houses daily target meters, study intensity heatmaps, recent timeline feeds, and AI Daily Study insights.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/30 border border-slate-900 rounded-xl flex gap-3">
              <div className="p-2 bg-blue-500/10 border border-blue-500/10 text-blue-400 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-[11.5px] font-bold text-slate-205">DSA Log Tracker</h5>
                <p className="text-[10.5px] text-slate-400 mt-0.5 leading-normal">
                  Save solved LeetCode/codeforce problems, classify topics, write complexity reviews, and execute AI Complexity Diagnostic tests.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/30 border border-slate-900 rounded-xl flex gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-[11.5px] font-bold text-slate-205">Web Dev Portfolio</h5>
                <p className="text-[10.5px] text-slate-400 mt-0.5 leading-normal">
                  Define custom project directories, log focused system design hours, and link external builds with responsive link previews.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/30 border border-slate-900 rounded-xl flex gap-3">
              <div className="p-2 bg-purple-500/10 border border-purple-500/10 text-purple-400 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-[11.5px] font-bold text-slate-205">StudyBuddy AI & Planner</h5>
                <p className="text-[10.5px] text-slate-400 mt-0.5 leading-normal">
                  Chat interactively with a smart engineering tutor or structure custom exam syllabus roadmaps and flashcard decks instantly.
                </p>
              </div>
            </div>

          </div>
        </div>
      )
    },
    {
      title: "Flow State: Integrated Pomodoro Timer",
      subtitle: "Discover how focused sessions dynamically feed your master academic study metrics.",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-indigo-950/20 to-indigo-900/10 border border-indigo-550/20 p-4.5 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono font-bold text-indigo-350 uppercase tracking-wider">Uninterrupted Sprints</h4>
              <p className="text-xs text-slate-350 leading-relaxed">
                The global Pomodoro Timer floats at the bottom-right of the screen across all workspace tabs, allowing you to trigger, configure, and reset intervals anytime.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-[10px] text-emerald-400">1</span>
              <span>Commence a standard 25-minute study sprint.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-[10px] text-emerald-400">2</span>
              <span>Upon interval completion, the timer triggers a focus ring chime.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-[10px] text-emerald-400">3</span>
              <span className="text-slate-300 font-bold leading-relaxed">
                Choose to "Log Session" to write a durable study log automatically into your calendar heatmap tracking blocks.
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Set Your Daily Targets!",
      subtitle: "Establish baseline study goals to calibrate your workspace charts.",
      content: (
        <div className="space-y-5">
          <p className="text-xs text-slate-400 leading-relaxed text-center">
            Set targets to keep the heatmaps, percentage meters, and daily visual metrics glowing with pride. You can modify these anytime under the Dashboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Target 1 */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold uppercase text-slate-300">Daily DSA Targets</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <button 
                  onClick={() => setDsaTarget(Math.max(1, dsaTarget - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-all text-xs font-mono select-none cursor-pointer"
                >
                  -
                </button>
                <span className="text-base font-extrabold text-blue-400 font-mono">{dsaTarget} Solved</span>
                <button 
                  onClick={() => setDsaTarget(dsaTarget + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-all text-xs font-mono select-none cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Target 2 */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase text-slate-300">Daily Study Minutes</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <button 
                  onClick={() => setMinutesTarget(Math.max(10, minutesTarget - 10))}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-all text-xs font-mono select-none cursor-pointer"
                >
                  -
                </button>
                <span className="text-base font-extrabold text-emerald-400 font-mono">{minutesTarget} mins</span>
                <button 
                  onClick={() => setMinutesTarget(minutesTarget + 10)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:text-white transition-all text-xs font-mono select-none cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-display rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
            >
              Configure & Open Workspace <Check className="w-4 h-4 text-emerald-350" />
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-h-screen overflow-y-auto">
          
          {/* Backdrop Glassmorphism Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            id="welcome-tour-modal"
            className="relative w-full max-w-xl backdrop-blur-md bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-left"
          >
            
            {/* Visual background lights */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

            {/* Header section */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3 mb-4.5 relative z-10">
              <div>
                <span className="text-[10px] font-mono leading-none text-indigo-400 border border-indigo-400/20 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit mb-1.5 bg-indigo-500/5">
                  Platform Tour • Step {currentStep + 1} of 4
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white font-display leading-tight">{currentStepData.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-normal">{currentStepData.subtitle}</p>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                title="Skip and Close Quick Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Content Mount */}
            <div className="relative z-10 min-h-[180px] flex flex-col justify-center">
              {currentStepData.content}
            </div>

            {/* Bottom Controls / Progress Dots Footer bar */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-5 mt-5 relative z-10">
              
              {/* Stepped Progress Indicator Dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 transition-all rounded-full cursor-pointer outline-none ${
                      currentStep === idx 
                        ? "w-5 bg-indigo-500" 
                        : "w-1.5 bg-slate-800 hover:bg-slate-705"
                    }`}
                    title={`Tour step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all select-none cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all select-none cursor-pointer active:scale-95"
                >
                  {currentStep === 3 ? "All Set!" : "Next"} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
