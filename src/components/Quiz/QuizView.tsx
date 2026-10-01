import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Award,
  AlertCircle,
  Lightbulb,
  Clock,
  Layers,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import { QuizData, QuizQuestion, UserSettings } from '../../types';
import { generateQuiz } from '../../services/api';
import { saveQuizResult } from '../../services/storage';
import { useToast } from '../Common/Toast';

interface QuizViewProps {
  settings: UserSettings;
  initialTopic?: string;
  onNavigateToChat?: (prompt: string) => void;
}

const PRESET_TOPICS = [
  { subject: 'Biology', topic: 'Cell Division & Mitosis', difficulty: 'Medium' },
  { subject: 'Physics', topic: "Newton's Laws & Friction", difficulty: 'Medium' },
  { subject: 'Chemistry', topic: 'Chemical Bonding & Periodic Table', difficulty: 'Hard' },
  { subject: 'Computer Science', topic: 'Data Structures & Algorithms', difficulty: 'Medium' },
  { subject: 'Mathematics', topic: 'Calculus & Derivatives', difficulty: 'Hard' },
];

export const QuizView: React.FC<QuizViewProps> = ({
  settings,
  initialTopic,
  onNavigateToChat,
}) => {
  const { showToast } = useToast();

  // Generator inputs
  const [subject, setSubject] = useState('Science');
  const [topic, setTopic] = useState(initialTopic || 'Photosynthesis & Plant Energy');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionType, setQuestionType] = useState<'Multiple Choice' | 'True/False' | 'Mixed'>('Multiple Choice');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      showToast('Please enter a topic for the quiz.', 'error');
      return;
    }

    setIsGenerating(true);
    setActiveQuiz(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setShowHint({});

    try {
      const quiz = await generateQuiz({
        subject,
        topic,
        difficulty,
        questionType,
        numQuestions,
        language: settings.language,
      });

      setActiveQuiz(quiz);
      showToast('Quiz generated! Good luck!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate quiz.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Select answer for a question
  const handleSelectOption = (questionId: string, option: string) => {
    if (isSubmitted) return; // Prevent change after submission
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    // Check how many questions answered
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < activeQuiz.questions.length) {
      if (!confirm(`You have only answered ${answeredCount} of ${activeQuiz.questions.length} questions. Do you want to submit anyway?`)) {
        return;
      }
    }

    // Calculate score
    let calculatedScore = 0;
    activeQuiz.questions.forEach((q) => {
      const selected = userAnswers[q.id]?.trim();
      const correct = q.correctAnswer?.trim();
      if (selected && correct && selected.toLowerCase() === correct.toLowerCase()) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);

    const updatedQuiz: QuizData = {
      ...activeQuiz,
      score: calculatedScore,
      userAnswers,
      completed: true,
    };
    setActiveQuiz(updatedQuiz);
    saveQuizResult(updatedQuiz);

    // Launch confetti if score >= 60%
    const percentage = (calculatedScore / activeQuiz.questions.length) * 100;
    if (percentage >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    showToast(`Quiz completed! You scored ${calculatedScore}/${activeQuiz.questions.length}`, 'success');
  };

  // Retake current quiz
  const handleRetake = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setShowHint({});
    if (activeQuiz) {
      setActiveQuiz({
        ...activeQuiz,
        score: undefined,
        userAnswers: {},
        completed: false,
      });
    }
  };

  const currentQ = activeQuiz?.questions[currentQuestionIndex];
  const answeredPercentage = activeQuiz
    ? Math.round((Object.keys(userAnswers).length / activeQuiz.questions.length) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              AI Quiz Generator
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Generate dynamic practice exams, test your understanding, and get instant explanations.
          </p>
        </div>
      </div>

      {/* Quiz Configuration Panel */}
      {!activeQuiz && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
          {/* Quick presets */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Popular Study Topics:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_TOPICS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSubject(preset.subject);
                    setTopic(preset.topic);
                    setDifficulty(preset.difficulty as any);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-emerald-700">{preset.subject}:</span> {preset.topic}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics, Biology, History..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Thermodynamics, Photosynthesis..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Difficulty
              </label>
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      difficulty === diff
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="Multiple Choice">Multiple Choice (MCQ)</option>
                <option value="True/False">True / False</option>
                <option value="Mixed">Mixed Questions</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Questions: {numQuestions}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 shadow-md shadow-emerald-600/25 active:scale-98 disabled:bg-slate-300 disabled:shadow-none transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Crafting Custom Exam Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {numQuestions} Questions</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Active Quiz Card */}
      {activeQuiz && !isSubmitted && currentQ && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>
                {activeQuiz.title} • {activeQuiz.difficulty}
              </span>
              <span>
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Box */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQuestionIndex + 1}. {currentQ.question}
              </h2>
              {currentQ.hint && (
                <button
                  onClick={() =>
                    setShowHint((prev) => ({
                      ...prev,
                      [currentQ.id]: !prev[currentQ.id],
                    }))
                  }
                  className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 text-xs font-medium flex items-center gap-1 shrink-0"
                  title="Toggle hint"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Hint</span>
                </button>
              )}
            </div>

            {/* Hint Box */}
            {showHint[currentQ.id] && currentQ.hint && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{currentQ.hint}</span>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options?.map((option, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === option;
                const letter = String.fromCharCode(65 + optIdx);
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, option)}
                    className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-800'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                  >
                    <span>Submit Quiz</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Quiz Results Screen */}
      {activeQuiz && isSubmitted && (
        <div className="space-y-8">
          {/* Score Header Card */}
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 p-6 sm:p-8 shadow-sm text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30 mb-4">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">Quiz Completed!</h2>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="text-4xl font-black text-emerald-600">
                {score} / {activeQuiz.questions.length}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                {Math.round((score / activeQuiz.questions.length) * 100)}%
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto">
              {(score / activeQuiz.questions.length) >= 0.8
                ? 'Outstanding performance! You have mastered this concept thoroughly.'
                : (score / activeQuiz.questions.length) >= 0.6
                ? 'Good effort! Review the detailed explanations below to cement your understanding.'
                : 'Keep practicing! Review the explanations and revision topics below, then retake the quiz.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRetake}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => setActiveQuiz(null)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create New Quiz</span>
              </button>
            </div>
          </div>

          {/* Recommended Topics for Revision */}
          {activeQuiz.revisionTopics && activeQuiz.revisionTopics.length > 0 && (
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span>Suggested Topics for Revision</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeQuiz.revisionTopics.map((topicItem, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigateToChat && onNavigateToChat(`Teach me this revision topic in detail: ${topicItem}`)}
                    className="flex items-center gap-1 rounded-xl bg-white border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{topicItem}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Question-by-Question Review</h3>
            {activeQuiz.questions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns && userAns.toLowerCase() === q.correctAnswer.toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-5 shadow-2xs space-y-3 ${
                    isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      {idx + 1}. {q.question}
                    </p>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500">Your Answer:</span>
                      <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {userAns || '(Not answered)'}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">Correct Answer:</span>
                        <span className="text-emerald-700 font-bold">{q.correctAnswer}</span>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="rounded-xl bg-white/80 border border-slate-200/80 p-3 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">Explanation:</span>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
