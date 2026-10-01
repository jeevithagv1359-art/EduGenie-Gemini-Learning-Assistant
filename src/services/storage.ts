import {
  ChatMessage,
  QuizData,
  LearningPathData,
  SavedItem,
  StudySessionHistory,
  UserSettings,
} from '../types';

const STORAGE_KEYS = {
  CHAT_MESSAGES: 'edugenie_chat_messages',
  SAVED_ITEMS: 'edugenie_saved_items',
  STUDY_HISTORY: 'edugenie_study_history',
  LEARNING_PATHS: 'edugenie_learning_paths',
  ACTIVE_PATH: 'edugenie_active_learning_path',
  QUIZ_HISTORY: 'edugenie_quiz_history',
  USER_SETTINGS: 'edugenie_user_settings',
};

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'English',
  studentLevel: 'School Student',
  responseStyle: 'Balanced',
  fontSize: 'normal',
  soundEffects: true,
  studyStreak: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
};

// Safe JSON parser
function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function safeSet(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// User Settings & Streak
export function getStoredSettings(): UserSettings {
  const settings = safeGet<UserSettings>(STORAGE_KEYS.USER_SETTINGS, DEFAULT_SETTINGS);
  // Auto-update streak
  const today = new Date().toISOString().split('T')[0];
  if (settings.lastStudyDate !== today) {
    const lastDate = new Date(settings.lastStudyDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      settings.studyStreak += 1;
    } else if (diffDays > 1) {
      settings.studyStreak = 1;
    }
    settings.lastStudyDate = today;
    safeSet(STORAGE_KEYS.USER_SETTINGS, settings);
  }
  return settings;
}

export function saveStoredSettings(settings: UserSettings): void {
  safeSet(STORAGE_KEYS.USER_SETTINGS, settings);
}

// Chat Messages
export function getStoredChat(): ChatMessage[] {
  return safeGet<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
}

export function saveStoredChat(messages: ChatMessage[]): void {
  safeSet(STORAGE_KEYS.CHAT_MESSAGES, messages);
}

export function clearStoredChat(): void {
  localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
}

// Saved Learning
export function getSavedItems(): SavedItem[] {
  return safeGet<SavedItem[]>(STORAGE_KEYS.SAVED_ITEMS, []);
}

export function addSavedItem(item: Omit<SavedItem, 'id' | 'timestamp'>): SavedItem {
  const items = getSavedItems();
  const newItem: SavedItem = {
    ...item,
    id: 'save-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
  };
  items.unshift(newItem);
  safeSet(STORAGE_KEYS.SAVED_ITEMS, items);
  return newItem;
}

export function removeSavedItem(id: string): void {
  const items = getSavedItems().filter((i) => i.id !== id);
  safeSet(STORAGE_KEYS.SAVED_ITEMS, items);
}

// Study History
export function getStudyHistory(): StudySessionHistory[] {
  return safeGet<StudySessionHistory[]>(STORAGE_KEYS.STUDY_HISTORY, []);
}

export function addHistoryEntry(entry: Omit<StudySessionHistory, 'id' | 'timestamp'>): void {
  const history = getStudyHistory();
  const newEntry: StudySessionHistory = {
    ...entry,
    id: 'hist-' + Date.now(),
    timestamp: Date.now(),
  };
  history.unshift(newEntry);
  // Cap at 100 entries
  if (history.length > 100) history.pop();
  safeSet(STORAGE_KEYS.STUDY_HISTORY, history);
}

export function deleteHistoryEntry(id: string): void {
  const history = getStudyHistory().filter((h) => h.id !== id);
  safeSet(STORAGE_KEYS.STUDY_HISTORY, history);
}

export function clearStudyHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.STUDY_HISTORY);
}

// Quizzes
export function getQuizHistory(): QuizData[] {
  return safeGet<QuizData[]>(STORAGE_KEYS.QUIZ_HISTORY, []);
}

export function saveQuizResult(quiz: QuizData): void {
  const quizzes = getQuizHistory();
  const existingIdx = quizzes.findIndex((q) => q.id === quiz.id);
  if (existingIdx >= 0) {
    quizzes[existingIdx] = quiz;
  } else {
    quizzes.unshift(quiz);
  }
  safeSet(STORAGE_KEYS.QUIZ_HISTORY, quizzes);

  // Also add to study history
  addHistoryEntry({
    title: quiz.title || `${quiz.subject} Quiz`,
    type: 'quiz',
    snippet: `Score: ${quiz.score ?? 0}/${quiz.totalQuestions} (${Math.round(((quiz.score ?? 0) / quiz.totalQuestions) * 100)}%)`,
    data: quiz,
  });
}

// Learning Paths
export function getLearningPaths(): LearningPathData[] {
  return safeGet<LearningPathData[]>(STORAGE_KEYS.LEARNING_PATHS, []);
}

export function saveLearningPath(path: LearningPathData): void {
  const paths = getLearningPaths();
  const existingIdx = paths.findIndex((p) => p.id === path.id);
  if (existingIdx >= 0) {
    paths[existingIdx] = path;
  } else {
    paths.unshift(path);
  }
  safeSet(STORAGE_KEYS.LEARNING_PATHS, paths);
  safeSet(STORAGE_KEYS.ACTIVE_PATH, path);

  addHistoryEntry({
    title: path.title,
    type: 'path',
    snippet: `Roadmap for ${path.subject} (${path.weeks.length} Weeks)`,
    data: path,
  });
}

export function getActiveLearningPath(): LearningPathData | null {
  return safeGet<LearningPathData | null>(STORAGE_KEYS.ACTIVE_PATH, null);
}

export function updateActiveLearningPath(path: LearningPathData): void {
  safeSet(STORAGE_KEYS.ACTIVE_PATH, path);
  const paths = getLearningPaths();
  const idx = paths.findIndex((p) => p.id === path.id);
  if (idx >= 0) {
    paths[idx] = path;
    safeSet(STORAGE_KEYS.LEARNING_PATHS, paths);
  }
}

// Dashboard Aggregate Metrics
export function getDashboardStats() {
  const history = getStudyHistory();
  const quizzes = getQuizHistory();
  const activePath = getActiveLearningPath();
  const settings = getStoredSettings();

  // Topics studied (count unique topics/titles in history)
  const uniqueTopics = new Set(history.map((h) => h.title.trim().toLowerCase())).size;

  // Quizzes taken & average score
  const completedQuizzes = quizzes.filter((q) => q.completed);
  const totalScorePercent = completedQuizzes.reduce((acc, q) => {
    const pct = q.totalQuestions > 0 ? ((q.score || 0) / q.totalQuestions) * 100 : 0;
    return acc + pct;
  }, 0);
  const averageScore = completedQuizzes.length > 0 ? Math.round(totalScorePercent / completedQuizzes.length) : 85;

  // Completed Milestones in learning path
  let completedMilestones = 0;
  let totalMilestones = 0;
  if (activePath) {
    for (const week of activePath.weeks) {
      for (const m of week.milestones) {
        totalMilestones++;
        if (m.completed) completedMilestones++;
      }
    }
  }

  return {
    topicsStudied: Math.max(uniqueTopics, history.length),
    quizzesTaken: completedQuizzes.length,
    averageScore,
    studyStreak: settings.studyStreak,
    completedLessons: completedMilestones,
    totalLessons: totalMilestones,
  };
}

// Clear all data
export function clearAllEduGenieData(): void {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}
