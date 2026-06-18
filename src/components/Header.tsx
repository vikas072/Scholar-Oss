import React, { useState, useRef, useEffect } from "react";
import { LogIn, LogOut, Database, Wifi, ShieldAlert, Cpu, Award, Sun, Moon, Headphones, Music, Play, Pause, Volume2, VolumeX, Radio, ChevronDown, Brain, Search, X, Copy, Check, Calendar, Clock, ExternalLink } from "lucide-react";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { StudyLog, DsaProblem, Project } from "../types";

interface Station {
  id: string;
  name: string;
  genre: string;
  url: string;
}

const LOFI_STATIONS: Station[] = [
  {
    id: "lofi-beats",
    name: "Classic Lofi Chills & Beats",
    genre: "Chill Lofi Beat",
    url: "https://stream.zeno.fm/0ka98a964heuv"
  },
  {
    id: "jazz-cafe",
    name: "Coffee Shop Cozy Jazz Piano",
    genre: "Focus Jazz Piano",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: "rainy-synth",
    name: "Dijkstra Rainy Code Ambience",
    genre: "Ambient Synth Loops",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: "ambient-space",
    name: "Cosmic Deep Work Space Sync",
    genre: "Space Synthwave Focus",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "synthwave",
    name: "Hacker / Cyberpunk Coding Wave",
    genre: "Upbeat Retro Electro",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
  },
  {
    id: "rain-thunder",
    name: "Forest Rain Ambience & Storm",
    genre: "Nature White Noise",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },
  {
    id: "classical",
    name: "Mindful Classical Piano Focus",
    genre: "Baroque Cozy Keys",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: "alpha-waves",
    name: "Binaural Focus Alpha Waves",
    genre: "Deep Cognitive Soundscape",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"
  }
];

interface HeaderProps {
  user: any;
  loading: boolean;
  streak: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isDeepWork: boolean;
  onToggleDeepWork: () => void;
  logs?: StudyLog[];
  problems?: DsaProblem[];
  projects?: Project[];
}

export default function Header({ 
  user, 
  loading, 
  streak, 
  isDarkMode, 
  onToggleTheme, 
  isDeepWork, 
  onToggleDeepWork,
  logs = [],
  problems = [],
  projects = []
}: HeaderProps) {
  const [authLoading, setAuthLoading] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [selectedResultType, setSelectedResultType] = useState<"log" | "problem" | "project" | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Close search list on clicking outside
  useEffect(() => {
    function handleClickOutsideSearch(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSearch);
    };
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Live filtered search results
  const getSearchResults = () => {
    if (!searchQuery.trim()) return { logs: [], problems: [], projects: [] };
    const query = searchQuery.toLowerCase();
    
    return {
      logs: logs.filter(log => 
        log.title?.toLowerCase().includes(query) || 
        log.notes?.toLowerCase().includes(query) ||
        log.category?.toLowerCase().includes(query)
      ).slice(0, 4),
      
      problems: problems.filter(prob => 
        prob.problemName?.toLowerCase().includes(query) || 
        prob.topic?.toLowerCase().includes(query) || 
        prob.platform?.toLowerCase().includes(query) || 
        prob.notes?.toLowerCase().includes(query)
      ).slice(0, 4),
      
      projects: projects.filter(proj => 
        proj.name?.toLowerCase().includes(query) || 
        proj.description?.toLowerCase().includes(query)
      ).slice(0, 4)
    };
  };

  const filteredResults = getSearchResults();
  const hasSearchResults = searchQuery.trim().length > 0 && (
    filteredResults.logs.length > 0 || 
    filteredResults.problems.length > 0 || 
    filteredResults.projects.length > 0
  );

  // Lo-Fi Study Audio States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [volume, setVolume] = useState(0.4); // Cozy default level info
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const currentStation = LOFI_STATIONS[currentStationIdx];

  // Adjust HTML5 audio volume dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle station source changes on selection
  useEffect(() => {
    if (isPlaying) {
      playCurrentStation();
    }
  }, [currentStationIdx]);

  // Close station dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowMusicPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup active streams on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playCurrentStation = () => {
    setAudioError(null);
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(currentStation.url);
        audioRef.current.loop = true;
      } else {
        audioRef.current.src = currentStation.url;
      }

      audioRef.current.volume = volume;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Autoplay was blocked or steam offline:", err);
            setAudioError("Stream load delayed. Try clicking play again.");
            setIsPlaying(false);
          });
      }
    } catch (e: any) {
      setAudioError("Trouble loading current audio stream.");
      setIsPlaying(false);
    }
  };

  const handleToggleLofi = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      playCurrentStation();
    }
  };

  const selectStation = (idx: number) => {
    setCurrentStationIdx(idx);
    setIsPlaying(true);
  };

  const handleLogin = async () => {
    if (!isFirebaseConfigured || !auth) return;
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login with Google failed:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* Core title and branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-indigo-600/10 p-2 border border-indigo-500/20 rounded-xl">
            <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Scholar<span className="text-indigo-500">OS</span>
              <span className="text-[10px] bg-slate-900 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-800 uppercase tracking-wider">
                DSA • WEB DEV
              </span>
            </h1>
            <p className="text-xs text-slate-400">Track & optimize engineering skills with AI</p>
          </div>
        </div>

        {/* Search Bar - Center and responsive */}
        {!isDeepWork && (
          <div ref={searchContainerRef} className="relative w-full sm:w-72 md:w-80 lg:w-96 z-50">
            <div className="relative group">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Search logs, solved problems, projects..."
                value={searchQuery}
                aria-label="Search logs, problems, projects"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full bg-slate-900/90 hover:bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200 shadow-inner focus:ring-2 focus:ring-indigo-500/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Floating Dropdown Results Panel */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-11 left-0 right-0 max-h-[380px] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-[9999] animate-fade-in flex flex-col gap-3.5 text-left">
                
                {!hasSearchResults ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-400 font-mono">No matching results found for: <span className="text-indigo-400 font-semibold">"{searchQuery}"</span></p>
                    <p className="text-[10px] text-slate-500 mt-1">Try searching by card title, topics, algorithm or keywords.</p>
                  </div>
                ) : (
                  <>
                    {/* Category 1: Study Logs */}
                    {filteredResults.logs.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 px-1 py-0.5 border-b border-slate-900 pb-1">
                          <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">📝 Study Logs</span>
                          <span className="text-[9.5px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded-full font-bold">{filteredResults.logs.length} matches</span>
                        </div>
                        <div className="space-y-1">
                          {filteredResults.logs.map((log) => (
                            <button
                              key={log.id}
                              type="button"
                              onClick={() => {
                                setSelectedResult(log);
                                setSelectedResultType("log");
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left p-2 hover:bg-slate-900/80 rounded-xl transition-all flex items-center justify-between gap-3 group border border-transparent hover:border-slate-800/60 cursor-pointer"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 block truncate transition-colors">{log.title}</span>
                                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{log.notes || "No extra summary notes logged."}</span>
                              </div>
                              <div className="text-right shrink-0 flex flex-col items-end gap-1 font-mono text-[9px] text-slate-500">
                                <span className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10 font-bold">{log.duration} min</span>
                                <span>{log.date}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category 2: DSA Solved Problems */}
                    {filteredResults.problems.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 px-1 py-0.2 border-b border-slate-900 pb-1">
                          <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">💻 DSA Solved Problems</span>
                          <span className="text-[9.5px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded-full font-bold">{filteredResults.problems.length} matches</span>
                        </div>
                        <div className="space-y-1">
                          {filteredResults.problems.map((prob) => {
                            const diffColors = {
                              easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                              medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                              hard: "text-rose-400 bg-rose-500/10 border-rose-500/20"
                            };
                            return (
                              <button
                                key={prob.id}
                                type="button"
                                onClick={() => {
                                  setSelectedResult(prob);
                                  setSelectedResultType("problem");
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left p-2 hover:bg-slate-900/80 rounded-xl transition-all flex items-center justify-between gap-3 group border border-transparent hover:border-slate-800/60 cursor-pointer"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 block truncate transition-colors">{prob.problemName}</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-mono text-slate-500 capitalize">{prob.platform}</span>
                                    <span className="text-[9px] text-slate-500">•</span>
                                    <span className="text-[9px] text-indigo-400/90 font-medium">{prob.topic}</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-1 font-mono text-[9px]">
                                  <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${diffColors[prob.difficulty] || "text-slate-400"}`}>
                                    {prob.difficulty}
                                  </span>
                                  <span className="text-slate-500">{prob.dateSolved}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 3: Projects */}
                    {filteredResults.projects.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 px-1 py-0.2 border-b border-slate-900 pb-1">
                          <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">🚀 Projects</span>
                          <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold">{filteredResults.projects.length} matches</span>
                        </div>
                        <div className="space-y-1">
                          {filteredResults.projects.map((proj) => (
                            <button
                              key={proj.id}
                              type="button"
                              onClick={() => {
                                setSelectedResult(proj);
                                setSelectedResultType("project");
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left p-2 hover:bg-slate-900/80 rounded-xl transition-all flex items-center justify-between gap-3 group border border-transparent hover:border-slate-800/60 cursor-pointer"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 block truncate transition-colors">{proj.name}</span>
                                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{proj.description || "No project overview documented."}</span>
                              </div>
                              <div className="text-right shrink-0 flex flex-col items-end gap-1 font-mono text-[9px] text-slate-400 font-bold">
                                <span className="text-emerald-400">{proj.completion}%</span>
                                <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-1">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proj.completion}%` }} />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer helper */}
                    <div className="text-center border-t border-slate-905 pt-2 pb-0.5">
                      <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider block">Click any result for immediate detailed overview</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Database state and OAuth login actions */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          
          {/* Lo-fi Study Mode Audio Controller */}
          <div className="relative" ref={panelRef}>
            <button
              id="lofi-controller-btn"
              onClick={() => setShowMusicPanel(!showMusicPanel)}
              className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition-all active:scale-95 ${
                isPlaying
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-md shadow-indigo-500/5"
                  : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white"
              }`}
              title="Toggle background focus ambient music"
            >
              <Headphones className={`w-3.5 h-3.5 ${isPlaying ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden md:inline">Lo-fi Mode</span>
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Music Panel Dropdown */}
            {showMusicPanel && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-950/95 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-lg animate-fade-in text-left">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 animate-bounce" /> Focus Soundboard
                  </h4>
                  
                  {/* Play/Pause control directly inside popover */}
                  <button
                    type="button"
                    onClick={handleToggleLofi}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isPlaying 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/25' 
                        : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                    }`}
                    title={isPlaying ? "Pause Focus Stream" : "Connect Focus Stream"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                </div>

                {audioError && (
                  <p className="text-[10px] text-rose-400 bg-rose-500/5 border border-rose-500/10 p-1.5 rounded mb-3 font-mono font-semibold">
                    {audioError}
                  </p>
                )}

                {/* Mini equalizer visualization only when active */}
                <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl mb-3 text-center flex flex-col items-center justify-center relative">
                  <span className="text-[10px] font-bold text-slate-300 block leading-tight">{currentStation.name}</span>
                  <span className="text-[9px] font-mono text-indigo-400 block mt-0.5">{currentStation.genre}</span>

                  <div className="flex items-end justify-center gap-0.5 h-6 mt-2 relative">
                    <style>{`
                      @keyframes lofiWave {
                        0%, 100% { height: 4px; }
                        50% { height: 16px; }
                      }
                      .lofi-bar-1 { animation: lofiWave 1.2s ease-in-out infinite; }
                      .lofi-bar-2 { animation: lofiWave 0.8s ease-in-out infinite 0.2s; }
                      .lofi-bar-3 { animation: lofiWave 1.0s ease-in-out infinite 0.4s; }
                      .lofi-bar-4 { animation: lofiWave 0.7s ease-in-out infinite 0.1s; }
                    `}</style>
                    {[1, 2, 3, 4, 3, 2, 1].map((b, bIdx) => (
                      <div
                        key={bIdx}
                        className={`bg-indigo-500 rounded-t transition-all`}
                        style={{ 
                          height: isPlaying ? undefined : '4px', 
                          width: '3px',
                          animation: isPlaying ? `lofiWave ${0.6 + (bIdx * 0.1)}s ease-in-out infinite` : undefined
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Select Station list */}
                <div className="space-y-1 mb-3 max-h-40 overflow-y-auto pr-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Ambience Channel:</span>
                  {LOFI_STATIONS.map((station, sIdx) => (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => selectStation(sIdx)}
                      className={`w-full text-left p-2 rounded-lg text-[10.5px] font-semibold transition-all border flex items-center justify-between cursor-pointer ${
                        currentStationIdx === sIdx
                          ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <span className="truncate">{station.name}</span>
                      {currentStationIdx === sIdx && isPlaying && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Volume slider control */}
                <div className="border-t border-slate-850/80 pt-2.5">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 mb-1 font-mono">
                    <span>VOLUME:</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setVolume(volume === 0 ? 0.4 : 0)} 
                      className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-900 h-1 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Deep Work Mode Toggle */}
          <button
            id="deep-work-toggle"
            onClick={onToggleDeepWork}
            className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-xl text-xs font-semibold select-none cursor-pointer transition-all active:scale-95 ${
              isDeepWork
                ? "bg-emerald-600/20 text-emerald-300 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
                : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white"
            }`}
            title={isDeepWork ? "Deactivate Deep Work sanctuary" : "Activate Deep Work sanctuary"}
            aria-label="Toggle Deep Work mode"
          >
            <Brain className={`w-3.5 h-3.5 transition-transform duration-500 ${isDeepWork ? "text-emerald-400 rotate-12 scale-110" : "text-slate-400"}`} />
            <span>Deep Work</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isDeepWork ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
          </button>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer select-none active:scale-95"
            title={isDarkMode ? "Switch to Light theme (Better Accessibility)" : "Switch to Dark theme"}
            aria-label="Toggle visual theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Dark Mode</span>
              </>
            )}
          </button>

          {streak > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-1.5 flex items-center gap-2.5 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
              <span className="text-xs font-semibold text-slate-200">{streak} Day Streak</span>
            </div>
          )}

          {/* Connection Status Badge */}
          {isFirebaseConfigured ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Wifi className="w-3.5 h-3.5" />
              <span>Cloud Sync</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400" title="Data saved locally dynamically">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Offline Cache</span>
            </div>
          )}

          {/* Login or User details block */}
          {loading ? (
            <div className="w-24 h-9 bg-slate-900 border border-slate-800 animate-pulse rounded-xl"></div>
          ) : isFirebaseConfigured && auth ? (
            user ? (
              <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 p-1 pr-2.5 rounded-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-800"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase border border-slate-800">
                    {user.displayName?.[0] || user.email?.[0] || "?"}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200 line-clamp-1 leading-none">{user.displayName || "JD"}</span>
                  <span className="text-[9px] font-mono text-slate-500 line-clamp-1 mt-0.5">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={authLoading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow shadow-indigo-500/10 active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {authLoading ? "Connecting..." : "Google Login"}
              </button>
            )
          ) : (
            <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded-xl">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Sync available after Auth configured
            </span>
          )}
        </div>
      </div>

      {/* Search Result Detail Modal */}
      {selectedResult && selectedResultType && (
        <div id="search-modal" className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4" onClick={() => { setSelectedResult(null); setSelectedResultType(null); }}>
          <div 
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6 text-left animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              type="button"
              onClick={() => { setSelectedResult(null); setSelectedResultType(null); }}
              className="absolute top-5 right-5 p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header section based on type */}
            <div className="space-y-2 text-left">
              <span className={`text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                selectedResultType === "log" 
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : selectedResultType === "problem"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {selectedResultType === "log" ? "📝 Study Log Detail" : selectedResultType === "problem" ? "💻 DSA Problem Solved" : "🚀 Engineering Project"}
              </span>

              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight pt-1">
                {selectedResultType === "log" ? selectedResult.title : selectedResultType === "problem" ? selectedResult.problemName : selectedResult.name}
              </h3>
            </div>

            {/* Main Content Layout */}
            <div className="border-t border-b border-slate-800 py-5 space-y-4">
              
              {/* Study Log Layout details */}
              {selectedResultType === "log" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-3">
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-slate-500 block mb-0.5">CATEGORY</span>
                      <span className="text-indigo-400 font-bold capitalize">{selectedResult.category?.replace("_", " ")}</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-slate-500 block mb-0.5">DURATION IN MINUTES</span>
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {selectedResult.duration} mins
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-slate-500 block mb-0.5">DATE LOGGED</span>
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {selectedResult.date}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* DSA Problem layout details */}
              {selectedResultType === "problem" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                      <span className="text-slate-500 block text-[9px] uppercase">PLATFORM</span>
                      <span className="text-indigo-400 font-black text-xs">{selectedResult.platform || "Custom"}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                      <span className="text-slate-500 block text-[9px] uppercase">TOPIC / ALGORITHM</span>
                      <span className="text-amber-400 font-black text-xs">{selectedResult.topic}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                      <span className="text-slate-500 block text-[9px] uppercase">DIFFICULTY & STATUS</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 rounded border ${
                          selectedResult.difficulty === "easy" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                          selectedResult.difficulty === "medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                          "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        }`}>
                          {selectedResult.difficulty}
                        </span>
                        <span className="text-slate-500 font-bold">•</span>
                        <span className="text-slate-300 capitalize">{selectedResult.status?.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>

                  {selectedResult.url && (
                    <div className="text-left font-mono">
                      <span className="text-slate-500 block text-[9px]">PROBLEM INTERACTION URL</span>
                      <a 
                        href={selectedResult.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1.5 mt-0.5 break-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>{selectedResult.url}</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Projects layout details */}
              {selectedResultType === "project" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-500 block mb-1">COMPLETION STATUS</span>
                      <span className="text-2xl font-black text-emerald-400">{selectedResult.completion}% Completed</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedResult.completion}%` }} />
                    </div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-500 block mb-1">DATE INITIATED</span>
                    <span className="text-white font-bold flex items-center gap-1.5 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {new Date(selectedResult.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              )}

              {/* Rich Notes area rendering */}
              <div className="space-y-1.5 text-left">
                <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">📋 Summary & Documentation</h4>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed font-sans min-h-[60px] whitespace-pre-wrap">
                  {selectedResultType === "log" && (selectedResult.notes || "No documentation logs added for this study topic.")}
                  {selectedResultType === "problem" && (selectedResult.notes || "No algorithmic analysis notes specified for this DSA track.")}
                  {selectedResultType === "project" && (selectedResult.description || "No description provided for this software directory track.")}
                </div>
              </div>

              {/* Code Snippet block if any (for DSA Problem track code snippets) */}
              {selectedResultType === "problem" && selectedResult.solutionCode && (
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">💾 Saved Solution Code Block</h4>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(selectedResult.solutionCode || "")}
                      className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono px-2.5 py-1 rounded-lg transition-all text-slate-400 hover:text-white cursor-pointer active:scale-95"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto text-[11px] font-mono text-indigo-300/95 max-h-[220px] shadow-inner custom-scrollbar whitespace-pre">
                    <code>{selectedResult.solutionCode}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setSelectedResult(null); setSelectedResultType(null); }}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 text-center"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
