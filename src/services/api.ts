import {
  ChatMessage,
  QuizData,
  LearningPathData,
  SummaryResult,
  ConceptSimplification,
  Language,
  StudentLevel,
  ResponseStyle,
} from '../types';

export class EduGenieApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'EduGenieApiError';
  }
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendMessageToTutor(params: {
  messages?: ChatMessage[];
  message: string;
  image?: { data: string; mimeType: string };
  language?: Language;
  level?: StudentLevel;
  style?: ResponseStyle;
}): Promise<string> {
  const formattedMessages = params.messages?.map((m) => ({
    role: m.role,
    content: m.content,
    image: m.image ? { data: m.image.data, mimeType: m.image.mimeType } : undefined,
  }));

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: formattedMessages,
      message: params.message,
      image: params.image,
      language: params.language,
      level: params.level,
      style: params.style,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new EduGenieApiError(
      errData.error || `Server responded with status ${res.status}. Please check your connection and try again.`,
      res.status
    );
  }

  const data = await res.json();
  return data.text || 'I did not receive a response from EduGenie. Please try again.';
}

export async function generateSummary(params: {
  text: string;
  length?: 'Short' | 'Medium' | 'Detailed';
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  language?: Language;
}): Promise<SummaryResult> {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new EduGenieApiError(
      errData.error || 'Failed to generate summary. Please try again.',
      res.status
    );
  }

  return res.json();
}

export async function simplifyConcept(params: {
  concept: string;
  level?: StudentLevel;
  language?: Language;
}): Promise<ConceptSimplification> {
  const res = await fetch('/api/simplify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new EduGenieApiError(
      errData.error || 'Failed to simplify concept. Please try again.',
      res.status
    );
  }

  return res.json();
}

export async function generateQuiz(params: {
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionType: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Mixed';
  numQuestions: number;
  language?: Language;
  studyMaterial?: string;
}): Promise<QuizData> {
  const res = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new EduGenieApiError(
      errData.error || 'Failed to generate quiz. Please try again.',
      res.status
    );
  }

  const data = await res.json();
  return {
    ...data,
    id: 'quiz-' + Date.now(),
    subject: params.subject,
    topic: params.topic,
    createdAt: Date.now(),
  };
}

export async function generateLearningPath(params: {
  subject: string;
  currentLevel: string;
  goal: string;
  availableTime: string;
  targetDate: string;
  language?: Language;
}): Promise<LearningPathData> {
  const res = await fetch('/api/learning-path', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new EduGenieApiError(
      errData.error || 'Failed to create learning path. Please try again.',
      res.status
    );
  }

  const data = await res.json();
  return {
    ...data,
    id: 'path-' + Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export async function analyzeStudyDocument(params: {
  text: string;
  fileName?: string;
  language?: Language;
}): Promise<any> {
  const res = await fetch('/api/document-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new EduGenieApiError(
      errData.error || 'Failed to analyze study material. Please try again.',
      res.status
    );
  }

  return res.json();
}
