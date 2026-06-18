import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, HelpCircle, Terminal, Sparkles, User, RefreshCw, Layers, Clipboard, Check } from "lucide-react";

interface AIStudyBuddyProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
}

export default function AIStudyBuddy({ chatHistory, onSendMessage, onClearChat }: AIStudyBuddyProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt presets
  const quickPrompts = [
    { label: "B+ Trees vs B-Trees (DBMS)", text: "Explain the architectural difference between B-Trees and B+ Trees in Database Systems. Why do database engines like InnoDB or PostgreSQL prefer B+ Trees for modeling index structures?" },
    { label: "Semaphores vs Mutex (OS)", text: "Detail the conceptual difference between Semaphores and Mutex locks in multi-threaded Operating Systems. Provide a quick trace of how they handle synchronization." },
    { label: "Dijkstra's Graph Search (Algo)", text: "Explain Dijkstra's shortest path algorithm step-by-step. Include its typical time complexity and a quick trace example." },
    { label: "React State Lifecycle", text: "Explain how React state transitions cause re-renders. What is the difference between simple State, Context API, and global stores like Redux?" }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    setInputText("");
    setLoading(true);
    try {
      await onSendMessage(text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper parser converting raw markdown strings to elegant React layout
  const renderMessageContent = (text: string, msgId: string) => {
    // Basic Markdown Parser (converts headers, bullet points, and code blocks)
    const blocks = text.split(/(```[a-z]*\n[\s\S]*?\n```)/g);

    return blocks.map((block, index) => {
      if (block.startsWith("```")) {
        const lines = block.split("\n");
        const language = lines[0].replace("```", "") || "code";
        const codeContent = lines.slice(1, -1).join("\n");

        return (
          <div key={index} className="my-3 border border-slate-800 rounded-xl bg-slate-950 overflow-hidden font-mono text-xs text-slate-300">
            <div className="bg-slate-900 border-b border-slate-850 px-4 py-1.5 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>{language}</span>
              <button
                onClick={() => handleCopyText(codeContent, `${msgId}-code-${index}`)}
                className="hover:text-white flex items-center gap-1 font-semibold"
              >
                {copiedIndex === `${msgId}-code-${index}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed select-text font-mono text-[11px] text-slate-300">{codeContent}</pre>
          </div>
        );
      }

      // Inline parsing for bold texts, list bullets, etc.
      const lines = block.split("\n");
      return (
        <div key={index} className="space-y-1.5 text-xs text-slate-300 select-text font-sans leading-relaxed">
          {lines.map((line, lIdx) => {
            // Check for headers
            if (line.startsWith("### ")) {
              return <h4 key={lIdx} className="text-sm font-bold font-display text-white pt-2">{line.replace("### ", "")}</h4>;
            }
            if (line.startsWith("## ")) {
              return <h3 key={lIdx} className="text-base font-bold font-display text-white pt-3 border-b border-slate-800 pb-1">{line.replace("## ", "")}</h3>;
            }
            if (line.startsWith("# ")) {
              return <h2 key={lIdx} className="text-lg font-bold font-display text-white pt-4">{line.replace("# ", "")}</h2>;
            }
            
            // Check for bullets
            if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
              const cleanLine = line.trim().substring(2);
              return (
                <ul key={lIdx} className="list-disc pl-5 my-0.5 space-y-1">
                  <li>{parseInlineMarkdown(cleanLine)}</li>
                </ul>
              );
            }

            // Normal text
            return line.trim() === "" ? <div key={lIdx} className="h-2"></div> : <p key={lIdx}>{parseInlineMarkdown(line)}</p>;
          })}
        </div>
      );
    });
  };

  // Helper replacing standard **bold** or `inline-code` markers inside strings
  const parseInlineMarkdown = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={pIdx} className="bg-slate-950 px-1 py-0.5 rounded text-[11px] font-mono text-indigo-300 border border-slate-800">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col h-[740px] overflow-hidden">
      
      {/* Top chat head info */}
      <div className="bg-slate-950/40 p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600/10 p-2 border border-indigo-500/10 rounded-xl relative">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-slate-900" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">StudyBuddy AI Tutor</h3>
            <p className="text-[10px] text-slate-500 font-semibold uppercase font-mono">Expert DSA & Web Dev Mentor</p>
          </div>
        </div>

        {chatHistory.length > 0 && (
          <button
            onClick={onClearChat}
            className="text-[10px] font-semibold text-slate-500 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-slate-850 transition-all cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Main chat center scroll */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        
        {chatHistory.length === 0 && (
          <div className="space-y-6 max-w-2xl mx-auto py-4">
            
            {/* Greeting */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold font-display text-white">Ask StudyBuddy Anything!</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                Discuss algorithms, inspect memory pointers, design full-stack APIs, or ask questions on dynamic routing.
              </p>
            </div>

            {/* Quick Cards Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Suggested Discussion Topics</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(prompt.text)}
                    className="text-left bg-slate-950 border border-slate-850 hover:border-indigo-500/40 p-4 rounded-xl space-y-1 hover:bg-indigo-950/10 transition-all shrink-0 active:scale-95 text-slate-300"
                  >
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">{prompt.label}</span>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-normal font-sans-medium">
                      {prompt.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Message sequences */}
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar icon bubble */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border uppercase font-bold text-xs ${
              msg.sender === 'user'
                ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Text message content package */}
            <div className={`p-4 rounded-2xl relative ${
              msg.sender === "user"
                ? "bg-blue-600/10 border border-blue-500/20 text-slate-200"
                : "bg-slate-950/80 border border-slate-850 text-slate-300"
            }`}>
              {renderMessageContent(msg.text, msg.id)}
            </div>

          </div>
        ))}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-indigo-600/10 border-indigo-500/20 text-indigo-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl text-xs text-slate-400 font-medium">
              StudyBuddy is thinking and coding...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Message input console */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="p-4 bg-slate-950/60 border-t border-slate-800 flex gap-3 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask StudyBuddy about DSA problem optimizations, Web Dev bugs..."
          className="flex-1 bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className={`flex items-center justify-center p-3 rounded-xl transition-all h-10 w-10 ${
            inputText.trim() && !loading
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'
              : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
