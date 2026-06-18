export interface StudyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  category: 'dsa' | 'web_dev' | 'core_cse' | 'lab_practical';
  title: string;
  duration: number; // in minutes
  notes: string;
  createdAt: number;
}

export type ProblemDifficulty = 'easy' | 'medium' | 'hard';
export type ProblemStatus = 'solved' | 'revise_needed' | 'attempted';

export interface DsaProblem {
  id: string;
  userId: string;
  problemName: string;
  platform: string; // e.g. LeetCode, GFG, HackerRank
  topic: string; // e.g. Arrays, Trees, Dynamic Programming
  difficulty: ProblemDifficulty;
  status: ProblemStatus;
  solutionCode?: string;
  notes?: string;
  url?: string;
  dateSolved: string; // YYYY-MM-DD
  createdAt: number;
}

export interface WebDevLog {
  id: string;
  userId: string;
  projectTitle: string;
  skillsUsed: string[]; // e.g. ['React', 'Tailwind']
  learnings: string;
  demoUrl?: string;
  codeUrl?: string;
  dateLogged: string; // YYYY-MM-DD
  createdAt: number;
}

export interface DailyGoal {
  dsaProblemsTarget: number;
  studyMinutesTarget: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface UserStats {
  streak: number;
  lastStudyDate: string | null;
  totalDsaSolved: number;
  totalWebDevHours: number;
  totalDsaHours: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export type BookmarkCategory = 'documentation' | 'lecture_playlist' | 'engineering_resource' | 'other';

export interface Bookmark {
  id: string;
  userId: string;
  title: string;
  url: string;
  category: BookmarkCategory;
  description?: string;
  createdAt: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  completion: number;
  createdAt: number;
}

