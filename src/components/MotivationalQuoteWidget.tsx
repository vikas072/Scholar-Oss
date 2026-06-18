import React, { useState, useEffect } from "react";
import { Quote, RefreshCw, Terminal, Copy, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DevQuote {
  text: string;
  author: string;
  role?: string;
  context?: string;
}

const DEV_QUOTES: DevQuote[] = [
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    role: "Creator of Linux & Git",
    context: "On software construction quality."
  },
  {
    text: "The most dangerous phrase in the language is, 'We've always done it this way.'",
    author: "Grace Hopper",
    role: "Pioneer of COBOL & Computer Scientist",
    context: "On innovation and architectural transformation."
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    role: "Author & Software Refactoring Pioneer",
    context: "On collaborative clean coding standards."
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    role: "Software Architect & Consultant",
    context: "On strategic runtime algorithmic prep."
  },
  {
    text: "Before software can be reusable it first has to be usable.",
    author: "Ralph Johnson",
    role: "Design Patterns Co-author",
    context: "On pragmatic design principles."
  },
  {
    text: "Computers are good at following instructions, but not at reading your mind.",
    author: "Donald Knuth",
    role: "Author of The Art of Computer Programming",
    context: "On programmatic and compiler syntax precision."
  },
  {
    text: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    role: "Algorithmic Pioneer",
    context: "On Dijkstra's shortest paths and simplicity."
  },
  {
    text: "Your mind is for having ideas, not holding them.",
    author: "David Allen",
    role: "Productivity Expert",
    context: "On offloading trackers to systemic workspaces."
  },
  {
    text: "The best error message is the one that never shows up.",
    author: "Thomas Edison",
    role: "Inventor & Developer",
    context: "On high-level exception avoidance."
  },
  {
    text: "Focusing is about saying No.",
    author: "Steve Jobs",
    role: "Co-founder of Apple",
    context: "On prioritizing deep learning epochs over noise."
  },
  {
    text: "Premature optimization is the root of all evil.",
    author: "Donald Knuth",
    role: "Turing Award Winner",
    context: "On prioritizing readability and clean code first."
  },
  {
    text: "The computer was born to solve problems that did not exist before.",
    author: "Bill Gates",
    role: "Co-founder of Microsoft",
    context: "On evolutionary hardware engineering."
  },
  {
    text: "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
    author: "Alan Turing",
    role: "Father of Modern Computing",
    context: "On future intelligence systems."
  },
  {
    text: "I do not think write-access is a luxury, it should be a fundamental human right.",
    author: "John Carmack",
    role: "Lead Programmer of Doom & Quake",
    context: "On high-performance hacker philosophy."
  },
  {
    text: "That brain of mine is something more than merely mortal; as time will show.",
    author: "Ada Lovelace",
    role: "First Computer Programmer",
    context: "On operationalizing Babbage's analytical engine."
  },
  {
    text: "Great things are done by a series of small things brought together.",
    author: "Vincent van Gogh",
    role: "Post-Impressionist Artist",
    context: "On cumulative daily pomodoro and study log counts."
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    role: "Creator of Extreme Programming",
    context: "On software engineering lifecycle cycles."
  }
];

export default function MotivationalQuoteWidget() {
  const [quote, setQuote] = useState<DevQuote>(DEV_QUOTES[0]);
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const getRandomQuote = () => {
    setIsRotating(true);
    // Find a different quote than currently selected if list is > 1
    let newQuote = quote;
    while (newQuote.text === quote.text) {
      const idx = Math.floor(Math.random() * DEV_QUOTES.length);
      newQuote = DEV_QUOTES[idx];
    }
    
    // Animate smoothly
    setTimeout(() => {
      setQuote(newQuote);
      setCopied(false);
      setIsRotating(false);
    }, 250);
  };

  useEffect(() => {
    // Select daily quote or random quote on initial page load
    const randIdx = Math.floor(Math.random() * DEV_QUOTES.length);
    setQuote(DEV_QUOTES[randIdx]);
  }, []);

  const handleCopy = async () => {
    try {
      const shareText = `"${quote.text}" — ${quote.author}${quote.role ? ` (${quote.role})` : ""}`;
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy quote to clipboard:", err);
    }
  };

  return (
    <div 
      id="dev-motivational-quote-card" 
      className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 relative overflow-hidden shadow-lg group"
    >
      {/* Dynamic graphic rings backdrop */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-500/5 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/5 to-transparent blur-xl pointer-events-none" />

      {/* Quote Widget Panel Header & controls */}
      <div className="flex items-center justify-between border-b border-slate-810/60 pb-3 mb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-505/20 text-indigo-400 rounded-lg">
            <Quote className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Developer Wisdom</span>
            <span className="text-[11px] font-bold text-slate-300 font-display">Daily Quote of Dev Mindset</span>
          </div>
        </div>

        {/* Action icons bar */}
        <div className="flex items-center gap-1.5">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={isRotating}
            className="p-1 px-2.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80 text-slate-400 hover:text-slate-100 transition-all text-[10px] font-mono flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-40"
            title="Copy Quote details to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* New Random Quote Generator */}
          <button
            onClick={getRandomQuote}
            disabled={isRotating}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80 text-slate-400 hover:text-slate-100 transition-all cursor-pointer active:scale-95 disabled:pointer-events-none"
            title="Fetch another programmer quote"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Quote body box */}
      <div className="relative z-10 py-1 min-h-[75px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
            className="space-y-2.5"
          >
            {/* Real Quote string rendering */}
            <p className="text-sm font-sans italic text-slate-200 leading-relaxed font-medium">
              &ldquo;{quote.text}&rdquo;
            </p>

            {/* Quote author footer metadata line */}
            <div className="flex items-end justify-between gap-4 pt-1 flex-wrap">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-indigo-400 block font-display">
                  — {quote.author}
                </span>
                {quote.role && (
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {quote.role}
                  </span>
                )}
              </div>

              {quote.context && (
                <span className="text-[9px] font-mono text-slate-600 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-900/65 uppercase tracking-wide self-end hidden sm:inline-block">
                  {quote.context}
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
