import { useState, useEffect } from "react";
import { LayoutDashboard, Code, Sparkles, CalendarDays, Terminal, ShieldAlert, Cpu, BookOpen, Brain } from "lucide-react";

// Components
import Header from "./components/Header";
import DashboardOverview from "./components/DashboardOverview";
import DsaProblemTracker from "./components/DsaProblemTracker";
import WebDevTracker from "./components/WebDevTracker";
import AIStudyBuddy from "./components/AIStudyBuddy";
import AIPracticeAdvisor from "./components/AIPracticeAdvisor";
import EducationLibrary from "./components/EducationLibrary";
import PomodoroTimer from "./components/PomodoroTimer";
import WelcomeModal from "./components/WelcomeModal";
import DailyActiveStudyTimer from "./components/DailyActiveStudyTimer";

// Types
import { StudyLog, DsaProblem, WebDevLog, DailyGoal, ChatMessage, UserStats, Bookmark, BookmarkCategory, Project } from "./types";

// Firebase
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dsa' | 'web_dev' | 'buddy' | 'planner' | 'library'>('dashboard');

  // Accessibility Theme State Tracker
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("workspace_theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  // Deep Work Mode State Tracker
  const [isDeepWork, setIsDeepWork] = useState<boolean>(() => {
    const savedDeepWork = localStorage.getItem("workspace_deep_work");
    return savedDeepWork ? savedDeepWork === "true" : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
    }
    localStorage.setItem("workspace_theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleToggleDeepWork = () => {
    setIsDeepWork(prev => {
      const next = !prev;
      localStorage.setItem("workspace_deep_work", String(next));
      return next;
    });
  };

  // Core database states
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [problems, setProblems] = useState<DsaProblem[]>([]);
  const [webDevLogs, setWebDevLogs] = useState<WebDevLog[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Daily target goals
  const [goal, setGoal] = useState<DailyGoal>(() => {
    const savedGoal = localStorage.getItem("workspace_daily_goal");
    return savedGoal ? JSON.parse(savedGoal) : {
      dsaProblemsTarget: 2,
      studyMinutesTarget: 60
    };
  });

  const handleUpdateGoal = (newGoal: DailyGoal) => {
    setGoal(newGoal);
    localStorage.setItem("workspace_daily_goal", JSON.stringify(newGoal));
  };

  // Client-side ID helper
  const generateId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // --- STATE PERSISTENCE ROUTING ---
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Local fallback initialization
      loadLocalData();
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Authenticated real-time sync listeners
        const unsubLogs = onSnapshot(
          query(collection(db, "studyLogs"), where("userId", "==", currentUser.uid)),
          (snapshot) => {
            const logsData = snapshot.docs.map(d => ({ ...d.data() } as StudyLog));
            logsData.sort((a, b) => b.createdAt - a.createdAt); // Descending chronological
            setLogs(logsData);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, "studyLogs")
        );

        const unsubProblems = onSnapshot(
          query(collection(db, "dsaProblems"), where("userId", "==", currentUser.uid)),
          (snapshot) => {
            const problemsData = snapshot.docs.map(d => ({ ...d.data() } as DsaProblem));
            problemsData.sort((a, b) => b.createdAt - a.createdAt);
            setProblems(problemsData);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, "dsaProblems")
        );

        const unsubWebDev = onSnapshot(
          query(collection(db, "webDevLogs"), where("userId", "==", currentUser.uid)),
          (snapshot) => {
            const webDevData = snapshot.docs.map(d => ({ ...d.data() } as WebDevLog));
            webDevData.sort((a, b) => b.createdAt - a.createdAt);
            setWebDevLogs(webDevData);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, "webDevLogs")
        );

        const unsubRoadmaps = onSnapshot(
          query(collection(db, "roadmaps"), where("userId", "==", currentUser.uid)),
          (snapshot) => {
            const roadmapsData = snapshot.docs.map(d => d.data().data);
            setSavedRoadmaps(roadmapsData);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, "roadmaps")
        );

        const unsubBookmarks = onSnapshot(
          query(collection(db, "bookmarks"), where("userId", "==", currentUser.uid)),
          (snapshot) => {
            const bookmarksData = snapshot.docs.map(d => ({ ...d.data() } as Bookmark));
            bookmarksData.sort((a, b) => b.createdAt - a.createdAt);
            setBookmarks(bookmarksData);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, "bookmarks")
        );

        const unsubProjects = onSnapshot(
          query(collection(db, "projects"), where("userId", "==", currentUser.uid)),
          (snapshot) => {
            const projectsData = snapshot.docs.map(d => ({ ...d.data() } as Project));
            projectsData.sort((a, b) => b.createdAt - a.createdAt);
            setProjects(projectsData);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, "projects")
        );

        // Cleanup cloud listeners on auth changes
        return () => {
          unsubLogs();
          unsubProblems();
          unsubWebDev();
          unsubRoadmaps();
          unsubBookmarks();
          unsubProjects();
        };
      } else {
        // Unauthenticated local loading fallback
        loadLocalData();
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [user]);

  // Read data from browser fallback LocalStorage
  const loadLocalData = () => {
    const localLogs = localStorage.getItem("workspace_study_logs");
    const localProblems = localStorage.getItem("workspace_dsa_problems");
    const localWebDev = localStorage.getItem("workspace_web_dev_logs");
    const localRoadmaps = localStorage.getItem("workspace_saved_roadmaps");
    const localChat = localStorage.getItem("workspace_chat_history");
    const localBookmarks = localStorage.getItem("workspace_bookmarks");
    const localProjects = localStorage.getItem("workspace_projects");

    if (localLogs) setLogs(JSON.parse(localLogs));
    if (localProblems) setProblems(JSON.parse(localProblems));
    if (localWebDev) setWebDevLogs(JSON.parse(localWebDev));
    if (localRoadmaps) setSavedRoadmaps(JSON.parse(localRoadmaps));
    if (localChat) setChatHistory(JSON.parse(localChat));
    if (localBookmarks) setBookmarks(JSON.parse(localBookmarks));
    if (localProjects) setProjects(JSON.parse(localProjects));
  };


  // --- CRUD ACTIONS ROUTING ---

  // 1. ADD GENERAL LOG
  const handleAddLog = async (category: 'dsa' | 'web_dev' | 'core_cse' | 'lab_practical', title: string, duration: number, notes: string, date?: string) => {
    const logId = generateId();
    const logDate = date || new Date().toISOString().split('T')[0];
    const logPayload: StudyLog = {
      id: logId,
      userId: user?.uid || "anonymous",
      date: logDate,
      category,
      title,
      duration,
      notes,
      createdAt: Date.now()
    };

    if (user && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "studyLogs", logId), logPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `studyLogs/${logId}`);
      }
    } else {
      // Offline fallback state update
      const updatedLogs = [logPayload, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem("workspace_study_logs", JSON.stringify(updatedLogs));
    }
  };

  // 2. DELETE GENERAL LOG
  const handleDeleteLog = async (logId: string) => {
    if (user && isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "studyLogs", logId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `studyLogs/${logId}`);
      }
    } else {
      const updatedLogs = logs.filter(l => l.id !== logId);
      setLogs(updatedLogs);
      localStorage.setItem("workspace_study_logs", JSON.stringify(updatedLogs));
    }
  };

  // 3. ADD DSA PROBLEM
  const handleAddProblem = async (problem: Omit<DsaProblem, 'id' | 'userId' | 'createdAt'>) => {
    const problemId = generateId();
    const problemPayload: DsaProblem = {
      ...problem,
      id: problemId,
      userId: user?.uid || "anonymous",
      createdAt: Date.now()
    };

    if (user && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "dsaProblems", problemId), problemPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `dsaProblems/${problemId}`);
      }
    } else {
      const updatedProblems = [problemPayload, ...problems];
      setProblems(updatedProblems);
      localStorage.setItem("workspace_dsa_problems", JSON.stringify(updatedProblems));
      
      // Auto-log the spent problem time into daily studies logs!
      handleAddLog('dsa', `Solved DSA Problem: ${problem.problemName}`, 30, `Solved on ${problem.platform}. Difficulty: ${problem.difficulty}. approach outline: ${problem.notes || "None"}`);
    }
  };

  // 4. DELETE DSA PROBLEM
  const handleDeleteProblem = async (id: string) => {
    if (user && isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "dsaProblems", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `dsaProblems/${id}`);
      }
    } else {
      const updatedProblems = problems.filter(p => p.id !== id);
      setProblems(updatedProblems);
      localStorage.setItem("workspace_dsa_problems", JSON.stringify(updatedProblems));
    }
  };

  // 5. ADD WEB DEV BUILD LOG
  const handleAddWebDevLog = async (log: Omit<WebDevLog, 'id' | 'userId' | 'createdAt'>) => {
    const logId = generateId();
    const logPayload: WebDevLog = {
      ...log,
      id: logId,
      userId: user?.uid || "anonymous",
      createdAt: Date.now()
    };

    if (user && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "webDevLogs", logId), logPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `webDevLogs/${logId}`);
      }
    } else {
      const updatedLogs = [logPayload, ...webDevLogs];
      setWebDevLogs(updatedLogs);
      localStorage.setItem("workspace_web_dev_logs", JSON.stringify(updatedLogs));

      // Auto-add general study log trigger for duration statistic trackers
      handleAddLog('web_dev', `Built Web Feature: ${log.projectTitle}`, 60, `Studied and implemented using ${log.skillsUsed.join(', ')}. Learnings summary: ${log.learnings}`);
    }
  };

  // 6. DELETE WEB DEV BUILD LOG
  const handleDeleteWebDevLog = async (id: string) => {
    if (user && isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "webDevLogs", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `webDevLogs/${id}`);
      }
    } else {
      const updatedWebDev = webDevLogs.filter(w => w.id !== id);
      setWebDevLogs(updatedWebDev);
      localStorage.setItem("workspace_web_dev_logs", JSON.stringify(updatedWebDev));
    }
  };

  // 7. SAVE SYLLABUS ROADMAP
  const handleSaveRoadmap = async (roadmapData: any) => {
    const rId = generateId();
    if (user && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "roadmaps", rId), {
          id: rId,
          userId: user.uid,
          data: roadmapData,
          createdAt: Date.now()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `roadmaps/${rId}`);
      }
    } else {
      const updatedRoadmaps = [...savedRoadmaps, roadmapData];
      setSavedRoadmaps(updatedRoadmaps);
      localStorage.setItem("workspace_saved_roadmaps", JSON.stringify(updatedRoadmaps));
    }
  };

  // 8. DELETE SYLLABUS ROADMAP
  const handleDeleteRoadmap = async (idx: number) => {
    const updatedRoadmaps = savedRoadmaps.filter((_, i) => i !== idx);
    setSavedRoadmaps(updatedRoadmaps);
    localStorage.setItem("workspace_saved_roadmaps", JSON.stringify(updatedRoadmaps));
  };

  // 10. ADD BOOKMARK
  const handleAddBookmark = async (title: string, url: string, category: BookmarkCategory, description?: string) => {
    const bId = generateId();
    const bookmarkPayload: Bookmark = {
      id: bId,
      userId: user?.uid || "anonymous",
      title,
      url,
      category,
      description: description || "",
      createdAt: Date.now()
    };

    if (user && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "bookmarks", bId), bookmarkPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `bookmarks/${bId}`);
      }
    } else {
      const updatedBookmarks = [bookmarkPayload, ...bookmarks];
      setBookmarks(updatedBookmarks);
      localStorage.setItem("workspace_bookmarks", JSON.stringify(updatedBookmarks));
    }
  };

  // 11. UPDATE BOOKMARK
  const handleUpdateBookmark = async (id: string, title: string, url: string, category: BookmarkCategory, description?: string) => {
    const foundBookmark = bookmarks.find(b => b.id === id);
    if (!foundBookmark) return;

    const bookmarkPayload: Bookmark = {
      ...foundBookmark,
      title,
      url,
      category,
      description: description || ""
    };

    if (user && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "bookmarks", id), bookmarkPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `bookmarks/${id}`);
      }
    } else {
      const updatedBookmarks = bookmarks.map(b => b.id === id ? bookmarkPayload : b);
      setBookmarks(updatedBookmarks);
      localStorage.setItem("workspace_bookmarks", JSON.stringify(updatedBookmarks));
    }
  };

  // 12. DELETE BOOKMARK
  const handleDeleteBookmark = async (id: string) => {
    if (user && isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "bookmarks", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `bookmarks/${id}`);
      }
    } else {
      const updatedBookmarks = bookmarks.filter(b => b.id !== id);
      setBookmarks(updatedBookmarks);
      localStorage.setItem("workspace_bookmarks", JSON.stringify(updatedBookmarks));
    }
  };

  // 13. ADD PROJECT
  const handleAddProject = async (name: string, description?: string, completion: number = 0) => {
    const pId = generateId();
    const projectPayload: Project = {
      id: pId,
      userId: user?.uid || "anonymous",
      name,
      description: description || "",
      completion,
      createdAt: Date.now()
    };

    if (user && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "projects", pId), projectPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `projects/${pId}`);
      }
    } else {
      const updated = [projectPayload, ...projects];
      setProjects(updated);
      localStorage.setItem("workspace_projects", JSON.stringify(updated));
    }
  };

  // 14. UPDATE PROJECT
  const handleUpdateProject = async (id: string, name: string, description?: string, completion: number = 0) => {
    const foundProject = projects.find(p => p.id === id);
    if (!foundProject) return;

    const projectPayload: Project = {
      ...foundProject,
      name,
      description: description || "",
      completion
    };

    if (user && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "projects", id), projectPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
      }
    } else {
      const updated = projects.map(p => p.id === id ? projectPayload : p);
      setProjects(updated);
      localStorage.setItem("workspace_projects", JSON.stringify(updated));
    }
  };

  // 15. DELETE PROJECT
  const handleDeleteProject = async (id: string) => {
    if (user && isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "projects", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
      }
    } else {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem("workspace_projects", JSON.stringify(updated));
    }
  };

  // 9. CHAT ASSISTANT SEND MESSAGE
  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      sender: "user",
      text,
      timestamp: Date.now()
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    localStorage.setItem("workspace_chat_history", JSON.stringify(newHistory));

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(-6) // Send recent history for context
        })
      });

      if (!response.ok) {
        throw new Error("Tutor buddy is taking a short coffee break. Please retry.");
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: generateId(),
        sender: "ai",
        text: data.text,
        timestamp: Date.now()
      };

      const finalHistory = [...newHistory, aiMsg];
      setChatHistory(finalHistory);
      localStorage.setItem("workspace_chat_history", JSON.stringify(finalHistory));
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: generateId(),
        sender: "ai",
        text: `**System Alert**: ${err.message || "Could not retrieve message."}`,
        timestamp: Date.now()
      };
      setChatHistory([...newHistory, errorMsg]);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    localStorage.removeItem("workspace_chat_history");
  };


  // --- CALCULATING STATS & STREAK ---
  const calculateStreak = (): number => {
    if (logs.length === 0) return 0;
    // Map dates to local calendar string YYYY-MM-DD
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort();

    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If no logs found today or yesterday, streak is broken
    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      return 0;
    }

    let searchDateStr = uniqueDates.includes(todayStr) ? todayStr : yesterdayStr;
    const currentDateObj = new Date(searchDateStr);

    while (true) {
      const checkStr = currentDateObj.toISOString().split('T')[0];
      if (uniqueDates.includes(checkStr)) {
        streak++;
        currentDateObj.setDate(currentDateObj.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const dynamicStreak = calculateStreak();

  const userStatsVal: UserStats = {
    streak: dynamicStreak,
    lastStudyDate: logs[0]?.date || null,
    totalDsaSolved: problems.filter(p => p.status === 'solved').length,
    totalWebDevHours: logs.filter(l => l.category === 'web_dev').reduce((sum, l) => sum + l.duration, 0),
    totalDsaHours: logs.filter(l => l.category === 'dsa').reduce((sum, l) => sum + l.duration, 0),
    easyCount: problems.filter(p => p.difficulty === 'easy' && p.status === 'solved').length,
    mediumCount: problems.filter(p => p.difficulty === 'medium' && p.status === 'solved').length,
    hardCount: problems.filter(p => p.difficulty === 'hard' && p.status === 'solved').length
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col justify-between">
      
      {/* Top sticky brand header bar */}
      <Header 
        user={user} 
        loading={loading} 
        streak={dynamicStreak} 
        isDarkMode={isDarkMode} 
        onToggleTheme={handleToggleTheme} 
        isDeepWork={isDeepWork} 
        onToggleDeepWork={handleToggleDeepWork} 
        logs={logs}
        problems={problems}
        projects={projects}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 mb-8 mt-2 space-y-6">
        
        {/* Workspace Tab Buttons bar */}
        {!isDeepWork && (
          <div className="flex border border-slate-800/80 bg-slate-900/40 p-1.5 rounded-2xl backdrop-blur-md sticky top-[80px] z-40 overflow-x-auto gap-1.5 shadow-lg shadow-black/20 animate-fade-in">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 uppercase tracking-wider ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Workspace Dashboard
            </button>
            
            <button
              onClick={() => setActiveTab('dsa')}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 uppercase tracking-wider ${
                activeTab === 'dsa'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Code className="w-4 h-4" />
              DSA Log Tracker
            </button>

            <button
              onClick={() => setActiveTab('web_dev')}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 uppercase tracking-wider ${
                activeTab === 'web_dev'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Web Dev Portfolio
            </button>

            <button
              onClick={() => setActiveTab('buddy')}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 uppercase tracking-wider ${
                activeTab === 'buddy'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              StudyBuddy AI
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 uppercase tracking-wider ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              AI Study Planner
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 uppercase tracking-wider ${
                activeTab === 'library'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Library & Playlists
            </button>
          </div>
        )}

        {/* Tab view routing mount */}
        <div className="animated fade-in duration-200">
          {isDeepWork ? (
            <div className="flex flex-col items-center justify-center py-6 md:py-12 max-w-4xl mx-auto space-y-8 min-h-[60vh] relative">
              
              {/* Backlight Glow for atmospheric effect */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />

              {/* Distraction free quote or text heading */}
              <div className="text-center space-y-3 z-10 max-w-lg select-none">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest leading-none">
                  Focus Zone Active
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight flex items-center justify-center gap-2">
                  <Brain className="w-5.5 h-5.5 text-emerald-400 animate-pulse" />
                  <span>Deep Work Sanctuary</span>
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  “The ability to perform deep work is becoming increasingly rare at the exact same time it is becoming increasingly valuable.” — Cal Newport
                </p>
              </div>

              {/* The Single Focused Timer & Work Log Widget */}
              <div className="w-full max-w-xl z-20 transition-all duration-300 hover:scale-[1.01]">
                <DailyActiveStudyTimer onAddLog={handleAddLog} />
              </div>

              {/* Subtle tips to return */}
              <p className="text-[10px] text-slate-500 font-mono z-10 text-center opacity-70">
                Suspend extra UI tabs. Click <strong className="text-emerald-400 px-1 font-bold">Deep Work</strong> in the header above to exit.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  logs={logs}
                  stats={userStatsVal}
                  goal={goal}
                  updateGoal={handleUpdateGoal}
                  onAddLog={handleAddLog}
                  onDeleteLog={handleDeleteLog}
                  problems={problems}
                  webDevLogs={webDevLogs}
                  projects={projects}
                  onAddProject={handleAddProject}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                />
              )}

              {activeTab === 'dsa' && (
                <DsaProblemTracker
                  problems={problems}
                  onAddProblem={handleAddProblem}
                  onDeleteProblem={handleDeleteProblem}
                  onAddLog={handleAddLog}
                />
              )}

              {activeTab === 'web_dev' && (
                <WebDevTracker
                  logs={webDevLogs}
                  onAddLog={handleAddWebDevLog}
                  onDeleteLog={handleDeleteWebDevLog}
                  onAddLogGeneral={handleAddLog}
                />
              )}

              {activeTab === 'buddy' && (
                <AIStudyBuddy
                  chatHistory={chatHistory}
                  onSendMessage={handleSendChatMessage}
                  onClearChat={handleClearChat}
                />
              )}

              {activeTab === 'planner' && (
                <AIPracticeAdvisor
                  onSaveRoadmap={handleSaveRoadmap}
                  savedRoadmaps={savedRoadmaps}
                  onDeleteRoadmap={handleDeleteRoadmap}
                />
              )}

              {activeTab === 'library' && (
                <EducationLibrary
                  bookmarks={bookmarks}
                  onAddBookmark={handleAddBookmark}
                  onUpdateBookmark={handleUpdateBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                  onAddStudyLog={handleAddLog}
                  user={user}
                />
              )}
            </>
          )}
        </div>

      </main>

      {/* Decorative footer credit */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur pb-6 pt-4 text-center select-none text-[10px] text-slate-600 flex items-center justify-center gap-1.5 flex-col md:flex-row md:gap-4 shrink-0">
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-indigo-500" /> Powered by Gemini LLM & Cloud Firestore
        </span>
        <span className="hidden md:inline text-slate-800">•</span>
        <span>Organize your knowledge & build amazing software.</span>
      </footer>

      {/* Floating global Pomodoro study module tracker */}
      {!isDeepWork && <PomodoroTimer onAddLog={handleAddLog} />}

      {/* First-visit onboarding informational tour */}
      <WelcomeModal goal={goal} updateGoal={handleUpdateGoal} />

    </div>
  );
}
