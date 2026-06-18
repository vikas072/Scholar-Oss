import { useState, useEffect, FormEvent } from "react";
import { GraduationCap, Award, BookOpen, Brain, RefreshCw, CheckCircle, XCircle, ChevronRight, Sparkles, HelpCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BTechAcademicDesk() {
  // --- GPA TRACKER STATE ---
  const [semesters, setSemesters] = useState<{ id: number; label: string; score: number | null }[]>(() => {
    const saved = localStorage.getItem("btech_gpas");
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, label: "Semester I", score: 8.2 },
      { id: 2, label: "Semester II", score: 8.5 },
      { id: 3, label: "Semester III", score: 8.35 },
      { id: 4, label: "Semester IV", score: 8.9 },
      { id: 5, label: "Semester V", score: null },
      { id: 6, label: "Semester VI", score: null },
      { id: 7, label: "Semester VII", score: null },
      { id: 8, label: "Semester VIII", score: null },
    ];
  });

  const [targetCgpa, setTargetCgpa] = useState<number>(() => {
    const saved = localStorage.getItem("btech_target_cgpa");
    return saved ? Number(saved) : 9.0;
  });

  useEffect(() => {
    localStorage.setItem("btech_gpas", JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem("btech_target_cgpa", String(targetCgpa));
  }, [targetCgpa]);

  // Compute CGPA
  const calculatedCgpa = (() => {
    const scoredSems = semesters.filter(s => s.score !== null && s.score > 0);
    if (scoredSems.length === 0) return 0;
    const sum = scoredSems.reduce((acc, current) => acc + (current.score || 0), 0);
    return Number((sum / scoredSems.length).toFixed(2));
  })();

  const handleUpdateGpa = (id: number, val: string) => {
    const num = val === "" ? null : Number(val);
    if (num !== null && (num < 0 || num > 10)) return;
    setSemesters(prev => prev.map(s => s.id === id ? { ...s, score: num } : s));
  };

  // --- PLACEMENT PRACTICE STATE ---
  const [subject, setSubject] = useState<string>("any");
  const [quizMode, setQuizMode] = useState<'mcq' | 'viva'>('mcq');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [questionData, setQuestionData] = useState<{
    subject: string;
    questionText: string;
    options?: string[];
    correctOptionIndex?: number;
    conceptualExplanation: string;
  } | null>(null);

  // MCQ state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Viva state
  const [vivaResponse, setVivaResponse] = useState("");
  const [evaluatingViva, setEvaluatingViva] = useState(false);
  const [vivaResult, setVivaResult] = useState<{
    score: number;
    isCorrect: boolean;
    expertFeedback: string;
    idealKeypoints: string[];
  } | null>(null);

  const [quizError, setQuizError] = useState("");

  const fetchQuestion = async () => {
    setLoadingQuestion(true);
    setQuizError("");
    setQuestionData(null);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setVivaResponse("");
    setVivaResult(null);

    try {
      const response = await fetch("/api/gemini/placement-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_question",
          subject: subject === "any" ? "" : subject
        })
      });

      if (!response.ok) throw new Error("Our GATE practice server is busy. Let's retry.");
      const data = await response.json();
      setQuestionData(data);
    } catch (err: any) {
      setQuizError(err.message || "Failed to retrieve GATE Question");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleMCQOptionClick = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOption(idx);
    setQuizSubmitted(true);
  };

  const handleEvaluateViva = async (e: FormEvent) => {
    e.preventDefault();
    if (!vivaResponse.trim() || !questionData) return;
    setEvaluatingViva(true);
    setQuizError("");
    setVivaResult(null);

    try {
      const response = await fetch("/api/gemini/placement-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          questionText: questionData.questionText,
          userResponse: vivaResponse
        })
      });

      if (!response.ok) throw new Error("Viva reviewer took a short break. Please submit again.");
      const data = await response.json();
      setVivaResult(data);
    } catch (err: any) {
      setQuizError(err.message || "Could not evaluate your explanation.");
    } finally {
      setEvaluatingViva(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. B.TECH SGPA & CGPA MASTER CARD */}
      <div id="cgpa-tracker-desk" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-all" /> 
              B.Tech Academic CGPA Workspace
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Semesters 1-8 Grade Log & target planner</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Target CGPA:</span>
            <input
              type="number"
              min="1"
              max="10"
              step="0.05"
              value={targetCgpa}
              onChange={e => setTargetCgpa(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold w-16 focus:outline-none"
            />
          </div>
        </div>

        {/* Dynamic GPA Dashboard readouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-center relative overflow-hidden">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Cumulative CGPA
            </span>
            <span className="text-3xl font-black text-indigo-400 font-mono tracking-tight">
              {calculatedCgpa > 0 ? calculatedCgpa.toFixed(2) : "N/A"}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">/ 10.0 Scale</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-center relative">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Target Margin
            </span>
            {calculatedCgpa > 0 ? (
              <span className={`text-2xl font-black font-mono tracking-tight ${calculatedCgpa >= targetCgpa ? 'text-emerald-400' : 'text-amber-500'}`}>
                {calculatedCgpa >= targetCgpa ? `+${(calculatedCgpa - targetCgpa).toFixed(2)}` : `${(calculatedCgpa - targetCgpa).toFixed(2)}`}
              </span>
            ) : (
              <span className="text-2xl font-black text-slate-500 font-mono">--</span>
            )}
            <span className="text-[10px] font-mono text-slate-500 block mt-1.5">
              Goal: {targetCgpa.toFixed(2)} CGPA
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 px-4 py-3 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1 text-center">
              Degree Progress
            </span>
            <div className="w-full bg-slate-900 border border-slate-850 h-3 rounded-full overflow-hidden mt-1 relative">
              <motion.div 
                className="h-full bg-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(semesters.filter(s => s.score !== null).length / 8) * 100}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
              />
            </div>
            <span className="text-[9px] font-mono font-semibold text-slate-400 block text-center mt-2">
              {semesters.filter(s => s.score !== null).length} / 8 Semesters Completed
            </span>
          </div>
        </div>

        {/* Input grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {semesters.map((sem, idx) => (
            <div key={sem.id} className="bg-slate-950/40 border border-slate-850/60 p-2.5 rounded-xl text-center flex flex-col justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5 truncate">
                {sem.label.replace("Semester ", "Sem ")}
              </span>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="GPA"
                value={sem.score === null ? "" : sem.score}
                onChange={e => handleUpdateGpa(sem.id, e.target.value)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg py-1 px-1.5 text-[11px] font-mono text-center font-bold text-white focus:outline-none placeholder:text-slate-700 w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. GATE & PLACEMENT PRACTICE COMPANION */}
      <div id="gate-placement-practice-compartment" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              GATE & Technical Placement Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Master CS Engineering core concepts with real AI reviews</p>
          </div>

          {/* Subject selections */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-300 outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="any">All Core Subjects</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Database Management Systems">DBMS Databases</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Theory of Computation">TOC Theory</option>
              <option value="Compiler Design">Compiler Design</option>
              <option value="Algorithms & Complexity">Algorithms (DSALGO)</option>
              <option value="Computer Organization">COA Architecture</option>
            </select>

            <div className="flex bg-slate-950 p-0.5 border border-slate-800 rounded-lg text-[10px] font-mono font-bold">
              <button
                type="button"
                onClick={() => setQuizMode('mcq')}
                className={`px-2 py-1 rounded-md transition-all ${quizMode === 'mcq' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                MCQ Mode
              </button>
              <button
                type="button"
                onClick={() => setQuizMode('viva')}
                className={`px-2 py-1 rounded-md transition-all ${quizMode === 'viva' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-400'}`}
              >
                Viva Oral
              </button>
            </div>
          </div>
        </div>

        {/* Empty layout or launch area */}
        {!questionData && !loadingQuestion && (
          <div className="text-center py-10 bg-slate-950/40 border border-slate-850/75 rounded-2xl space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
              <Award className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <p className="text-xs font-bold text-slate-200">
                Are you ready for placement interviews & GATE?
              </p>
              <p className="text-[10px] text-slate-500 leading-normal">
                Choose {subject === 'any' ? 'any core subject' : `"${subject}"`} in {quizMode === 'mcq' ? 'Multiple Choice' : 'Oral Written Viva'} mode. We will draw dynamic conceptual questions.
              </p>
            </div>

            <button
              onClick={fetchQuestion}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Initialize Exam Session
            </button>
          </div>
        )}

        {/* Loading status bar */}
        {loadingQuestion && (
          <div className="text-center py-14 space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto stroke-1" />
            <p className="text-xs text-slate-400 font-medium">Curating expert computer science challenge...</p>
          </div>
        )}

        {/* Error bar */}
        {quizError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{quizError}</span>
          </div>
        )}

        {/* Display Active Question */}
        {questionData && (
          <div className="space-y-4">
            {/* Subject badge label */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/10 uppercase tracking-widest mt-1">
                {questionData.subject}
              </span>
              <button
                onClick={fetchQuestion}
                className="text-[9px] font-mono font-bold text-slate-500 hover:text-amber-400 px-2 py-1 rounded inline-flex items-center gap-1 bg-slate-950 border border-slate-850"
              >
                <RefreshCw className="w-3 h-3" /> Skip Question
              </button>
            </div>

            {/* Question Text */}
            <div className="bg-slate-950/40 p-4 border border-slate-850/60 rounded-xl">
              <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                {questionData.questionText}
              </p>
            </div>

            {/* MCQ MODE INTERACTION */}
            {quizMode === 'mcq' && questionData.options && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {questionData.options.map((opt, oIdx) => {
                    const isSelected = selectedOption === oIdx;
                    const isCorrectOption = questionData.correctOptionIndex === oIdx;
                    
                    let bgClass = "bg-slate-950/30 border-slate-850 hover:bg-slate-950/70 hover:border-slate-800 text-slate-300";
                    if (quizSubmitted) {
                      if (isCorrectOption) {
                        bgClass = "bg-emerald-900/20 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/5";
                      } else if (isSelected) {
                        bgClass = "bg-rose-900/20 border-rose-500/40 text-rose-300";
                      } else {
                        bgClass = "bg-slate-950/10 border-slate-900 opacity-60 text-slate-500";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={quizSubmitted}
                        onClick={() => handleMCQOptionClick(oIdx)}
                        className={`p-3 border rounded-xl text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${bgClass}`}
                      >
                        <span className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center font-mono font-bold text-[10px] text-slate-400 shrink-0 mt-0.5 border border-slate-850">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="leading-relaxed font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Conceptual feedback review */}
                <AnimatePresence>
                  {quizSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl space-y-2"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                        {selectedOption === questionData.correctOptionIndex ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Concept Solved Correctly!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span className="text-rose-400">Concept Review Needed</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        {questionData.conceptualExplanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* VIVA MODE INTERACTION */}
            {quizMode === 'viva' && (
              <div className="space-y-4">
                <form onSubmit={handleEvaluateViva} className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">Your Viva Explanation / Proof Outline</label>
                  <textarea
                    rows={3}
                    required
                    value={vivaResponse}
                    onChange={e => setVivaResponse(e.target.value)}
                    disabled={evaluatingViva}
                    placeholder="Type in your detailed explanation of the concept or outline the proof..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white focus:outline-none transition-all placeholder:text-slate-700 font-sans"
                  />
                  
                  <button
                    type="submit"
                    disabled={evaluatingViva || !vivaResponse.trim()}
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-mono font-bold px-4 py-2 rounded-xl transition-all shadow active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    {evaluatingViva ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Evaluating Answer...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Grade Explanation with AI
                      </>
                    )}
                  </button>
                </form>

                {/* Viva Grade results displaying */}
                <AnimatePresence>
                  {vivaResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-950/70 border border-slate-850 p-5 rounded-2xl space-y-4 text-left"
                    >
                      {/* Score circle & Label */}
                      <div className="flex items-center justify-between gap-4 border-b border-slate-850 pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${vivaResult.isCorrect ? 'text-emerald-400' : 'text-amber-500'}`} />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {vivaResult.isCorrect ? "Evaluation Approved" : "Partial Understanding"}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">Graded Exam Viva Response</span>
                          </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl text-center">
                          <span className="text-base font-black text-amber-400 font-mono block leading-none">{vivaResult.score}</span>
                          <span className="text-[7px] font-mono text-slate-500 uppercase font-bold">/ 10 Marks</span>
                        </div>
                      </div>

                      {/* Tutor feedback paragraph */}
                      <div>
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">Examiner Review</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                          {vivaResult.expertFeedback}
                        </p>
                      </div>

                      {/* High points / Keypoints required */}
                      {vivaResult.idealKeypoints && vivaResult.idealKeypoints.length > 0 && (
                        <div>
                          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1.5">Ideal CSE Terms & Keypoints</span>
                          <div className="flex flex-wrap gap-1.5">
                            {vivaResult.idealKeypoints.map((pt, pIdx) => (
                              <span key={pIdx} className="text-[9px] font-mono font-semibold bg-emerald-500/5 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                                {pt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
