import { useState, useMemo, FormEvent } from "react";
import { 
  BookOpen, Plus, Search, Trash2, ExternalLink, Edit2, FolderOpen, 
  Tag, Filter, Youtube, FileText, Globe, Sparkles, X, Save, 
  Bookmark as BookmarkIcon, Tv, RotateCcw, Clock, CheckCircle, PenTool, Check, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkCategory } from "../types";
import RevisionFlashcards from "./RevisionFlashcards";
import ExternalLinkBrowser from "./ExternalLinkBrowser";

interface EducationLibraryProps {
  bookmarks: Bookmark[];
  onAddBookmark: (title: string, url: string, category: BookmarkCategory, description?: string) => void;
  onUpdateBookmark: (id: string, title: string, url: string, category: BookmarkCategory, description?: string) => void;
  onDeleteBookmark: (id: string) => void;
  onAddStudyLog: (category: 'dsa' | 'web_dev' | 'core_cse' | 'lab_practical', title: string, duration: number, notes: string, date?: string) => void;
  user: any;
}

const CATEGORY_DETAILS: Record<BookmarkCategory, { label: string; bg: string; text: string; icon: any; border: string }> = {
  documentation: {
    label: "Docs & Manuals",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: FileText
  },
  lecture_playlist: {
    label: "Video Playlists",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    icon: Youtube
  },
  engineering_resource: {
    label: "Academic & Gate",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
    icon: BookOpen
  },
  other: {
    label: "General Links",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
    icon: Globe
  }
};

const PRESETS = [
  {
    title: "Apna College Official Learning Portal",
    url: "https://www.apnacollege.in/",
    category: "engineering_resource" as BookmarkCategory,
    description: "Premium DSA placement preparation, fullstack developer tracks, resume templates, and corporate cohort coaching."
  },
  {
    title: "Apna College - Sigma DSA Course",
    url: "https://www.youtube.com/playlist?list=PLfqMhTWxFTe3LtFWcvCD17y5VC8v768Z_",
    category: "lecture_playlist" as BookmarkCategory,
    description: "Acclaimed comprehensive computer science course covering fundamental data structures, placement techniques, and coding guides."
  },
  {
    title: "Gate Smashers CSE Lecture Playlists",
    url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiEed7-ADyybK4B9FU696d5U",
    category: "lecture_playlist" as BookmarkCategory,
    description: "Incredibly useful, B.Tech CSE university exam & GATE core explanation videos."
  },
  {
    title: "MDN Web Docs Core Guide",
    url: "https://developer.mozilla.org/en-US/",
    category: "documentation" as BookmarkCategory,
    description: "The definitive documentation resource for Web development APIs, CSS selectors, and HTML structures."
  },
  {
    title: "Abdul Bari Algorithms Playlist",
    url: "https://www.youtube.com/playlist?list=PLDN4rRL41gUq1gT7E82p9_v5Vrc7wS-v1",
    category: "lecture_playlist" as BookmarkCategory,
    description: "Legendary master lectures on Analysis of Algorithms, Dynamic Programming, and Graph Traversals."
  },
  {
    title: "SQLZoo Interactive Database Exercises",
    url: "https://sqlzoo.net/",
    category: "engineering_resource" as BookmarkCategory,
    description: "Excellent hands-on DBMS SQL query playground & normalization drills."
  }
];

function getYouTubeEmbedInfo(url: string): { type: "video" | "playlist" | null; embedUrl: string | null; id: string | null } {
  if (!url) return { type: null, embedUrl: null, id: null };
  
  try {
    const tempUrl = url.trim();
    // Support starting without protocols
    const checkUrl = tempUrl.includes("://") ? tempUrl : `https://${tempUrl}`;
    const u = new URL(checkUrl);
    
    // Check for playlist
    const playlistId = u.searchParams.get("list");
    if (playlistId) {
      return {
        type: "playlist",
        embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`,
        id: playlistId
      };
    }
    
    // Check watch paths
    if (u.hostname === "youtu.be") {
      const videoId = u.pathname.substring(1);
      return {
        type: "video",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        id: videoId
      };
    }
    
    if (u.pathname.startsWith("/shorts/")) {
      const videoId = u.pathname.split("/shorts/")[1]?.split("/")[0]?.split("?")[0];
      return {
        type: "video",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        id: videoId
      };
    }
    
    // Standard watch
    const videoId = u.searchParams.get("v");
    if (videoId) {
      return {
        type: "video",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        id: videoId
      };
    }
    
    // Embed path
    if (u.pathname.startsWith("/embed/")) {
      const videoId = u.pathname.split("/embed/")[1]?.split("/")[0]?.split("?")[0];
      return {
        type: "video",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        id: videoId
      };
    }
  } catch (e) {
    // Fallback regex approach for rough strings
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
      return {
        type: "video",
        embedUrl: `https://www.youtube.com/embed/${match[2]}`,
        id: match[2]
      };
    }
  }
  
  return { type: null, embedUrl: null, id: null };
}

export default function EducationLibrary({ 
  bookmarks, 
  onAddBookmark, 
  onUpdateBookmark, 
  onDeleteBookmark, 
  onAddStudyLog,
  user 
}: EducationLibraryProps) {
  // Navigation & filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterTab, setSelectedFilterTab] = useState<"all" | BookmarkCategory>("all");
  
  // Create / Edit modal or inline form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  
  // Active Embedded Study Player Lounge
  const [activeVideoTitle, setActiveVideoTitle] = useState("");
  const [activeEmbedUrl, setActiveEmbedUrl] = useState<string | null>(null);
  const [activePlayerType, setActivePlayerType] = useState<"video" | "playlist" | null>(null);
  
  // Quick direct load YouTube input
  const [directYoutubeUrl, setDirectYoutubeUrl] = useState("");
  const [directLoadError, setDirectLoadError] = useState("");
  const [directSaveAsBookmark, setDirectSaveAsBookmark] = useState(true);

  // Scratchpad Notes & Study Hours logs
  const [studyNotes, setStudyNotes] = useState("");
  const [logMinutes, setLogMinutes] = useState(30);
  const [logCategory, setLogCategory] = useState<'dsa' | 'web_dev' | 'core_cse' | 'lab_practical'>("core_cse");
  const [showLogSuccess, setShowLogSuccess] = useState(false);

  // YouTube Tutorial Search Space
  const [activeLibraryTab, setActiveLibraryTab] = useState<"vault" | "search">("vault");
  const [ytSearchQuery, setYtSearchQuery] = useState("");
  const [ytSearchResults, setYtSearchResults] = useState<any[]>([]);
  const [ytSearchLoading, setYtSearchLoading] = useState(false);
  const [ytSearchError, setYtSearchError] = useState<string | null>(null);
  const [newlyBookmarkedIds, setNewlyBookmarkedIds] = useState<Set<string>>(new Set());

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formCategory, setFormCategory] = useState<BookmarkCategory>("documentation");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Filtered bookmarks mapping
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const matchesTab = selectedFilterTab === "all" || b.category === selectedFilterTab;
      
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        b.title.toLowerCase().includes(query) || 
        (b.description || "").toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [bookmarks, selectedFilterTab, searchQuery]);

  const handleOpenCreateForm = () => {
    setEditingBookmarkId(null);
    setFormTitle("");
    setFormUrl("");
    setFormCategory("lecture_playlist");
    setFormDescription("");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (b: Bookmark) => {
    setEditingBookmarkId(b.id);
    setFormTitle(b.title);
    setFormUrl(b.url);
    setFormCategory(b.category);
    setFormDescription(b.description || "");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!formUrl.trim()) {
      setFormError("URL link is required.");
      return;
    }

    try {
      const checkUrl = formUrl.includes("://") ? formUrl : `https://${formUrl}`;
      new URL(checkUrl);
    } catch (e) {
      setFormError("Please enter a valid URL website link.");
      return;
    }

    const normalizedUrl = formUrl.startsWith("http://") || formUrl.startsWith("https://")
      ? formUrl
      : `https://${formUrl}`;

    if (editingBookmarkId) {
      onUpdateBookmark(editingBookmarkId, formTitle, normalizedUrl, formCategory, formDescription);
    } else {
      onAddBookmark(formTitle, normalizedUrl, formCategory, formDescription);
    }

    setIsFormOpen(false);
    // Clear fields
    setFormTitle("");
    setFormUrl("");
    setFormDescription("");
  };

  const handleYtSearch = async (forcedQuery?: string) => {
    const q = (forcedQuery !== undefined ? forcedQuery : ytSearchQuery).trim();
    if (!q) return;

    if (forcedQuery !== undefined) {
      setYtSearchQuery(forcedQuery);
    }

    setYtSearchLoading(true);
    setYtSearchError(null);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tutorials from search route.");
      }
      const data = await res.json();
      setYtSearchResults(data.results || []);
    } catch (err: any) {
      setYtSearchError(err.message || "An error occurred while connecting to the YouTube search proxy.");
    } finally {
      setYtSearchLoading(false);
    }
  };

  const handleBookmarkYtResult = (item: any) => {
    const alreadyExists = bookmarks.some(b => b.url.toLowerCase().includes(item.id.toLowerCase()));
    if (!alreadyExists) {
      onAddBookmark(
        item.title,
        item.url,
        item.type === "playlist" ? "lecture_playlist" : "documentation",
        item.description || `Search discovered tutorial video on YouTube.`
      );
    }
    setNewlyBookmarkedIds(prev => {
      const copy = new Set(prev);
      copy.add(item.id);
      return copy;
    });
  };

  const handleAddPreset = (preset: typeof PRESETS[0]) => {
    const alreadyExists = bookmarks.some(b => b.url.toLowerCase() === preset.url.toLowerCase());
    if (alreadyExists) return;
    onAddBookmark(preset.title, preset.url, preset.category, preset.description);
  };

  // Immersive Lecture Lounge player trigger
  const handleLaunchInPlayer = (title: string, url: string) => {
    const info = getYouTubeEmbedInfo(url);
    if (info.embedUrl) {
      setActiveEmbedUrl(info.embedUrl);
      setActivePlayerType(info.type);
      setActiveVideoTitle(title);
      // Auto pre-populate scratchpad
      setStudyNotes(`Reviewing notes for: ${title}\n- Spinoff lecture playlist details.\n- Started on ${new Date().toLocaleDateString()}\n`);
      // Select best fitting categories optionally
      if (url.toLowerCase().includes("playlist")) {
        setLogCategory("core_cse");
      }
      setDirectLoadError("");
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } else {
      // Not a youtube url, opening in fresh link window/tab as backup
      window.open(url, "_blank", "noreferrer,noopener");
    }
  };

  // Direct load form trigger
  const handleDirectYoutubeLoad = (e: FormEvent) => {
    e.preventDefault();
    setDirectLoadError("");

    if (!directYoutubeUrl.trim()) {
      setDirectLoadError("Please paste a valid YouTube video or playlist link.");
      return;
    }

    const info = getYouTubeEmbedInfo(directYoutubeUrl);
    if (!info.embedUrl) {
      setDirectLoadError("Unable to extract YouTube video or playlist ID. Verify the link is valid (e.g. youtube.com/watch?v=... or playlist?list=...)");
      return;
    }

    const title = info.type === "playlist" ? "Imported YouTube Playlist" : "Loaded YouTube Lecture";
    setActiveEmbedUrl(info.embedUrl);
    setActivePlayerType(info.type);
    setActiveVideoTitle(title);
    setStudyNotes(`Notes for loaded video: \n- Link: ${directYoutubeUrl}\n`);

    if (directSaveAsBookmark) {
      // Prevent duplicates in bookmarks
      const alreadyExists = bookmarks.some(b => b.url.toLowerCase().includes(directYoutubeUrl.toLowerCase()));
      if (!alreadyExists) {
        onAddBookmark(
          title, 
          directYoutubeUrl, 
          info.type === "playlist" ? "lecture_playlist" : "documentation", 
          "Direct imported YouTube video study session."
        );
      }
    }

    setDirectYoutubeUrl("");
  };

  // Log active study time spent on the active lecture
  const handleCommitStudyLog = (e: FormEvent) => {
    e.preventDefault();
    const cleanNotes = studyNotes.trim() || `Watched lecture: ${activeVideoTitle}.`;
    
    // Call props study log addition handler
    onAddStudyLog(
      logCategory,
      `Lecture study: ${activeVideoTitle}`,
      logMinutes,
      cleanNotes
    );

    setShowLogSuccess(true);
    setTimeout(() => {
      setShowLogSuccess(false);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Visual Branding Cover Card */}
      <div id="library-banner-compartment" className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl -z-10 absolute pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
              YouTube & Study Lounge
            </span>
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Youtube className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
              Direct Computer Science YouTube Video Lounge
            </h2>
            <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
              Curate and stream university classes, GATE playlists, and documentation guides inside your browser workspace. Log active study time directly into your statistics without external distraction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreateForm}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/10 flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Bookmark
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE YOUTUBE LOUNGE ENFORCEMENT & EMBED PLAYER */}
      <AnimatePresence>
        {activeEmbedUrl && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            id="youtube-theatre-box"
            className="bg-slate-900/80 border-2 border-rose-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            
            {/* Header Area */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="flex items-center gap-2 text-xs font-bold text-rose-400 tracking-wider font-mono">
                <Tv className="w-4 h-4 animate-pulse text-rose-500" />
                ACTIVE LECTURE ROOM: {activePlayerType === "playlist" ? "PLAYLIST PLAYBACK" : "SINGLE LECTURE"}
              </span>

              <button
                onClick={() => {
                  setActiveEmbedUrl(null);
                  setActiveVideoTitle("");
                }}
                className="p-1 px-3 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-1 cursor-pointer"
                title="Close Cinema Mode"
              >
                Let's Close Lounge <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Split Grid: Left Video / Right Active Study Notes & Logger */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left Side: Embedded responsive iframe */}
              <div className="lg:col-span-3 space-y-3">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner relative">
                  <iframe
                    src={activeEmbedUrl}
                    title={activeVideoTitle}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                
                {/* Embedded Video/Playlist Title label */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display leading-tight">
                      {activeVideoTitle}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Streamed safely using clean, distraction-free YouTube Embedded Cinema sandbox.
                    </p>
                  </div>
                  
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                    Watching Mode
                  </span>
                </div>
              </div>

              {/* Right Side: Scratchpad, category & Time committing Log widget */}
              <div className="lg:col-span-2 bg-slate-950/60 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between space-y-4">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-indigo-400" /> Study Notes Scratchpad
                    </span>
                    <button
                      type="button"
                      onClick={() => setStudyNotes("")}
                      className="text-[9px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> reset
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={studyNotes}
                    onChange={e => setStudyNotes(e.target.value)}
                    placeholder="Type key lecture takeaways, algorithm analysis complexities, or syntax shortcuts here..."
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 rounded-lg p-2.5 focus:outline-none focus:border-rose-500/50 resize-none font-mono"
                  />
                </div>

                {/* Commit log form */}
                <form onSubmit={handleCommitStudyLog} className="space-y-4 border-t border-slate-850 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Time Logged:
                    </span>
                    
                    {/* Log category selector */}
                    <select
                      value={logCategory}
                      onChange={e => setLogCategory(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="core_cse">🎓 CSE Classes</option>
                      <option value="dsa">💻 DSA Code</option>
                      <option value="web_dev">🌐 Web Dev Hours</option>
                      <option value="lab_practical">🔬 Lab Practical</option>
                    </select>
                  </div>

                  {/* Range Slider for minutes */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>15 Min</span>
                      <span className="font-bold text-indigo-400">{logMinutes} Total Minutes</span>
                      <span>180 Min</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={180}
                      step={15}
                      value={logMinutes}
                      onChange={e => setLogMinutes(Number(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                    />
                  </div>

                  <AnimatePresence>
                    {showLogSuccess && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-[10px] flex items-center gap-2 font-medium"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Study log fully committed! View your updated stats on dashboard.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-mono font-bold text-xs rounded-xl shadow transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Commit Study Hours to Log
                  </button>
                </form>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Layout: Control Panel & Library Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Direct YouTube Loader, Category Filters & Curated Presets */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* PASTE / DIRECT YOUTUBE LOADER */}
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-3xl space-y-3.5">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-rose-500" /> YouTube Quick-Streamer
            </h3>
            <p className="text-[10px] text-slate-500 leading-normal">
              Paste any study playlist or video lecture directly to open and stream it in your browser workspace:
            </p>

            {directLoadError && (
              <div className="p-2 border border-rose-500/20 bg-rose-500/5 text-rose-400 text-[10px] rounded-lg">
                {directLoadError}
              </div>
            )}

            <form onSubmit={handleDirectYoutubeLoad} className="space-y-2.5">
              <input
                type="text"
                placeholder="Paste YouTube Link or Video ID"
                value={directYoutubeUrl}
                onChange={e => setDirectYoutubeUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500/50"
              />

              <label className="flex items-center gap-1.5 text-[10px] text-slate-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={directSaveAsBookmark}
                  onChange={e => setDirectSaveAsBookmark(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 checked:bg-indigo-600 focus:ring-0 cursor-pointer"
                />
                Save to Bookmark Vault
              </label>

              <button
                type="submit"
                className="w-full py-1.5 bg-rose-600/15 hover:bg-rose-600 border border-rose-500/25 hover:border-transparent text-rose-400 hover:text-white transition duration-200 text-xs font-bold font-mono rounded-xl cursor-pointer"
              >
                Launch Study Theater
              </button>
            </form>
          </div>

          {/* Categories card */}
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filter Library
            </h3>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedFilterTab("all")}
                className={`w-full py-2 px-3 rounded-xl text-xs text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedFilterTab === "all"
                    ? "bg-slate-850 text-white border border-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5" /> All Resources
                </span>
                <span className="font-mono text-[10px] bg-slate-950/50 px-2 py-0.5 rounded-md text-slate-500 font-semibold">
                  {bookmarks.length}
                </span>
              </button>

              {(Object.keys(CATEGORY_DETAILS) as BookmarkCategory[]).map(catKey => {
                const details = CATEGORY_DETAILS[catKey];
                const count = bookmarks.filter(b => b.category === catKey).length;
                const IconComp = details.icon;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedFilterTab(catKey)}
                    className={`w-full py-2 px-3 rounded-xl text-xs text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                      selectedFilterTab === catKey
                        ? "bg-slate-850 text-white border border-slate-700/50"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <IconComp className={`w-3.5 h-3.5 ${details.text}`} /> {details.label}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-950/50 px-2 py-0.5 rounded-md text-slate-500 font-semibold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curated Presets Panel */}
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-3xl space-y-3.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets Sandbox
            </h3>
            <p className="text-[10px] text-slate-500 leading-normal">
              Need inspiration? Add high-quality, pre-screened computer science playlists and web hubs directly to your ledger:
            </p>

            <div className="space-y-2.5">
              {PRESETS.map((preset, idx) => {
                const alreadyExists = bookmarks.some(b => b.url.toLowerCase() === preset.url.toLowerCase());
                return (
                  <div key={idx} className="bg-slate-950/40 border border-slate-850/60 p-2.5 rounded-xl flex flex-col justify-between space-y-2 text-left">
                    <div>
                      <span className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wide block w-fit mb-1">
                        {CATEGORY_DETAILS[preset.category].label}
                      </span>
                      <span className="text-[10px] font-bold text-slate-200 leading-tight block truncate">
                        {preset.title}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddPreset(preset)}
                      disabled={alreadyExists}
                      className={`w-full py-1 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold font-mono transition-all text-center ${
                        alreadyExists
                          ? "text-emerald-500 border-emerald-950/20 cursor-default opacity-80"
                          : "text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer active:scale-95"
                      }`}
                    >
                      {alreadyExists ? "✓ Already Added" : "+ Load Curated Tool"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Search Input, Inline modal drawer, and Bookmarks Listing */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Tabs Selector: Bookmarks Vault vs YouTube Discovery */}
          <div className="flex border-b border-slate-800 pb-px gap-2">
            <button
              onClick={() => setActiveLibraryTab("vault")}
              className={`pb-3 px-4 font-display font-medium text-xs tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeLibraryTab === "vault"
                  ? "border-rose-500 text-rose-400 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <BookmarkIcon className="w-3.5 h-3.5" /> Bookmarks Ledger ({bookmarks.length})
            </button>
            <button
              onClick={() => setActiveLibraryTab("search")}
              className={`pb-3 px-4 font-display font-medium text-xs tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeLibraryTab === "search"
                  ? "border-rose-500 text-rose-400 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Youtube className="w-4 h-4 text-rose-500" /> Discover YouTube Tutorials
            </button>
          </div>

          {activeLibraryTab === "vault" ? (
            <div className="space-y-5">
              {/* Search bar */}
              <div className="flex bg-slate-950/40 border border-slate-850 rounded-2xl p-2 items-center gap-2.5 relative">
            <div className="pl-2">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search your library bookmarks by tags, names, descriptions or URLs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-slate-200 placeholder:text-slate-600 text-xs py-1.5 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="p-1 hover:text-white text-slate-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dynamic Interactive drawer Form for ADD / EDIT */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl overflow-hidden shadow-inner space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    {editingBookmarkId ? "Edit Existing Resource Card" : "Index New Educational Link"}
                  </h4>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block uppercase">Resource Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abdul Bari Divide & Conquer lectures"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Category dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block uppercase">Category</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as BookmarkCategory)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
                    >
                      <option value="documentation">Docs & Manuals</option>
                      <option value="lecture_playlist">Video Playlists</option>
                      <option value="engineering_resource">Academic & Gate</option>
                      <option value="other">General Links</option>
                    </select>
                  </div>

                  {/* URL */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 block uppercase">Resource URL Link</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://youtube.com/playlist?list=..."
                      value={formUrl}
                      onChange={e => setFormUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 block uppercase">Description / Syllabus topics Covered (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Highlights merge sort, quicksort calculations, Master Theorem formulas, recurrence relations diagrams."
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="md:col-span-2 flex justify-end gap-2.5 pt-2 border-t border-slate-850">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> {editingBookmarkId ? "Apply Edits" : "Create Card"}
                    </button>
                  </div>

                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bookmarks Display Area */}
          {filteredBookmarks.length === 0 ? (
            <div className="py-20 text-center border border-slate-900 bg-slate-900/20 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-slate-800/40 text-slate-600 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                <BookmarkIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-300">No matching library bookmarks found</p>
                <p className="text-[10px] text-slate-600 max-w-xs mx-auto leading-relaxed">
                  {searchQuery ? "Try altering your keyword query or select another category filter on the left." : "Your bookmark vaults are empty! Click 'Load' presets or press 'Add New Bookmark' to curate your knowledge hubs."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
              {filteredBookmarks.map((bookmark) => {
                const details = CATEGORY_DETAILS[bookmark.category] || CATEGORY_DETAILS.other;
                const IconComp = details.icon;
                const isYouTube = bookmark.url.toLowerCase().includes("youtube.com") || bookmark.url.toLowerCase().includes("youtu.be");

                return (
                  <motion.div
                    key={bookmark.id}
                    layoutId={bookmark.id}
                    className="p-4 bg-slate-900/30 border border-slate-850/80 hover:border-indigo-500/40 rounded-2xl flex flex-col justify-between group transition-all relative hover:bg-slate-900/50"
                  >
                    <div className="space-y-3">
                      
                      {/* Top Header details & Actions */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${details.text} ${details.bg} ${details.border}`}>
                          <IconComp className="w-3 h-3" />
                          {details.label}
                        </span>

                        {/* Actions group */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditForm(bookmark)}
                            title="Edit Link Metadata"
                            className="p-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={() => onDeleteBookmark(bookmark.id)}
                            title="Delete Bookmark card"
                            className="p-1 bg-slate-950 hover:bg-rose-950/40 border border-slate-850/80 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Main Title of the resource */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200 leading-snug group-hover:text-white transition-colors block">
                          {bookmark.title}
                        </h4>
                        
                        {bookmark.description && (
                          <p className="text-[10px] text-slate-500 leading-normal font-medium line-clamp-3">
                            {bookmark.description}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Bottom Link Anchor & direct Lounge study launcher button */}
                    <div className="pt-3 mt-3 border-t border-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <span className="text-[9px] font-mono font-medium text-slate-600 truncate max-w-[150px]">
                        {bookmark.url.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                      </span>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {isYouTube && (
                          <button
                            onClick={() => handleLaunchInPlayer(bookmark.title, bookmark.url)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-rose-400 hover:text-white hover:bg-rose-600/20 transition-colors bg-rose-500/5 px-2.5 py-1 rounded-lg border border-rose-500/10 cursor-pointer active:scale-95"
                          >
                            <Youtube className="w-3.5 h-3.5 text-rose-500" /> Study Here
                          </button>
                        )}
                        
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noreferrer noopener referrerPolicy=no-referrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/5 px-2.5 py-1 rounded-lg border border-indigo-500/10"
                        >
                          Launch Link <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* YouTube Search Bar */}
              <div className="flex bg-slate-950/40 border-2 border-rose-500/15 rounded-2xl p-2 items-center gap-2.5 relative">
                <div className="pl-2">
                  <Youtube className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
                <input
                  type="text"
                  placeholder="Search tutorial videos or channels on YouTube (e.g. Abdul Bari DP, Gate Smashers CN)..."
                  value={ytSearchQuery}
                  onChange={e => setYtSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleYtSearch();
                  }}
                  className="w-full bg-transparent border-none text-slate-200 placeholder:text-slate-600 text-xs py-1.5 focus:outline-none"
                />
                
                {ytSearchQuery && (
                  <button 
                    onClick={() => setYtSearchQuery("")}
                    className="p-1 hover:text-white text-slate-500 transition-colors mr-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleYtSearch()}
                  disabled={ytSearchLoading}
                  className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-mono font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {ytSearchLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  Search
                </button>
              </div>

              {/* Tag Shortcut Chips */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[9px] font-mono font-bold text-slate-550 uppercase tracking-widest">Quick Tags:</span>
                {[
                  "Abdul Bari Algorithms",
                  "Gate Smashers Computer Networks",
                  "freeCodeCamp React JS",
                  "Web Dev Simplified CSS",
                  "Fireship System Design",
                  "DBMS Database Normalization"
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleYtSearch(chip)}
                    className="text-[10px] bg-slate-900/60 hover:bg-slate-800 hover:text-white text-slate-400 font-medium px-2.5 py-1 rounded-full border border-slate-850 transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Info notice about proxy status */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-indigo-300">
                    YouTube Data Feed Active: {process.env.YOUTUBE_API_KEY ? "DIRECT GOOGLE API" : "INTELLIGENT GEMINI PROXY"}
                  </p>
                  <p className="text-[10px] text-slate-550 leading-relaxed">
                    {process.env.YOUTUBE_API_KEY 
                      ? "Querying the YouTube Data API live endpoint using your configured developer credentials key." 
                      : "Using our preinstalled StudyBuddy Gemini AI proxy directory to dynamically seek out real class lectures and verified playlists with high pedagogical value."}
                  </p>
                </div>
              </div>

              {/* YouTube Search Error */}
              {ytSearchError && (
                <div className="p-3 border border-rose-500/20 bg-rose-500/5 text-rose-400 text-[10px] rounded-xl font-mono">
                  Error: {ytSearchError}
                </div>
              )}

              {/* YouTube Result List */}
              {ytSearchLoading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                  <p className="text-xs font-semibold text-slate-400">Scanning YouTube for educational resource gems...</p>
                  <p className="text-[10px] text-slate-650">Verifying video credentials and building study links.</p>
                </div>
              ) : ytSearchResults.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-850 bg-slate-900/10 rounded-3xl space-y-3">
                  <div className="w-11 h-11 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-850">
                    <Search className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400">No YouTube Search Results Loaded</h5>
                    <p className="text-[10px] text-slate-650 max-w-sm mx-auto mt-0.5 leading-relaxed">
                      Enter a concept search query above or tap one of our quick tags to fetch active masterclass streams from YouTube.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ytSearchResults.map((item) => {
                    const isBookmarked = bookmarks.some(b => b.url.toLowerCase().includes(item.id.toLowerCase())) || newlyBookmarkedIds.has(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 bg-slate-900/25 border border-slate-850/80 hover:border-rose-500/30 rounded-2xl flex gap-3 flex-col justify-between group transition-all"
                      >
                        <div className="flex gap-3">
                          {/* Left: Thumbnail image with type badge */}
                          <div className="w-24 h-16 sm:w-28 sm:h-20 bg-slate-950 rounded-xl overflow-hidden relative shrink-0 border border-slate-850">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <span className={`absolute bottom-1 right-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded text-white ${
                              item.type === "playlist" ? "bg-indigo-650" : "bg-rose-650"
                            }`}>
                              {item.type.toUpperCase()}
                            </span>
                          </div>

                          {/* Right: Content details */}
                          <div className="space-y-1 overflow-hidden">
                            <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-white leading-normal line-clamp-2" title={item.title}>
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 font-medium">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Action Ribbons */}
                        <div className="pt-2.5 border-t border-slate-850/60 flex items-center justify-between gap-2 mt-1">
                          <span className="text-[8px] font-mono font-semibold text-slate-600 truncate max-w-[124px]">
                            ID: {item.id}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Launch Player */}
                            <button
                              onClick={() => handleLaunchInPlayer(item.title, item.url)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-rose-400 hover:text-white hover:bg-rose-600/20 transition-all bg-rose-500/5 px-2.5 py-1 rounded-lg border border-rose-500/10 cursor-pointer active:scale-95"
                            >
                              <Tv className="w-3.5 h-3.5 text-rose-500" /> Play Lounge
                            </button>

                            {/* Add Bookmark button */}
                            <button
                              onClick={() => handleBookmarkYtResult(item)}
                              disabled={isBookmarked}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono transition-all px-2.5 py-1 rounded-lg border ${
                                isBookmarked
                                  ? "bg-slate-950 border-emerald-950/40 text-emerald-500 cursor-default"
                                  : "bg-indigo-500/5 border-indigo-500/10 text-indigo-400 hover:text-white hover:bg-indigo-600/20 cursor-pointer active:scale-95"
                              }`}
                            >
                              {isBookmarked ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" /> Saved
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3 text-indigo-400" /> Book
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Play Apna College / External Website Sandbox Viewport Browser */}
        <div id="external-link-browser-section" className="pt-8 border-t border-slate-900 mb-8">
          <ExternalLinkBrowser />
        </div>

        {/* Space Repetition Flashcard Review Station */}
        <div id="revision-flashcards-section-divider" className="pt-6 border-t border-slate-900">
          <RevisionFlashcards />
        </div>

      </div>

    </div>
  );
}
