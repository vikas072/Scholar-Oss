import { useState, FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import { WebDevLog } from "../types";
import { Code, ExternalLink, GitBranch, Terminal, Plus, Search, HelpCircle, Layers, CheckCircle2, Play, Pause, RotateCcw, Clock, Coffee, Mic, MicOff } from "lucide-react";

interface WebDevTrackerProps {
  logs: WebDevLog[];
  onAddLog: (log: Omit<WebDevLog, 'id' | 'userId' | 'createdAt'>) => void;
  onDeleteLog: (id: string) => void;
  onAddLogGeneral: (category: 'dsa' | 'web_dev', title: string, duration: number, notes: string, date?: string) => void;
}

export default function WebDevTracker({ logs, onAddLog, onDeleteLog, onAddLogGeneral }: WebDevTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [learnings, setLearnings] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [codeUrl, setCodeUrl] = useState("");
  const [dateLogged, setDateLogged] = useState(new Date().toISOString().split("T")[0]);
  const [customSkill, setCustomSkill] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

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
            setLearnings(prev => {
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

  // List search & skill filter
  const [search, setSearch] = useState("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>("all");

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
      
      // Auto-log general study duration
      onAddLogGeneral(
        "web_dev",
        `Web Dev Focus Session #${timerCompletedCount + 1}`,
        25,
        "Completed a 25-minute highly focused Web Development learning and build sprint."
      );
      
      // Auto-log to web dev specific portfolio lists
      onAddLog({
        projectTitle: `Portfolio Build Sprint #${timerCompletedCount + 1}`,
        skillsUsed: ["Vite", "React", "TypeScript"],
        learnings: "Successfully finished an undivided 25-minute Pomodoro block focusing on UI layout implementation, component states, and accessibility presets.",
        demoUrl: "",
        codeUrl: "",
        dateLogged: new Date().toISOString().split("T")[0]
      });

      // Set temporary notification
      setAutoLogNotification(`Session #${timerCompletedCount + 1} finalized! 25 minutes automatically logged to both database stores.`);
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

  const commonSkills = ["React", "TypeScript", "Tailwind CSS", "Express / Node.js", "Firebase", "SQLite / SQL", "Next.js", "Vite", "WebSockets", "CSS Grid/Flexbox", "Redux Toolkit", "REST APIs", "shadcn/ui", "PostgreSQL"];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || selectedSkills.length === 0) return;

    onAddLog({
      projectTitle,
      skillsUsed: selectedSkills,
      learnings,
      demoUrl,
      codeUrl,
      dateLogged
    });

    // Reset
    setProjectTitle("");
    setLearnings("");
    setDemoUrl("");
    setCodeUrl("");
    setSelectedSkills([]);
    setShowAddForm(false);
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && customSkill.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(customSkill.trim())) {
        setSelectedSkills([...selectedSkills, customSkill.trim()]);
      }
      setCustomSkill("");
    }
  };

  // Filtered logs calculations
  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.projectTitle.toLowerCase().includes(search.toLowerCase()) || 
                          l.learnings.toLowerCase().includes(search.toLowerCase());
    
    const matchesSkill = selectedSkillFilter === "all" || l.skillsUsed.includes(selectedSkillFilter);

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Section split: Search Controls (Left) & Built-in Pomodoro Timer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Search controls card */}
        <div className="lg:col-span-7 flex flex-col justify-between backdrop-blur-md bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl space-y-4 shadow-lg">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" /> Web Dev Portfolio Build Track
            </h3>
            <p className="text-xs text-slate-500">Log software increments, specify stack elements, and design fluid components.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-900">
            <div className="flex items-center gap-3 w-full sm:max-w-xs relative">
              <Search className="absolute left-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search web dev topics, concepts, or logs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-2 rounded-xl border border-slate-850">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedSkillFilter}
                  onChange={e => setSelectedSkillFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none pr-1 uppercase font-semibold"
                >
                  <option value="all" className="bg-slate-900">Tech Filter</option>
                  {commonSkills.map(s => (
                    <option key={s} value={s} className="bg-slate-900">{s}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl active:scale-95 transition-all outline-none ml-auto"
              >
                <Plus className="w-4 h-4" />
                Log Build Session
              </button>
            </div>
          </div>
        </div>

        {/* Built-in Pomodoro Tracker card */}
        <div id="web-pomodoro" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-lg">
          {/* Background splash */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl pointer-events-none" />

          {/* Title line */}
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold font-mono uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${timerIsRunning ? 'animate-pulse' : ''}`} />
              Web Dev Focus Session Timer
            </h4>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-500 font-mono">
              💻 {timerCompletedCount} Completed
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
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
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
                      : timerMode === 'work' ? "bg-blue-600 hover:bg-blue-500" : "bg-emerald-600 hover:bg-emerald-500"
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

      {/* Primary Content Container */}
      <div className="grid grid-cols-1 gap-6">

        {showAddForm && (
          <div className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 animated slide-in shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Code className="w-4 h-4 text-blue-400" /> Log Web Development Build Session
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Feature / Component / Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={e => setProjectTitle(e.target.value)}
                    placeholder="e.g. Implemented Express JWT Middleware, Built Kanban board"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Date Logged</label>
                  <input
                    type="date"
                    required
                    value={dateLogged}
                    onChange={e => setDateLogged(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Skills checklist tag block */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Technologies and Skills Used (Select at least 1)</label>
                <div className="flex flex-wrap gap-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {commonSkills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
                {/* Custom tags input */}
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={handleAddCustomSkill}
                    placeholder="Add other skills (type skill and press Enter)..."
                    className="w-full max-w-sm bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Live/Demo Deployment URL (Optional)</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={e => setDemoUrl(e.target.value)}
                    placeholder="https://my-app.vercel.app"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">GitHub / Code URL (Optional)</label>
                  <input
                    type="url"
                    value={codeUrl}
                    onChange={e => setCodeUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Detailed Learnings & Practical Logs</label>
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
                        <Mic className="w-3 h-3 text-blue-400" />
                        <span>Voice Dictate</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  required
                  value={learnings}
                  onChange={e => setLearnings(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 placeholder:text-slate-700"
                  placeholder={isListening ? "Listening... Speak clearly to dictate practical web development logs directly." : "Detail the challenges faced, what functions you set up, NPM configurations, folder structure, or system diagrams you structured..."}
                />
                {isListening && (
                  <p className="text-[10px] text-rose-400 font-mono mt-1 animate-pulse">
                    🎙️ Recording in progress. Speak now to transcribe your developer notes instantly.
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
                  disabled={selectedSkills.length === 0}
                  className={`text-xs font-bold px-4 py-2 rounded-xl ${
                    selectedSkills.length > 0
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Save Log
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Bento/Card Layout of Logs */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-500">
            <Terminal className="w-12 h-12 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold text-sm">No logged web dev sessions</p>
            <p className="text-xs text-slate-600 mt-1">Select a new filter or log details above to populate your portfolio!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition-all relative group overflow-hidden shadow-md"
              >
                <div>
                  
                  {/* Top line project title and delete */}
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors uppercase font-display select-text">
                      {log.projectTitle}
                    </h4>
                    
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="text-[10px] text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-rose-500/10 rounded"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Date line */}
                  <span className="text-[10px] font-mono font-medium text-slate-500 block mt-1">Logged: {log.dateLogged}</span>

                  {/* Skills capsule tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {log.skillsUsed.map(skill => (
                      <span key={skill} className="text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Conceptual learnings text */}
                  <div className="bg-slate-950/50 border border-slate-950 p-4 rounded-xl mt-4 select-text">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Concepts Mastered
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {log.learnings}
                    </p>
                  </div>

                </div>

                {/* Optional hyper buttons */}
                {(log.demoUrl || log.codeUrl) && (
                  <div className="flex items-center gap-3 border-t border-slate-800/60 mt-4 pt-3 flex-wrap">
                    {log.demoUrl && (
                      <a
                        href={log.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Demo
                      </a>
                    )}
                    {log.codeUrl && (
                      <a
                        href={log.codeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-all"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        GitHub Reference
                      </a>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
