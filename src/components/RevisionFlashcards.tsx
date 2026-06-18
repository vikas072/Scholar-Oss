import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Layers, 
  RotateCcw, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  ChevronRight, 
  Trophy, 
  BookOpenCheck,
  Zap,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Flashcard {
  id: string;
  subject: "dsa" | "web_dev" | "os" | "dbms" | "custom";
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  lastScore?: "know" | "unsure"; // study tracking
}

const INITIAL_DECKS: Flashcard[] = [
  // DSA Concepts
  {
    id: "fc-1",
    subject: "dsa",
    question: "What is the primary difference between a Hash Map and a Binary Search Tree (BST) in average vs worst-case lookup?",
    answer: "A Hash Map operates in O(1) average lookup time via key hashing, but can degrade to O(N) due to hash collisions. A Self-Balancing BST guarantees O(log N) lookup time in both average and worst cases by maintaining an ordered structure.",
    difficulty: "medium"
  },
  {
    id: "fc-2",
    subject: "dsa",
    question: "When is Dijkstra's shortest path algorithm guaranteed to fail or produce suboptimal paths?",
    answer: "Dijkstra's search path fails if the graph contains any negative weight edges, because it assumes that visiting a vertex yields the minimum cost step, preventing back-evaluation of paths that get lighter later.",
    difficulty: "hard"
  },
  
  // OS Mechanics
  {
    id: "fc-3",
    subject: "os",
    question: "Explain the classic difference between a Mutex and a Semaphore.",
    answer: "A Mutex is a locking mechanism used to synchronize access to a single resource by one thread (owner-controlled). A Semaphore is a signaling mechanism using counter tokens, allowing multiple threads up to a configured pool count limit.",
    difficulty: "medium"
  },
  {
    id: "fc-4",
    subject: "os",
    question: "What are the four necessary Coffman Conditions required for a Deadlock state to occur?",
    answer: "1. Mutual Exclusion (non-shareable resources)\n2. Hold and Wait (holding resource while waiting for another)\n3. No Preemption (cannot forcefully reclaim resources)\n4. Circular Wait (cycle of thread resource requests)",
    difficulty: "hard"
  },

  // DBMS Normalization
  {
    id: "fc-5",
    subject: "dbms",
    question: "What does it take for a relational DATABASE schema to be in Third Normal Form (3NF)?",
    answer: "The table must first be in 2NF, and additionally, every non-prime attributes must be non-transitively dependent on the primary key. In simpler terms: every column must depend directly on 'the key, the whole key, and nothing but the key'.",
    difficulty: "medium"
  },
  {
    id: "fc-6",
    subject: "dbms",
    question: "Explain the difference between a Clustered Index and a Non-Clustered Index.",
    answer: "A Clustered Index physically reorders the actual row records on storage to match the index key order (only 1 per table). A Non-Clustered Index maintains a separate sorted index structure pointing to the physical locations of actual records.",
    difficulty: "hard"
  },

  // Web Development
  {
    id: "fc-7",
    subject: "web_dev",
    question: "What is the difference between client-side rendering (CSR) and static site generation (SSG) in SEO metrics?",
    answer: "CSR serves an empty HTML shell requiring browser Javascript execution (often dragging SEO ranking down/slowing initial feed). SSG pre-renders standard static HTML documents on build time, providing instant static loads.",
    difficulty: "easy"
  },
  {
    id: "fc-8",
    subject: "web_dev",
    question: "Explain how React batch state updates work behind the scenes in event handlers.",
    answer: "React groups state modifications triggered inside concurrent event handlers into a single re-render block to avoid unnecessary UI redraws, executing batch updates asynchronously.",
    difficulty: "medium"
  }
];

const SUBJECT_LABELS = {
  dsa: { label: "Data Structures & Algos", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
  web_dev: { label: "Web Tech / Fullstack", color: "text-sky-400 bg-sky-500/10 border-sky-500/25" },
  os: { label: "Operating Systems", color: "text-rose-400 bg-rose-500/10 border-rose-500/25" },
  dbms: { label: "Database Systems", color: "text-amber-400 bg-amber-500/10 border-amber-500/25" },
  custom: { label: "Personal Card Definition", color: "text-purple-400 bg-purple-500/10 border-purple-500/25" }
};

export default function RevisionFlashcards() {
  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("workspace_revision_flashcards");
    if (saved) return JSON.parse(saved);
    return INITIAL_DECKS;
  });

  const [activeSubject, setActiveSubject] = useState<"all" | "dsa" | "web_dev" | "os" | "dbms" | "custom">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  // Custom Card Input States
  const [showAddDeckForm, setShowAddDeckForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newSubject, setNewSubject] = useState<Flashcard["subject"]>("custom");
  const [newDifficulty, setNewDifficulty] = useState<Flashcard["difficulty"]>("medium");

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("workspace_revision_flashcards", JSON.stringify(cards));
  }, [cards]);

  // Filtered Cards based on Active selection
  const filteredCards = cards.filter(c => activeSubject === "all" || c.subject === activeSubject);

  // Restart reviewer deck
  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % (filteredCards.length || 1));
    }, 150);
  };

  const handleGradeCard = (status: "know" | "unsure") => {
    const currCard = filteredCards[currentIndex];
    if (!currCard) return;

    // Update study state metrics
    setCards(prev => prev.map(c => c.id === currCard.id ? { ...c, lastScore: status } : c));
    
    // Accumulate score metrics
    if (status === "know") {
      setStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
    }

    // Advance after grading
    handleNext();
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard: Flashcard = {
      id: `fc-${Date.now()}`,
      subject: newSubject,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      difficulty: newDifficulty
    };

    setCards(prev => [newCard, ...prev]);
    setNewQuestion("");
    setNewAnswer("");
    setNewSubject("custom");
    setNewDifficulty("medium");
    setShowAddDeckForm(false);
    // Switch to category to review
    if (newSubject !== "custom") {
      setActiveSubject(newSubject);
    } else {
      setActiveSubject("custom");
    }
    setCurrentIndex(0);
  };

  const handleDeleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this revision card from training deck?")) return;
    
    setCards(prev => prev.filter(c => c.id !== id));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetProgress = () => {
    setStats({ correct: 0, total: 0 });
    setCards(prev => prev.map(c => ({ ...c, lastScore: undefined })));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentCard = filteredCards[currentIndex];

  return (
    <div id="revision-flashcards-interactive-deck" className="backdrop-blur-md bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Panel title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-880 pb-4 mb-6 relative z-10 text-left">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <BookOpenCheck className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform animate-pulse" />
            CS Deep Core Revision Cards
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Test memory retention on Operating Systems, DBMS Normalization, DSA & Web structures</p>
        </div>

        <div className="flex gap-2">
          {/* Action form trigger */}
          <button
            type="button"
            onClick={() => setShowAddDeckForm(prev => !prev)}
            className="px-3.5 py-1.5 border border-indigo-500/25 bg-indigo-500/5 text-indigo-300 font-mono font-bold text-[10.5px] rounded-xl hover:bg-indigo-500/15 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider select-none"
          >
            {showAddDeckForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} Create Flashcard
          </button>
        </div>
      </div>

      {/* Filters Selectors Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Subject Scope:</span>
        {(["all", "dsa", "web_dev", "os", "dbms", "custom"] as const).map((sub) => {
          const isActive = activeSubject === sub;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => {
                setActiveSubject(sub);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`text-[10.5px] font-bold px-3 py-1.5 rounded-xl border capitalize transition-all select-none cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold border-indigo-500 shadow-lg shadow-indigo-500/10"
                  : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300 hover:bg-slate-900/50"
              }`}
            >
              {sub === "all" ? "📚 Read All" : sub === "web_dev" ? "🌐 Web Dev" : sub.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Content Form container */}
      <AnimatePresence>
        {showAddDeckForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddNewCard}
            className="bg-slate-950 border border-slate-850 p-5 rounded-2xl mb-6 relative overflow-hidden text-left space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Build Custom Space-Repetition Card
              </span>
              <button
                type="button"
                onClick={() => setShowAddDeckForm(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Question / Term Prompt</label>
                <input
                  type="text"
                  placeholder="e.g. What is functional dependency in databases?"
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Answer / Conceptual definition</label>
                <textarea
                  rows={2}
                  placeholder="Provide structured metrics, examples, or summaries..."
                  value={newAnswer}
                  onChange={e => setNewAnswer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Quiz Subject</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value as Flashcard["subject"])}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="custom">Custom Personal Category</option>
                    <option value="dsa">DSA</option>
                    <option value="web_dev">Web Dev</option>
                    <option value="os">OS</option>
                    <option value="dbms">DBMS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Card Complexity</label>
                  <select
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value as Flashcard["difficulty"])}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="easy">Easy Foundation</option>
                    <option value="medium">Medium Standard</option>
                    <option value="hard">Hard Complex Expert</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-900">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer select-none"
              >
                Compile and File Card
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Flashcard review grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Play/Practice Deck Canvas */}
        <div className="lg:col-span-3 space-y-4">
          {filteredCards.length === 0 ? (
            <div className="py-12 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center">
              <HelpCircle className="w-10 h-10 text-slate-600 stroke-1" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-400">Empty review space</h5>
                <p className="text-[10.5px] text-slate-600 max-w-xs px-4">There are no cards found matches '{activeSubject}' filter. Type a card above to begin review lists!</p>
              </div>
            </div>
          ) : (
            currentCard && (
              <div className="space-y-4">
                {/* 3D-Interactive Flipping Board */}
                <div 
                  onClick={() => setIsFlipped(prev => !prev)}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 md:p-8 cursor-pointer relative min-h-[190px] flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-xl group/card relative"
                >
                  {/* Decorative Flip hint badge */}
                  <div className="absolute top-3.5 right-4 flex items-center gap-1.5 text-[9px] font-mono text-slate-500 group-hover/card:text-indigo-400 font-bold transition-all transition-colors uppercase">
                    <Zap className="w-3 h-3 text-indigo-400 animate-pulse" />
                    <span>Click card to Flip / toggle definition</span>
                  </div>

                  <div className="text-left space-y-3.5">
                    {/* Subject Pill metadata */}
                    <div className="flex items-center justify-between gap-4">
                      {currentCard.subject && (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9.5px] font-bold font-mono border px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                            (SUBJECT_LABELS[currentCard.subject] || SUBJECT_LABELS.custom).color
                          }`}>
                            {(SUBJECT_LABELS[currentCard.subject] || SUBJECT_LABELS.custom).label}
                          </span>
                          
                          <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded ${
                            currentCard.difficulty === "easy" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : currentCard.difficulty === "hard"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {currentCard.difficulty}
                          </span>
                        </div>
                      )}

                      {/* Delete item */}
                      {currentCard.subject === "custom" && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCard(currentCard.id, e)}
                          className="p-1 px-2.5 bg-slate-900 hover:bg-rose-950 hover:border-rose-800 border border-slate-800 text-slate-500 hover:text-rose-400 rounded-lg text-[9px] font-mono font-bold transition-all"
                          title="Erase custom card entry"
                        >
                          Erase
                        </button>
                      )}
                    </div>

                    {/* Question vs Answer render */}
                    <AnimatePresence mode="wait">
                      {!isFlipped ? (
                        <motion.div
                          key="front"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="text-white text-sm md:text-base font-bold tracking-wide leading-relaxed font-display text-left max-w-2xl"
                        >
                          Q: {currentCard.question}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="back"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-indigo-200 text-xs md:text-sm font-semibold tracking-wide leading-relaxed font-mono text-left whitespace-pre-wrap border-l-2 border-indigo-500/80 pl-3 md:pl-4"
                        >
                          A: {currentCard.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Flip guidance footer indicators */}
                  <div className="flex items-center justify-between border-t border-slate-900/80 pt-3 mt-4 text-[10px] font-mono text-slate-500">
                    <div className="flex items-center gap-1">
                      <span>Card Index:</span>
                      <strong className="text-white">{currentIndex + 1}</strong>
                      <span>/</span>
                      <strong>{filteredCards.length}</strong>
                    </div>

                    <div className="flex items-center gap-1 shadow-sm px-2 py-0.5 rounded-lg bg-slate-950 font-bold border border-slate-900">
                      <span>State:</span>
                      <span className={isFlipped ? "text-indigo-400" : "text-emerald-400"}>
                        {isFlipped ? "DEFINITION SHOWN" : "QUESTION PROMPT"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Left/Right Arrows Controls Area & Grades check */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/30 border border-slate-850 p-3 rounded-2xl">
                  {/* Arrows navigation controls */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer select-none active:scale-95"
                    >
                      ← Back
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsFlipped(prev => !prev)}
                      className="text-[10.5px] font-mono font-bold px-3 py-1 bg-slate-900/60 border border-slate-850 text-slate-400 hover:text-indigo-400 transition-all rounded-lg select-none"
                    >
                      🛡️ Toggle Flip
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer select-none active:scale-95"
                    >
                      Next →
                    </button>
                  </div>

                  {/* Space-repetition validation scoring grading actions */}
                  {isFlipped && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2.5 w-full sm:w-auto border-t sm:border-t-0 border-slate-850/60 pt-3 sm:pt-0"
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide">Did you recall?</span>
                      <button
                        type="button"
                        onClick={() => handleGradeCard("unsure")}
                        className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-bold text-xs px-3 py-1.5 rounded-xl transition-all select-none cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGradeCard("know")}
                        className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all select-none cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Perfect
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Training Scoreboard and Stats Sidebar */}
        <div className="bg-slate-950/60 border border-slate-850 p-4.5 rounded-2xl text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h4 className="text-[11.5px] font-mono font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Retain Scoreboard
            </h4>
            <button
              type="button"
              onClick={resetProgress}
              className="text-[9px] font-mono font-bold text-slate-500 hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>

          {/* Correct score details */}
          <div className="grid grid-cols-2 gap-3.5 text-center">
            <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl">
              <span className="text-[9px] font-extrabold text-slate-500 block uppercase tracking-wider">Perfect Count</span>
              <span className="text-xl font-mono font-extrabold text-emerald-400 block mt-1">{stats.correct}</span>
            </div>
            
            <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl">
              <span className="text-[9px] font-extrabold text-slate-500 block uppercase tracking-wider">Ratio Checked</span>
              <span className="text-xl font-mono font-extrabold text-indigo-300 block mt-1">
                {stats.total > 0 ? `${Math.round((stats.correct / stats.total) * 100)}%` : "0%"}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/20 p-3.5 border border-slate-850 rounded-xl space-y-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
              <Info className="w-3.5 h-3.5 text-indigo-400" /> Spacer Memorization Method
            </div>
            <p className="text-[9.5px] text-slate-500 leading-normal">
              Active recall is the most efficient study technique for CSE exams and interview preparation. Filter by subject, state answer internally, toggle the flip, and grade yourself accordingly!
            </p>
          </div>

          {/* Quick list overview of categories card counts */}
          <div className="space-y-1 pt-1">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider mb-1.5">Study progress metrics:</span>
            {(["dsa", "web_dev", "os", "dbms", "custom"] as const).map((catName) => {
              const catCount = cards.filter(c => c.subject === catName).length;
              const lbl = SUBJECT_LABELS[catName] || SUBJECT_LABELS.custom;
              return (
                <div key={catName} className="flex justify-between items-center text-[10.5px] font-medium text-slate-400 hover:text-slate-200 py-1.5 border-b border-slate-950/60 font-mono">
                  <span>{catName === "web_dev" ? "Web Tech" : catName.toUpperCase()}</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded-md font-bold text-indigo-300 border border-slate-850/50">{catCount} cards</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
