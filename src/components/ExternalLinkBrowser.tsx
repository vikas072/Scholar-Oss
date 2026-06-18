import React, { useState, FormEvent } from "react";
import { 
  Globe, 
  Search, 
  ArrowRight, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  AlertTriangle, 
  Copy, 
  Check, 
  Compass,
  GraduationCap
} from "lucide-react";
import { motion } from "motion/react";

interface WebPagePreset {
  title: string;
  url: string;
  platform: string;
  category: "DSA" | "Web Dev" | "Operating Systems" | "Career";
  description: string;
}

const SITE_PRESETS: WebPagePreset[] = [
  {
    title: "Apna College - Sigma Class Curriculum",
    url: "https://www.apnacollege.in/",
    platform: "Apna College",
    category: "Career",
    description: "Premium study courses, engineering placements, standard resume builders, and corporate mentorship cohorts."
  },
  {
    title: "freeCodeCamp - Code Curriculum & Guides",
    url: "https://www.freecodecamp.org/news/",
    platform: "freeCodeCamp",
    category: "Web Dev",
    description: "Interactive learning courses, developer news, CSS/JS tutorials, and algorithm certifications."
  },
  {
    title: "GeeksforGeeks - Operating Systems Tutorial Stack",
    url: "https://www.geeksforgeeks.org/operating-systems/",
    platform: "GeeksforGeeks",
    category: "Operating Systems",
    description: "Comprehensive notes covering Process Management, Memory allocation, disk scheduling algorithms, and past exams questions."
  },
  {
    title: "MDN Web Docs - HTML, CSS & JavaScript",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    platform: "Mozilla MDN",
    category: "Web Dev",
    description: "The gold standard resource for client-side web technologies, DOM event loops, and modern React guidelines."
  },
  {
    title: "LeetCode Study Guides & Discussion forum",
    url: "https://leetcode.com/discuss/study-guide",
    platform: "LeetCode",
    category: "DSA",
    description: "Crowdsourced technical archives containing patterns for dynamic programming, graph traversal, and sliding windows."
  },
  {
    title: "W3Schools Learn JavaScript Basics",
    url: "https://www.w3schools.com/js/",
    platform: "W3Schools",
    category: "Web Dev",
    description: "Beginner-friendly step-by-step interactive playground tutorials ideal for early-stage programming models."
  }
];

export default function ExternalLinkBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputUrl, setInputUrl] = useState("https://www.apnacollege.in/");
  const [activeUrl, setActiveUrl] = useState("https://www.apnacollege.in/");
  const [currentTitle, setCurrentTitle] = useState("Apna College - Sigma Class Curriculum");
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // to force refresh

  const handlePresetSelect = (preset: WebPagePreset) => {
    setActiveUrl(preset.url);
    setInputUrl(preset.url);
    setCurrentTitle(preset.title);
  };

  const handleUrlSubmit = (e: FormEvent) => {
    e.preventDefault();
    let formattedUrl = inputUrl.trim();
    if (!formattedUrl) return;

    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }
    
    setInputUrl(formattedUrl);
    setActiveUrl(formattedUrl);
    setCurrentTitle("Custom Loaded Reference");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const forceRefreshIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  // Filter study presets based on query
  const filteredPresets = SITE_PRESETS.filter(pr => 
    pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="external-link-browser-wrapper" className="backdrop-blur-md bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
      {/* Background visual accents */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-rose-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-tr from-sky-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-880 pb-4 mb-6 relative z-10 text-left">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <Globe className="w-5 h-5 text-sky-400 group-hover:rotate-45 transition-transform" />
            CS Sandbox External Link browser & Tutorials Previewer
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Load top educational sites such as Apna College or custom study resources without shifting workspaces
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">SANDBOX ENABLED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Preset Catalogs & Smart Search Form */}
        <div className="lg:col-span-4 space-y-4 text-left">
          <div className="bg-slate-950/60 border border-slate-850 p-4.5 rounded-2xl space-y-3.5">
            <span className="text-[10px] font-mono font-extrabold text-slate-550 uppercase tracking-widest block">
              Search Or Load Custom URL:
            </span>

            {/* Custom URL Input Form */}
            <form onSubmit={handleUrlSubmit} className="flex gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  placeholder="e.g. www.apnacollege.in/courses"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-sky-500/60"
                />
              </div>
              <button
                type="submit"
                className="bg-sky-650 hover:bg-sky-600 border border-sky-600/40 text-white font-mono text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                title="Navigate to destination"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Presets filter search */}
            <div className="relative pt-1">
              <Search className="w-3.5 h-3.5 text-slate-550 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter study sites (e.g. Apna, DSA...)"
                className="w-full bg-slate-900/70 border border-slate-855 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-300 placeholder:text-slate-650 focus:outline-none focus:border-indigo-500/40"
              />
            </div>
          </div>

          {/* Preset list selection */}
          <div className="space-y-2.5">
            <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-wider block px-1">
              Popular Educational Shortcuts ({filteredPresets.length}):
            </span>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredPresets.map((preset, index) => {
                const isActive = activeUrl === preset.url;
                
                let catBadgeColor = "text-sky-400 bg-sky-500/5 border-sky-500/10";
                if (preset.category === "DSA") {
                  catBadgeColor = "text-indigo-405 bg-indigo-550/5 border-indigo-550/10";
                } else if (preset.category === "Operating Systems") {
                  catBadgeColor = "text-rose-400 bg-rose-500/5 border-rose-500/10";
                } else if (preset.category === "Career") {
                  catBadgeColor = "text-emerald-400 bg-emerald-500/5 border-emerald-500/10";
                }

                return (
                  <div
                    key={index}
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-3.5 border rounded-xl transition-all duration-200 cursor-pointer text-left relative ${
                      isActive 
                        ? "bg-sky-950/20 border-sky-500/30 shadow-md ring-1 ring-sky-500/10" 
                        : "bg-slate-950/50 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1 mb-1">
                      <span className="text-[11px] font-mono font-bold text-slate-400 block group-hover:text-slate-200">
                        {preset.platform}
                      </span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${catBadgeColor}`}>
                        {preset.category}
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold leading-normal ${isActive ? "text-sky-300" : "text-slate-200"}`}>
                      {preset.title}
                    </h4>

                    {preset.description && (
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-normal line-clamp-2">
                        {preset.description}
                      </p>
                    )}
                  </div>
                );
              })}

              {filteredPresets.length === 0 && (
                <div className="p-8 text-center bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-slate-500 text-xs">No preset bookmarks found</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: High-fidelity Sandboxed Iframe Visual Preview Panel */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Mock Browser Frame Shell container */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
            
            {/* Mock Web Browser Top Control Ribbon */}
            <div className="bg-slate-900 border-b border-slate-850 p-3.5 flex flex-wrap items-center justify-between gap-3 text-left">
              {/* Left dots & active info */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block" />
                </div>
                
                <span className="text-[10px] sm:text-xs font-bold text-slate-350 ml-2 select-all max-w-[280px] sm:max-w-md truncate font-mono">
                  🌎 {currentTitle}
                </span>
              </div>

              {/* Toolbar action buttons */}
              <div className="flex items-center gap-1.5">
                {/* Copy URL */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 px-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-850/60 rounded-lg text-slate-400 hover:text-white transition-all text-[10px] font-mono font-bold flex items-center gap-1 select-none cursor-pointer"
                  title="Copy destination link address"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Link
                    </>
                  )}
                </button>

                {/* Hard Reload frameset */}
                <button
                  type="button"
                  onClick={forceRefreshIframe}
                  className="p-1 px-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-850/60 rounded-lg text-slate-400 hover:text-white transition-all text-[10px] font-mono font-bold flex items-center gap-1 select-none cursor-pointer"
                  title="Reload web view pane"
                >
                  <RefreshCw className="w-3 h-3 text-sky-400" /> Reload
                </button>

                {/* Open in external Tab */}
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 px-2.5 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/20 rounded-lg text-indigo-100 hover:text-white transition-all text-[10px] font-mono font-bold flex items-center gap-1 select-none cursor-pointer text-decoration-none"
                  title="Launch website directly on primary external tab browser"
                >
                  <ExternalLink className="w-3 h-3 text-indigo-300" /> Pop-out
                </a>
              </div>
            </div>

            {/* Address Input indicator Bar */}
            <div className="bg-slate-900/60 border-b border-slate-900 px-4 py-2 flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider">Address:</span>
              <div className="flex-1 bg-slate-950/90 border border-slate-850/70 rounded-lg px-2.5 py-1 text-[10.5px] font-mono text-indigo-400 truncate text-left">
                {activeUrl}
              </div>
            </div>

            {/* Actual Interactive Web Sandbox Iframe view */}
            <div className="w-full bg-slate-950 h-[480px] relative overflow-hidden flex flex-col justify-between">
              <iframe
                key={iframeKey}
                src={activeUrl}
                title="Secure CS Educational Sandbox IFrame Viewer"
                className="w-full h-full bg-white border-none block"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>

          {/* Security & Frame Policy Explanation Banner warning */}
          <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-4 flex gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-400">Website Sandboxing & Iframe Policies Warning</h5>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                Note: Standard platform servers employ tight browser security policies (e.g. <b>X-Frame-Options: SAMEORIGIN</b> or <b>CSP: frame-ancestors 'self'</b>) which might block their page inside sandboxed frame widgets.
                If target website details refuse to load inside this viewport, please trigger the <b>"Pop-out"</b> control tab on the top-right toolbar to learn on Apna College/MDN directly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
