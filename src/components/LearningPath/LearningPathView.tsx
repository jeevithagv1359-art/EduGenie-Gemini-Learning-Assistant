import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Zap,
  HelpCircle,
  Award,
  Bot,
  Layers,
} from 'lucide-react';
import { LearningPathData, UserSettings } from '../../types';
import { generateLearningPath } from '../../services/api';
import {
  getActiveLearningPath,
  saveLearningPath,
  updateActiveLearningPath,
} from '../../services/storage';
import { useToast } from '../Common/Toast';

interface LearningPathViewProps {
  settings: UserSettings;
  onNavigateToChat: (prompt: string) => void;
}

const PRESET_PATH_SUGGESTIONS = [
  {
    subject: 'Data Structures and Algorithms',
    currentLevel: 'Beginner',
    goal: 'Pass technical coding interviews',
    availableTime: '6 hours / week',
    targetDate: '4 weeks',
  },
  {
    subject: 'High School AP Physics',
    currentLevel: 'Intermediate',
    goal: 'Score 5 on the AP Exam',
    availableTime: '4 hours / week',
    targetDate: '4 weeks',
  },
  {
    subject: 'Organic Chemistry Reactions',
    currentLevel: 'School Student',
    goal: 'Master mechanisms & synthesis problems',
    availableTime: '5 hours / week',
    targetDate: '4 weeks',
  },
];

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  settings,
  onNavigateToChat,
}) => {
  const { showToast } = useToast();
  const [activePath, setActivePath] = useState<LearningPathData | null>(() => getActiveLearningPath());

  // Input states
  const [subject, setSubject] = useState('');
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [goal, setGoal] = useState('Master all core concepts for upcoming exams');
  const [availableTime, setAvailableTime] = useState('5 hours per week');
  const [targetDate, setTargetDate] = useState('4 weeks');
  const [isGenerating, setIsGenerating] = useState(false);

  // Milestone completion toggle
  const toggleMilestone = (weekIndex: number, milestoneId: string) => {
    if (!activePath) return;

    const newWeeks = activePath.weeks.map((week, wIdx) => {
      if (wIdx !== weekIndex) return week;
      return {
        ...week,
        milestones: week.milestones.map((m) => {
          if (m.id === milestoneId) {
            const nextCompleted = !m.completed;
            if (nextCompleted) {
              showToast(`Completed milestone: ${m.topic} 🎉`, 'success');
            }
            return { ...m, completed: nextCompleted };
          }
          return m;
        }),
      };
    });

    const updated: LearningPathData = {
      ...activePath,
      weeks: newWeeks,
      updatedAt: Date.now(),
    };

    setActivePath(updated);
    updateActiveLearningPath(updated);

    // If 100% completed, trigger confetti
    const total = newWeeks.reduce((acc, w) => acc + w.milestones.length, 0);
    const completed = newWeeks.reduce(
      (acc, w) => acc + w.milestones.filter((m) => m.completed).length,
      0
    );
    if (completed === total && total > 0) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      showToast('Incredible! You completed your entire learning roadmap! 🏆', 'success');
    }
  };

  const handleGeneratePath = async () => {
    if (!subject.trim()) {
      showToast('Please specify a subject for the roadmap.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const pathData = await generateLearningPath({
        subject,
        currentLevel,
        goal,
        availableTime,
        targetDate,
        language: settings.language,
      });

      setActivePath(pathData);
      saveLearningPath(pathData);
      showToast('Personalized learning roadmap created!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create roadmap.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate progress
  let totalMilestones = 0;
  let completedMilestones = 0;
  if (activePath) {
    activePath.weeks.forEach((w) => {
      w.milestones.forEach((m) => {
        totalMilestones++;
        if (m.completed) completedMilestones++;
      });
    });
  }
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Learning Path
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Create milestone-based structured study roadmaps with weekly goals, activities, and progress tracking.
          </p>
        </div>

        {activePath && (
          <button
            onClick={() => setActivePath(null)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Create New Roadmap</span>
          </button>
        )}
      </div>

      {/* Generator Form if no active path or creating new */}
      {!activePath && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          {/* Quick presets */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Popular Study Plans:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_PATH_SUGGESTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSubject(preset.subject);
                    setCurrentLevel(preset.currentLevel);
                    setGoal(preset.goal);
                    setAvailableTime(preset.availableTime);
                    setTargetDate(preset.targetDate);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-900 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-rose-700">{preset.subject}</span> ({preset.targetDate})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Subject to Master
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Linear Algebra, World History, Organic Chemistry"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Current Knowledge Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-hidden"
              >
                <option value="Beginner">Beginner (Starting from scratch)</option>
                <option value="Intermediate">Intermediate (Know basics, need practice)</option>
                <option value="Advanced">Advanced (Exam readiness & speed)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Specific Learning Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Score 90%+ in exam"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Available Study Time
              </label>
              <input
                type="text"
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                placeholder="e.g. 5 hours / week"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Duration
              </label>
              <select
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-hidden"
              >
                <option value="2 weeks">2 Weeks (Intensive Crash Course)</option>
                <option value="4 weeks">4 Weeks (Standard Comprehensive)</option>
                <option value="8 weeks">8 Weeks (In-Depth Semester Prep)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGeneratePath}
            disabled={isGenerating || !subject.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-4 shadow-md shadow-rose-600/25 active:scale-98 disabled:bg-slate-300 disabled:shadow-none transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Designing Custom Curriculum...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Structured Learning Path</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Active Roadmap View */}
      {activePath && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 uppercase tracking-wider">
                  Target: {activePath.targetDate || '4 Weeks'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {activePath.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {activePath.overview}
                </p>
              </div>

              {/* Progress percentage badge */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-3 sm:p-4 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-black text-rose-600">{progressPercent}%</span>
                  <p className="text-[11px] font-medium text-slate-500">
                    {completedMilestones} of {totalMilestones} Completed
                  </p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Weekly Milestones List */}
          <div className="space-y-6">
            {activePath.weeks.map((week, wIdx) => {
              const weekTotal = week.milestones.length;
              const weekCompleted = week.milestones.filter((m) => m.completed).length;

              return (
                <div
                  key={wIdx}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white text-xs font-bold">
                        W{week.weekNumber}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{week.title}</h3>
                        <p className="text-xs text-slate-500">{week.objective}</p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-500">
                      {weekCompleted}/{weekTotal} Done
                    </span>
                  </div>

                  {/* Milestones in this week */}
                  <div className="space-y-3">
                    {week.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          milestone.completed
                            ? 'border-emerald-200 bg-emerald-50/40 text-slate-600'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                            <input
                              type="checkbox"
                              checked={milestone.completed}
                              onChange={() => toggleMilestone(wIdx, milestone.id)}
                              className="mt-1 h-4 w-4 rounded-md border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                            <div>
                              <p
                                className={`text-sm font-bold ${
                                  milestone.completed
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-900'
                                }`}
                              >
                                {milestone.topic}
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5">{milestone.objective}</p>
                            </div>
                          </label>

                          {/* Quick AI Tutor Help Button for this Milestone */}
                          <button
                            onClick={() =>
                              onNavigateToChat(
                                `Hi EduGenie, I am working on my learning roadmap topic: "${milestone.topic}". Please teach me this with clear explanations and examples!`
                              )
                            }
                            className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-2xs shrink-0 cursor-pointer"
                            title="Study this topic with AI Tutor"
                          >
                            <Bot className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="hidden sm:inline">Ask EduGenie</span>
                          </button>
                        </div>

                        {/* Activity & Practice Details */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <div className="flex items-start gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-slate-700">Activity:</strong> {milestone.recommendedActivity}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-slate-700">Practice:</strong> {milestone.practiceTask}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Study Tips */}
          {activePath.studyTips && activePath.studyTips.length > 0 && (
            <div className="rounded-3xl border border-amber-200/80 bg-amber-50/60 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Success Strategies for This Roadmap</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-amber-900/90">
                {activePath.studyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
