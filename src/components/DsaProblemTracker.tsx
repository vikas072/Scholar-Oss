import { useState, FormEvent, useEffect, useRef } from "react";
import { DsaProblem, ProblemDifficulty, ProblemStatus } from "../types";
import { Search, Plus, Filter, Code, ExternalLink, RefreshCw, Layers, Sparkles, Check, HelpCircle, ChevronRight, CornerDownRight, Play, Pause, RotateCcw, Clock, Coffee, BookOpen, Mic, MicOff } from "lucide-react";

interface DsaProblemTrackerProps {
  problems: DsaProblem[];
  onAddProblem: (problem: Omit<DsaProblem, 'id' | 'userId' | 'createdAt'>) => void;
  onDeleteProblem: (id: string) => void;
  onAddLog: (category: 'dsa' | 'web_dev', title: string, duration: number, notes: string, date?: string) => void;
}

export default function DsaProblemTracker({ problems, onAddProblem, onDeleteProblem, onAddLog }: DsaProblemTrackerProps) {
  // Modal toggle and field states
  const [showAddForm, setShowAddForm] = useState(false);
  const [problemName, setProblemName] = useState("");
  const [platform, setPlatform] = useState("LeetCode");
  const [topic, setTopic] = useState("Arrays");
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>("easy");
  const [status, setStatus] = useState<ProblemStatus>("solved");
  const [solutionCode, setSolutionCode] = useState("");
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState("");
  const [dateSolved, setDateSolved] = useState(new Date().toISOString().split("T")[0]);

  // Web Speech API Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Stop listening on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Google Chrome, MS Edge, or Safari!");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error:", e.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          const resultIndex = event.resultIndex;
          const transcript = event.results[resultIndex][0].transcript;
          if (transcript) {
            setNotes(prev => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();
            });
          }
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  // List search & filters
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // AI Code analysis states
  const [selectedProblemForAi, setSelectedProblemForAi] = useState<DsaProblem | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Pomodoro Timer States
  const [timerMode, setTimerMode] = useState<"work" | "break">("work");
  const [timerTimeLeft, setTimerTimeLeft] = useState(25 * 60);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [timerCompletedCount, setTimerCompletedCount] = useState(0);
  const [autoLogNotification, setAutoLogNotification] = useState<string | null>(null);

  // Pre-sets
  const timerDuration = {
    work: 25 * 60,
    break: 5 * 60,
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerIsRunning) {
      timerRef.current = setInterval(() => {
        setTimerTimeLeft((prev) => {
          if (prev <= 1) {
            handleLocalTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerIsRunning, timerMode]);

  const handleLocalTimerComplete = () => {
    setTimerIsRunning(false);
    
    // Play sound safely using the Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880; // A5 note
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (_) {}

    if (timerMode === "work") {
      setTimerCompletedCount((prev) => prev + 1);
      
      // Auto-log the session!
      onAddLog(
        "dsa",
        `DSA Focus Session #${timerCompletedCount + 1}`,
        25,
        "Completed a 25-minute highly focused DSA theory and algorithms solving streak."
      );
      
      // Set temporary notification
      setAutoLogNotification(`Session #${timerCompletedCount + 1} finalized! 25 minutes automatically logged to DSA logs.`);
      setTimeout(() => setAutoLogNotification(null), 5000);
      
      // Toggle to break
      setTimerMode("break");
      setTimerTimeLeft(timerDuration.break);
    } else {
      // Break over, back to work
      setTimerMode("work");
      setTimerTimeLeft(timerDuration.work);
    }
  };

  const handleStartPauseTimer = () => {
    setTimerIsRunning(!timerIsRunning);
  };

  const handleResetTimer = () => {
    setTimerIsRunning(false);
    setTimerTimeLeft(timerMode === "work" ? timerDuration.work : timerDuration.break);
  };

  const handleSwitchMode = (mode: "work" | "break") => {
    setTimerIsRunning(false);
    setTimerMode(mode);
    setTimerTimeLeft(mode === "work" ? timerDuration.work : timerDuration.break);
  };

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Topic Options
  const coreTopics = ["Arrays", "Two Pointers", "Sliding Window", "Hash Maps", "Stacks/Queues", "Binary Search", "Trees/BST", "Graphs", "Backtracking", "Dynamic Programming", "Greedy", "Recursion", "Bit Manipulation", "Other"];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!problemName.trim()) return;

    onAddProblem({
      problemName,
      platform,
      topic,
      difficulty,
      status,
      solutionCode,
      notes,
      url,
      dateSolved
    });

    // Reset Form
    setProblemName("");
    setSolutionCode("");
    setNotes("");
    setUrl("");
    setShowAddForm(false);
  };

  const runAiAnalysis = async (problem: DsaProblem) => {
    if (!problem.solutionCode) {
      setAiError("Please include code in this problem entry to run AI diagnostics.");
      return;
    }

    setSelectedProblemForAi(problem);
    setAiLoading(true);
    setAiError("");
    setAiAnalysisResult(null);

    try {
      const response = await fetch("/api/gemini/analyze-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: problem.solutionCode,
          problemName: problem.problemName,
          language: "Typescript / Python / C++",
          topic: problem.topic
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI analyzer.");
      }

      const data = await response.json();
      setAiAnalysisResult(data);
    } catch (err: any) {
      setAiError(err.message || "An error occurred with Gemini analyzer.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered List calculations
  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.problemName.toLowerCase().includes(search.toLowerCase()) || 
                          p.topic.toLowerCase().includes(search.toLowerCase()) || 
                          p.platform.toLowerCase().includes(search.toLowerCase());
    
    const matchesDifficulty = filterDifficulty === "all" || p.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Section split: Search Controls (Left) & Built-in Pomodoro Timer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Search controls card */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> DSA Problem Solver
            </h3>
            <p className="text-xs text-slate-500">Practice algorithms, track asymptotes, and run AI Diagnostics.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-900">
            <div className="flex items-center gap-3 w-full sm:max-w-xs relative">
              <Search className="absolute left-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search solutions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-2 rounded-xl border border-slate-850">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterDifficulty}
                  onChange={e => setFilterDifficulty(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none pr-1 uppercase font-semibold"
                >
                  <option value="all" className="bg-slate-900">Diff All</option>
                  <option value="easy" className="bg-slate-900 text-emerald-400">Easy</option>
                  <option value="medium" className="bg-slate-900 text-amber-500">Medium</option>
                  <option value="hard" className="bg-slate-900 text-rose-500">Hard</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl active:scale-95 transition-all outline-none ml-auto"
              >
                <Plus className="w-4 h-4" />
                Log Problem
              </button>
            </div>
          </div>
        </div>

        {/* Built-in Pomodoro Tracker card */}
        <div id="dsa-pomodoro" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-lg">
          {/* Background splash */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl pointer-events-none" />

          {/* Title line */}
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold font-mono uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${timerIsRunning ? 'animate-pulse' : ''}`} />
              DSA Focus Session Timer
            </h4>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-500 font-mono">
              🎓 {timerCompletedCount} Solved
            </span>
          </div>

          {/* Auto notifications */}
          {autoLogNotification ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-xl text-[10px] leading-relaxed mb-3 animated scale-in">
              {autoLogNotification}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 leading-normal mb-3">
              Completing a 25-minute study circle automatically registers your active focus time in database.
            </p>
          )}

          {/* Main Controls Grid */}
          <div className="flex items-center justify-between gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-900">
            {/* Countdown numerals */}
            <div className="text-center font-mono shrink-0 pl-2">
              <span className="text-2xl font-black text-white tracking-tighter block leading-none">
                {formatTimerTime(timerTimeLeft)}
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest block mt-1">
                {timerMode === "work" ? "Focus Core" : "Rest Break"}
              </span>
            </div>

            {/* Switch & triggers columns */}
            <div className="flex-1 space-y-2">
              {/* Presets switcher buttons */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleSwitchMode("work")}
                  className={`text-[9px] py-1 rounded-lg font-bold uppercase tracking-wide transition-all ${
                    timerMode === "work"
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Focus
                </button>
                <button
                  onClick={() => handleSwitchMode("break")}
                  className={`text-[9px] py-1 rounded-lg font-bold uppercase tracking-wide transition-all ${
                    timerMode === "break"
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Break
                </button>
              </div>

              {/* Play & Reset buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartPauseTimer}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1 transition-all ${
                    timerIsRunning
                      ? "bg-slate-800 hover:bg-slate-700"
                      : timerMode === 'work' ? "bg-indigo-600 hover:bg-indigo-500" : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  {timerIsRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  {timerIsRunning ? "Pause" : "Start"}
                </button>
                <button
                  onClick={handleResetTimer}
                  className="p-1.5 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-400 rounded-lg transition-all"
                  title="Reset Counter"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Split panel if AI is open */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Problems List section */}
        <div className={`${selectedProblemForAi ? "xl:col-span-7" : "xl:col-span-12"} space-y-4`}>
          
          {/* Expanded logging form */}
          {showAddForm && (
            <div className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 animated slide-in shadow-lg">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" /> Log DSM/Algorithms Solved Problem
              </h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Problem Title</label>
                    <input
                      type="text"
                      required
                      value={problemName}
                      onChange={e => setProblemName(e.target.value)}
                      placeholder="e.g. 2Sum, Merge Sorted Arrays"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Topic Category</label>
                    <select
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-300"
                    >
                      {coreTopics.map(t => (
                        <option key={t} value={t} className="bg-slate-950">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Platform</label>
                    <input
                      type="text"
                      value={platform}
                      onChange={e => setPlatform(e.target.value)}
                      placeholder="LeetCode, GFG, etc."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value as ProblemDifficulty)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as ProblemStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="solved">Solved</option>
                      <option value="revise_needed">To Revise</option>
                      <option value="attempted">Attempted</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Date Solved</label>
                    <input
                      type="date"
                      value={dateSolved}
                      onChange={e => setDateSolved(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Problem URL (Optional)</label>
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://leetcode.com/problems/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Your Solution Code</label>
                  <textarea
                    value={solutionCode}
                    onChange={e => setSolutionCode(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 placeholder:text-slate-700"
                    placeholder="Paste C++, Python, Java, or TypeScript solution here..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Approach & Technical Notes</label>
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        isListening 
                          ? "bg-rose-550/20 border border-rose-500 text-rose-400 animate-pulse" 
                          : "bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-300"
                      }`}
                      title={isListening ? "Stop voice dictation" : "Dictate with voice"}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3 h-3 text-rose-400" />
                          <span>Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3 text-indigo-400" />
                          <span>Voice Dictate</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder={isListening ? "Listening... Speak clearly to dictate study notes directly." : "Mention time complexities, memory pointers, or issues faced..."}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-550"
                  />
                  {isListening && (
                    <p className="text-[10px] text-rose-400 font-mono mt-1 animate-pulse">
                      🎙️ Recording in progress. Talk to record your study session learnings automatically.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Save Log
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List display */}
          {filteredProblems.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-2 text-slate-700" />
              <p className="font-semibold text-sm">No recorded DSA problems found</p>
              <p className="text-xs text-slate-600 mt-1">Refine your search or create a new entry!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProblems.map(problem => (
                <div
                  key={problem.id}
                  className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 p-6 rounded-3xl flex flex-col md:flex-row justify-between gap-4 transition-all relative overflow-hidden group shadow-md"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        problem.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
                        problem.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {problem.difficulty}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full">
                        {problem.topic}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {problem.platform}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                        {problem.problemName}
                        {problem.url && (
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-indigo-400"
                            title="Visit platform link"
                          >
                            <ExternalLink className="w-3.5 h-3.5 inline" />
                          </a>
                        )}
                      </h4>
                      {problem.notes && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {problem.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                      <span>Solved: {problem.dateSolved}</span>
                      {problem.solutionCode && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400/90 font-semibold flex items-center gap-0.5">
                            <Code className="w-3.5 h-3.5" /> Code Recorded
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex md:flex-col justify-end gap-2 shrink-0 md:justify-center border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
                    <button
                      onClick={() => runAiAnalysis(problem)}
                      disabled={!problem.solutionCode}
                      className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                        problem.solutionCode
                          ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                          : 'text-slate-600 border border-slate-800 bg-slate-900/40 cursor-not-allowed'
                      }`}
                      title={problem.solutionCode ? "Run AI Optimization Diagnostics" : "Code element missing to run AI"}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Review
                    </button>
                    <button
                      onClick={() => onDeleteProblem(problem.id)}
                      className="text-xs text-slate-500 hover:text-rose-400 px-3 py-1.5 hover:bg-rose-500/10 rounded-xl transition-all font-semibold"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Complexity Diagnostics Panel (Sidebar-style when active) */}
        {selectedProblemForAi && (
          <div className="xl:col-span-5 backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl select-none animated scale-in sticky top-24 self-start max-h-[80vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">StudyBuddy AI Analysis</h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">Evaluating {selectedProblemForAi.problemName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProblemForAi(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            {aiLoading ? (
              <div className="py-12 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-indigo-300">Calculating memory complexity...</p>
                  <p className="text-[10px] text-slate-500 italic block">"Synthesizing optimal solution..."</p>
                </div>
              </div>
            ) : aiError ? (
              <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 p-4 rounded-xl text-xs space-y-2">
                <p className="font-semibold">Analysis Failed</p>
                <p>{aiError}</p>
              </div>
            ) : aiAnalysisResult ? (
              <div className="space-y-4 select-text">
                
                {/* Micro badge cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Time Complexity</span>
                    <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5 block">{aiAnalysisResult.timeComplexity}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Auxiliary Space</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">{aiAnalysisResult.spaceComplexity}</span>
                  </div>
                </div>

                {/* Optimizable warning */}
                {aiAnalysisResult.canBeOptimized && (
                  <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 p-3 rounded-xl text-[11px] font-medium leading-relaxed">
                    🎯 Optimization Available: A more efficient asymptotic algorithm exists. Check out the suggestion below.
                  </div>
                )}

                {/* Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 block">Critical Suggestions</span>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-none">
                    {aiAnalysisResult.optimizationSuggestions?.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-1.5 items-start">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Boundary checks */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 block">Edge Cases to Guard</span>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-none">
                    {aiAnalysisResult.edgeCasesToConsider?.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-1.5 items-start">
                        <CornerDownRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Code Improvement solution */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>Improved Code Architecture</span>
                    <button
                      onClick={() => handleCopyCode(aiAnalysisResult.correctedOrImprovedCode)}
                      className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded hover:bg-indigo-500 hover:text-white transition-all font-medium"
                    >
                      {copiedCode ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-300 leading-normal max-h-56">
                    {aiAnalysisResult.correctedOrImprovedCode}
                  </pre>
                </div>

                {/* Detailed description */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-slate-300 block">Tutor's Breakdown</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {aiAnalysisResult.explanation}
                  </p>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-slate-600 text-xs">
                Click AI Review on any solve log.
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
