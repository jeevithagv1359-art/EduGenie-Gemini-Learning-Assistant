export type Language = 'English' | 'Tamil' | 'Hindi' | 'Telugu' | 'Kannada';
export type StudentLevel = 'Beginner' | 'School Student' | 'College Student' | 'Advanced';
export type ResponseStyle = 'Concise' | 'Balanced' | 'Detailed';
export type FontSize = 'normal' | 'large' | 'xlarge';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: {
    data: string; // base64
    mimeType: string;
    name?: string;
  };
  reaction?: 'liked' | 'disliked' | null;
  saved?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'tf' | 'short';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export interface QuizData {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  questions: QuizQuestion[];
  revisionTopics: string[];
  createdAt: number;
  score?: number;
  userAnswers?: Record<string, string>;
  completed?: boolean;
}

export interface Milestone {
  id: string;
  topic: string;
  objective: string;
  recommendedActivity: string;
  practiceTask: string;
  completed: boolean;
}

export interface LearningWeek {
  weekNumber: number;
  title: string;
  objective: string;
  milestones: Milestone[];
}

export interface LearningPathData {
  id: string;
  title: string;
  subject: string;
  currentLevel: string;
  goal: string;
  availableTime: string;
  targetDate: string;
  overview: string;
  estimatedHours: string;
  weeks: LearningWeek[];
  studyTips: string[];
  createdAt: number;
  updatedAt: number;
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  definitions: Array<{ term: string; definition: string }>;
  formulas: string[];
  examPoints: string[];
  flashcards: Array<{ question: string; answer: string }>;
}

export interface ConceptSimplification {
  level: string;
  simpleExplanation: string;
  analogy: string;
  realLifeExample: string;
  stepByStep: string[];
  quickCheckQuestion: string;
}

export interface SavedItem {
  id: string;
  title: string;
  content: string;
  subject?: string;
  timestamp: number;
  type: 'answer' | 'summary' | 'concept' | 'flashcard';
  tags?: string[];
}

export interface StudySessionHistory {
  id: string;
  title: string;
  type: 'chat' | 'quiz' | 'summary' | 'path';
  timestamp: number;
  snippet: string;
  data?: any;
}

export interface UserSettings {
  language: Language;
  studentLevel: StudentLevel;
  responseStyle: ResponseStyle;
  fontSize: FontSize;
  soundEffects: boolean;
  studyStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
}
