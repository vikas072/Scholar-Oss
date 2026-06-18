import { useState, useEffect, FormEvent } from "react";
import { Sparkles, RefreshCw, Calendar, CheckCircle2, ChevronRight, HelpCircle, BookOpen, Target, Download, Rocket } from "lucide-react";

interface AIPracticeAdvisorProps {
  onSaveRoadmap?: (roadmap: any) => void;
  savedRoadmaps?: any[];
  onDeleteRoadmap?: (idx: number) => void;
}

export default function AIPracticeAdvisor({ onSaveRoadmap, savedRoadmaps = [], onDeleteRoadmap }: AIPracticeAdvisorProps) {
  const [dsaTopic, setDsaTopic] = useState("Graphs (BFS/DFS, Dijkstra's)");
  const [webDevTopic, setWebDevTopic] = useState("React Context API and custom state management hooks");
  const [cseTopic, setCseTopic] = useState("DBMS: Normalization, OS: Round-robin scheduling");
  const [targetDays, setTargetDays] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  
  // Set default roadmap from saved or local storage if exists
  useEffect(() => {
    if (savedRoadmaps && savedRoadmaps.length > 0 && !roadmap) {
      setRoadmap(savedRoadmaps[savedRoadmaps.length - 1]);
      setIsSaved(true);
    }
  }, [savedRoadmaps]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRoadmap(null);
    setIsSaved(false);

    try {
      const response = await fetch("/api/gemini/create-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dsaTopic,
          webDevTopic,
          cseTopic,
          targetDays
        })
      });

      if (!response.ok) {
        throw new Error("Tutor advisory was congested. Please try again.");
      }

      const data = await response.json();
      setRoadmap(data);
    } catch (err: any) {
      setError(err.message || "Failed to organize your roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const saveToProfile = () => {
    if (!roadmap || !onSaveRoadmap) return;
    onSaveRoadmap(roadmap);
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Input query parameters form */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Calendar className="w-64 h-64 text-indigo-500" />
        </div>

        <div className="relative z-10 space-y-4">
          <div>
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              AI Customized Study Advisor
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select specific DSA topics and frontend/backend stacks. Our AI tutor will map out a custom step-by-step daily build checklist.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* DSA Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">DSA Concept to Master</label>
                <input
                  type="text"
                  required
                  value={dsaTopic}
                  onChange={e => setDsaTopic(e.target.value)}
                  placeholder="e.g. Sliding Window, Graphs, Dynamic Programming"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Web Dev Focus input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Web Dev Focus Stack / Tech</label>
                <input
                  type="text"
                  required
                  value={webDevTopic}
                  onChange={e => setWebDevTopic(e.target.value)}
                  placeholder="e.g. Tailwind configuration, JWT inside Express, NextJS"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Core B.Tech CSE Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">CSE Class Exam Prep / Lab (Optional)</label>
                <input
                  type="text"
                  value={cseTopic}
                  onChange={e => setCseTopic(e.target.value)}
                  placeholder="e.g. DBMS SQL, Operating Systems Page Replacement, Compiler Lexer"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

            </div>

            {/* Slider Duration setting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Target Mastery Timeline</span>
                  <span className="font-mono text-indigo-400 font-bold">{targetDays} Days study</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="14"
                  step="1"
                  value={targetDays}
                  onChange={e => setTargetDays(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-950 h-1 rounded-lg cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Rocket className="w-3.5 h-3.5" />
                    Instruct AI Coach
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Main results board */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Loader skeleton / Error banner */}
        {loading && (
          <div className="xl:col-span-3 bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Advisory Algorithm Engaged</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">"Evaluating constraints, building practical micro-build assignments, and structuring milestones. Hang tight..."</p>
            </div>
          </div>
        )}

        {error && (
          <div className="xl:col-span-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 p-4 rounded-xl text-xs">
            <p className="font-bold mb-1">Could not map syllabus</p>
            <p>{error}</p>
          </div>
        )}

        {/* Dynamic Syllabus Grid */}
        {roadmap && !loading && (
          <>
            {/* 2-Column Left: Roadmap title, Day lists */}
            <div className="xl:col-span-2 space-y-6">
              
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
                
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold font-display text-white">{roadmap.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {roadmap.overview}
                    </p>
                  </div>

                  {onSaveRoadmap && (
                    <button
                      onClick={saveToProfile}
                      disabled={isSaved}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        isSaved
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/10 cursor-default'
                          : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isSaved ? "Saved to Core Planner" : "Save Roadmap"}
                    </button>
                  )}
                </div>

                {/* Daily Blocks sequential columns */}
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Daily Sequence study Targets</span>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {roadmap.days?.map((dayObj: any) => (
                      <div key={dayObj.day} className="bg-slate-950 border border-slate-850 rounded-xl p-5 hover:border-slate-800 transition-all">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-900 pb-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {dayObj.day}
                          </div>
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Day {dayObj.day} Focus Tracker</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* DSA segment */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">DSA & Algorithm task</span>
                            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                              {dayObj.dsaFocus}
                            </p>
                          </div>

                          {/* Web Dev segment */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">Web Build task</span>
                            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                              {dayObj.webDevFocus}
                            </p>
                          </div>
                        </div>

                        {/* Tip block */}
                        {dayObj.tip && (
                          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 mt-4 flex items-start gap-1.5">
                            <BookOpen className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-400 italic">
                              <strong>Tutor Tip:</strong> {dayObj.tip}
                            </p>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>

            {/* 1-Column Right: Milestones list */}
            <div className="xl:col-span-1 space-y-6">
              
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Target className="w-4 h-4 text-indigo-400" /> Mastery Exit Milestones
                </h4>

                <p className="text-[11px] text-slate-400 leading-normal mb-4">
                  Once you achieve these metrics, you have verified structural acquisition of these technical principles:
                </p>

                <div className="space-y-2.5">
                  {roadmap.milestones?.map((item: string, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start bg-slate-950/60 p-3 rounded-xl border border-slate-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300 font-semibold leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved items history */}
              {savedRoadmaps && savedRoadmaps.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400" /> Saved Roadmaps
                  </h4>

                  <div className="space-y-2">
                    {savedRoadmaps.map((r, rIdx) => (
                      <div key={rIdx} className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg text-xs font-medium border border-slate-950 flex-wrap">
                        <span className="text-slate-300 truncate max-w-[140px] font-semibold">{r.title}</span>
                        <div className="flex gap-1.5 ml-auto">
                          <button
                            onClick={() => setRoadmap(r)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Load
                          </button>
                          {onDeleteRoadmap && (
                            <button
                              onClick={() => onDeleteRoadmap(rIdx)}
                              className="text-[10px] text-rose-500 hover:text-rose-400 font-semibold"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* Blank state */}
        {!roadmap && !loading && (
          <div className="xl:col-span-3 text-center py-24 bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-500 empty-state">
            <HelpCircle className="w-12 h-12 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold text-sm">No Active Study Roadmap Plan Loaded</p>
            <p className="text-xs text-slate-600 mt-1">Configure your target DSA topics and Web Tech above to let our AI Coach build a customized plan for you!</p>
          </div>
        )}

      </div>

    </div>
  );
}
