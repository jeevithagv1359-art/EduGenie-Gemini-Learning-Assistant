import React from 'react';
import {
  LayoutDashboard,
  Flame,
  BookOpen,
  HelpCircle,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Bot,
  Bookmark,
  Calendar,
} from 'lucide-react';
import { UserSettings } from '../../types';
import {
  getDashboardStats,
  getStudyHistory,
  getQuizHistory,
  getActiveLearningPath,
  getSavedItems,
} from '../../services/storage';

interface DashboardViewProps {
  settings: UserSettings;
  onNavigate: (tab: string, initialPrompt?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ settings, onNavigate }) => {
  const stats = getDashboardStats();
  const history = getStudyHistory().slice(0, 5);
  const quizzes = getQuizHistory().slice(0, 4);
  const activePath = getActiveLearningPath();
  const savedItems = getSavedItems().slice(0, 3);

  // Weekly study time mock chart points for smooth SVG curve
  const weeklyData = [
    { day: 'Mon', hours: 1.5, score: 85 },
    { day: 'Tue', hours: 2.0, score: 90 },
    { day: 'Wed', hours: 0.8, score: 78 },
    { day: 'Thu', hours: 2.5, score: 92 },
    { day: 'Fri', hours: 1.8, score: 88 },
    { day: 'Sat', hours: 3.2, score: 95 },
    { day: 'Sun', hours: 2.1, score: 89 },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-violet-600/30 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Welcome Back, Student Scholar!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Your Academic Command Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-200 max-w-xl">
              Track your daily study streaks, quiz test scores, concept roadmaps, and instant AI tutor interactions.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask EduGenie</span>
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-white backdrop-blur-md transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Take Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Primary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Topics Studied */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Topics
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{stats.topicsStudied}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Explored with AI</p>
        </div>

        {/* Quizzes Taken */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quizzes
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{stats.quizzesTaken}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Tests Completed</p>
        </div>

        {/* Average Score */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Score
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-cyan-600">{stats.averageScore}%</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Mastery Rating</p>
        </div>

        {/* Study Streak */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Streak
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-600">{stats.studyStreak} Days</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Active Consistency</p>
        </div>

        {/* Completed Lessons */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Milestones
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-600">{stats.completedLessons}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            of {stats.totalLessons || '0'} Roadmap Steps
          </p>
        </div>
      </div>

      {/* Weekly Activity Performance Chart & Active Roadmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Weekly Study Time & Retention
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">Past 7 Days</span>
          </div>

          {/* Bar / Column Chart */}
          <div className="pt-4">
            <div className="flex items-end justify-between h-44 gap-2 border-b border-slate-100 pb-2">
              {weeklyData.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.hours}h
                  </span>
                  <div
                    className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-500 transition-all group-hover:brightness-110 shadow-xs"
                    style={{ height: `${(d.hours / 3.5) * 120}px` }}
                  />
                  <span className="text-xs font-semibold text-slate-600">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                <span>Daily Active Study Hours</span>
              </span>
              <span>Total: 13.9 Hours This Week</span>
            </div>
          </div>
        </div>

        {/* Active Learning Path Progress Mini Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 uppercase">
                Active Roadmap
              </span>
              <button
                onClick={() => onNavigate('path')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                View All
              </button>
            </div>

            {activePath ? (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {activePath.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {activePath.overview}
                </p>

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>
                      {stats.completedLessons}/{stats.totalLessons} Completed
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{
                        width: `${
                          stats.totalLessons > 0
                            ? (stats.completedLessons / stats.totalLessons) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-4">No active learning roadmap yet.</p>
                <button
                  onClick={() => onNavigate('path')}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
                >
                  Create Your Roadmap
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('path')}
            className="mt-6 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-50 border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span>Resume Learning Path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Activity & Recent Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Study Activity */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Recent Questions & Sessions</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Full History
            </button>
          </div>

          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('chat', item.title)}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.snippet}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(item.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No recent study questions yet. Ask EduGenie something!
            </p>
          )}
        </div>

        {/* Quiz Performance */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Quiz Performance Log</h3>
            <button
              onClick={() => onNavigate('quiz')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              New Quiz
            </button>
          </div>

          {quizzes.length > 0 ? (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {quiz.title || quiz.topic}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {quiz.difficulty} • {quiz.totalQuestions} Questions
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600">
                      {quiz.score ?? 0}/{quiz.totalQuestions}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {Math.round(((quiz.score ?? 0) / quiz.totalQuestions) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500 mb-3">No quizzes taken yet.</p>
              <button
                onClick={() => onNavigate('quiz')}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                Generate First Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
