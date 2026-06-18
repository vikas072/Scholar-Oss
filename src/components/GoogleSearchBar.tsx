import React, { useState, useEffect, useRef, FormEvent } from "react";
import { Search, Sparkles, ExternalLink, Moon, ArrowRight, History, Trash2, HelpCircle, Code2, Cpu, Globe, Terminal, X, Clipboard, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SearchLink {
  label: string;
  url: string;
}

interface ScholarSearchResponse {
  title: string;
  synthesizedAnswer: string;
  searchLinks: SearchLink[];
}

export default function GoogleSearchBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScholarSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("workspace_scholar_search_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("workspace_scholar_search_history", JSON.stringify(searchHistory));
    } catch (err) {
      console.warn("Could not save search history:", err);
    }
  }, [searchHistory]);

  const presetSuggestions = [
    "Dijkstra Time Complexity",
    "TypeScript Express Server setup",
    "React state hook re-render",
    "PostgreSQL transaction syntax"
  ];

  const handleWebSearchDirect = (engine: "google" | "mdn" | "so" | "github", customQuery?: string) => {
    const q = encodeURIComponent(customQuery || query || "React Web Dev");
    let url = "";
    if (engine === "google") {
      url = `https://www.google.com/search?q=${q}`;
    } else if (engine === "mdn") {
      url = `https://developer.mozilla.org/en-US/search?q=${q}`;
    } else if (engine === "so") {
      url = `https://stackoverflow.com/search?q=${q}`;
    } else if (engine === "github") {
      url = `https://github.com/search?q=${q}`;
    }
    
    // Save to history on manual tab redirects too
    const trimmed = (customQuery || query).trim();
    if (trimmed && !searchHistory.includes(trimmed)) {
      setSearchHistory(prev => [trimmed, ...prev].slice(0, 8));
    }

    window.open(url, "_blank");
  };

  const handleScholarSearch = async (e?: FormEvent, targetQuery?: string) => {
    if (e) e.preventDefault();
    const activeQuery = (targetQuery || query).trim();
    if (!activeQuery) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Append to query history list
    if (!searchHistory.includes(activeQuery)) {
      setSearchHistory(prev => [activeQuery, ...prev].slice(0, 8));
    }

    try {
      const res = await fetch("/api/gemini/search-ref", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: activeQuery })
      });

      if (!res.ok) {
        throw new Error("ScholarOS Search service experienced issues. Try again.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to query the live search agent.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const deleteHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    setSearchHistory(prev => prev.filter(x => x !== item));
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  // Markdown renderer mirroring StudyBuddy AI's elegant block layout
  const renderFormattedAnswer = (text: string) => {
    if (!text) return null;

    // Split text into code blocks versus regular text
    const regex = /(```[a-z0-9]*\r?\n[\s\S]*?\r?\n```)/g;
    const blocks = text.split(regex);

    return blocks.map((block, index) => {
      // If code block
      if (block.startsWith("```")) {
        const lines = block.split("\n");
        const header = lines[0] || "```";
        const language = header.replace("```", "").trim() || "code";
        const codeContent = lines.slice(1, -1).join("\n");

        return (
          <div key={index} className="border border-slate-800 rounded-xl overflow-hidden my-3 bg-slate-950 font-mono shadow-inner">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800/80 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>🖥️ {language} language</span>
              <button
                onClick={() => copyToClipboard(codeContent, index)}
                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedIndex === index ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/10" /> Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed select-text font-mono text-[11px] text-indigo-300">{codeContent}</pre>
          </div>
        );
      }

      // Format headers, bullets, inline bold indicators
      const parseInline = (line: string) => {
        const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return <code key={pIdx} className="bg-slate-950 px-1 py-0.5 rounded text-[10.5px] font-mono text-indigo-300 border border-slate-850">{part.slice(1, -1)}</code>;
          }
          return part;
        });
      };

      const lines = block.split("\n");
      return (
        <div key={index} className="space-y-1.5 text-xs text-slate-300 select-text leading-relaxed font-sans">
          {lines.map((line, lIdx) => {
            if (line.startsWith("### ")) {
              return <h4 key={lIdx} className="text-sm font-bold font-display text-indigo-300 pt-3 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-indigo-400" /> {line.replace("### ", "")}</h4>;
            }
            if (line.startsWith("## ")) {
              return <h3 key={lIdx} className="text-base font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-400 pt-4 border-b border-slate-800 pb-1">{line.replace("## ", "")}</h3>;
            }
            if (line.startsWith("# ")) {
              return <h2 key={lIdx} className="text-lg font-bold font-display text-white pt-5">{line.replace("# ", "")}</h2>;
            }
            if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
              const cleanLine = line.trim().substring(2);
              return (
                <ul key={lIdx} className="list-disc pl-5 my-0.5 space-y-1">
                  <li className="text-slate-400">{parseInline(cleanLine)}</li>
                </ul>
              );
            }
            return line.trim() === "" ? <div key={lIdx} className="h-2"></div> : <p key={lIdx} className="text-slate-400 font-sans">{parseInline(line)}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div id="integrated-google-search-panel" className="backdrop-blur-md bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
      {/* Dynamic graphic rings backdrop */}
      <div className="absolute top-0 left-0 w-44 h-44 bg-gradient-to-tr from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header description */}
      <div className="flex justify-between items-start border-b border-slate-800/60 pb-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <Globe className="w-5 h-5 text-indigo-400 animate-pulse" />
            ScholarOS ScholarSearch
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Instant web-referencing & AI knowledge synthesizer directly inside the system</p>
        </div>
        <span className="text-[10px] bg-slate-950 border border-slate-800 text-indigo-400 font-bold px-2 py-0.5 rounded-md uppercase font-mono tracking-wider">
          Double-Reference Mode
        </span>
      </div>

      {/* Primary Search Bar Form mimicking premium search boxes */}
      <form onSubmit={(e) => handleScholarSearch(e)} className="relative z-10 space-y-3">
        <div className="relative flex items-center bg-slate-950 border border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 rounded-2xl p-0.5 shadow-xl transition-all">
          <div className="pl-4 text-slate-500">
            <Search className="w-4 h-4 text-indigo-400" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type anything (e.g., 'BST balance functions', 'TypeScript express setup')..."
            className="w-full bg-transparent text-xs font-semibold text-white px-3 py-3 focus:outline-none placeholder:text-slate-600 font-sans"
          />

          <div className="flex items-center gap-1.5 pr-2">
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1.5 hover:bg-slate-900 text-slate-500 hover:text-slate-300 rounded-lg transition-all"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick launch directly to Google Search tab in one tap */}
            <button
              type="button"
              onClick={() => handleWebSearchDirect("google")}
              disabled={!query.trim()}
              className="p-1.5 hover:bg-slate-900 text-indigo-400 hover:text-indigo-300 rounded-lg border border-slate-800/40 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Search directly on Google in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dual Mode Actions Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-950 border border-indigo-700/20 disabled:border-slate-850 px-4 py-2 font-bold rounded-xl text-white disabled:text-slate-600 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/5 select-none"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : "text-yellow-400 fill-yellow-400/20"}`} />
              {isLoading ? "Synthesizing Sheets..." : "AI Synthesized Sheet"}
            </button>

            <button
              type="button"
              onClick={() => handleWebSearchDirect("google")}
              disabled={!query.trim()}
              className="bg-slate-950 hover:bg-slate-900/80 border border-slate-800 px-3 py-2 font-bold rounded-xl text-slate-300 disabled:text-slate-600 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Google Search
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500">
            <span>Or Quick-route:</span>
            <button
              type="button"
              onClick={() => handleWebSearchDirect("mdn")}
              disabled={!query.trim()}
              className="hover:text-amber-400 bg-slate-950/80 p-1.5 px-2 rounded-lg border border-slate-850 cursor-pointer disabled:opacity-40"
              title="Search on MDN"
            >
              MDN Docs
            </button>
            <button
              type="button"
              onClick={() => handleWebSearchDirect("so")}
              disabled={!query.trim()}
              className="hover:text-orange-400 bg-slate-950/80 p-1.5 px-2 rounded-lg border border-slate-850 cursor-pointer disabled:opacity-40"
              title="Search on StackOverflow"
            >
              StackOverflow
            </button>
          </div>
        </div>
      </form>

      {/* Preset Suggestion Tags */}
      {(!result && !isLoading) && (
        <div className="mt-4 pt-3 border-t border-slate-900/60 text-left">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">💡 Quick Reference Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {presetSuggestions.map((suggestion, sIdx) => (
              <button
                key={sIdx}
                onClick={() => {
                  setQuery(suggestion);
                  handleScholarSearch(undefined, suggestion);
                }}
                className="text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
              >
                <Search className="w-2.5 h-2.5 text-indigo-500" /> {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History scroll list if they have some items */}
      {searchHistory.length > 0 && !result && !isLoading && (
        <div className="mt-4 pt-3.5 border-t border-slate-900/80 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <History className="w-3.5 h-3.5 text-slate-600" /> Recent Queries
            </span>
            <button
              onClick={clearHistory}
              className="text-[10px] font-semibold text-rose-500 hover:text-rose-400 flex items-center gap-1 bg-rose-950/5 hover:bg-rose-950/25 px-2 py-0.5 rounded border border-rose-500/5"
            >
              <Trash2 className="w-2.5 h-2.5" /> Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {searchHistory.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setQuery(item);
                  handleScholarSearch(undefined, item);
                }}
                className="text-[10px] font-medium text-slate-400 hover:text-white bg-slate-950/60 border border-slate-850 rounded-lg px-2.5 py-1 cursor-pointer hover:border-slate-800 transition-all flex items-center gap-1.5"
              >
                <span className="truncate max-w-[150px]">{item}</span>
                <button
                  onClick={(e) => deleteHistoryItem(e, item)}
                  className="text-slate-600 hover:text-rose-400 p-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="mt-4 p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs rounded-2xl flex items-start gap-2 text-left animate-fade-in">
          <HelpCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Search Synthesis Failed</p>
            <p className="text-slate-400 leading-normal">{error}</p>
          </div>
        </div>
      )}

      {/* Live Loading Overlay / Spinner */}
      {isLoading && (
        <div className="mt-5 p-12 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col items-center justify-center gap-3 text-center animate-pulse">
          <div className="relative flex items-center justify-center">
            <Cpu className="w-8 h-8 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
            <Sparkles className="w-5 h-5 text-yellow-400 absolute animate-pulse" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">AI Search Engine Querying...</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
              We are querying online developers, mapping code interfaces, and compiling an interactive cheat-sheet reference for you.
            </p>
          </div>
        </div>
      )}

      {/* Search Result display sheet with beautiful inline visual scroll */}
      {result && (
        <div className="mt-5 bg-slate-950/80 border border-slate-850/80 p-5 rounded-2xl text-left space-y-4 animate-fade-in font-sans">
          
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
            <div>
              <span className="text-[9px] font-bold font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 mb-1 inline-block">
                Synthesized Developer Sheet
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight">{result.title}</h4>
            </div>

            {/* Direct Web reference links extracted */}
            {result.searchLinks && result.searchLinks.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {result.searchLinks.map((link, lIdx) => (
                  <a
                    key={lIdx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] font-mono font-bold bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-all flex items-center gap-1 select-none"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Synthesized Concept Answer code body */}
          <div className="overflow-y-auto max-h-[480px] pr-2 space-y-3 font-sans custom-scroll-area border-b border-slate-900 pb-3">
            {renderFormattedAnswer(result.synthesizedAnswer)}
          </div>

          {/* Close sheet and return */}
          <div className="flex items-center justify-between gap-3 pt-1 text-xs">
            <p className="text-[10px] text-slate-500 font-mono font-semibold">Done reading? Clear this sheet to initiate another search query</p>
            <button
              onClick={() => setResult(null)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-3py-2 py-1.5 rounded-xl border border-slate-850 hover:border-slate-700 transition-all active:scale-95 select-none"
            >
              Reset Sheet
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
