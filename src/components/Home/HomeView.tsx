import React from 'react';
import {
  Sparkles,
  Bot,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  Target,
  BarChart3,
  ArrowRight,
  Zap,
  BookOpen,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { HeroIllustration } from '../HeroIllustration';

interface HomeViewProps {
  onNavigate: (tab: string, initialPrompt?: string) => void;
}

const FEATURE_CARDS = [
  {
    icon: Bot,
    title: 'AI Tutor',
    emoji: '🤖',
    desc: 'Adaptive multi-level tutoring from school basics to advanced derivations with step-by-step clarity.',
    tab: 'chat',
    color: 'from-blue-500/10 to-indigo-500/10 border-indigo-100 text-indigo-700',
  },
  {
    icon: ImageIcon,
    title: 'Image Learning',
    emoji: '🖼️',
    desc: 'Upload diagrams, handwritten equations, textbook charts, and science graphs for instant AI analysis.',
    tab: 'chat',
    color: 'from-violet-500/10 to-purple-500/10 border-violet-100 text-violet-700',
  },
  {
    icon: FileText,
    title: 'Smart Summaries',
    emoji: '📄',
    desc: 'Condense long chapters into high-yield key points, core definitions, formulas, and flashcards.',
    tab: 'summarizer',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-100 text-amber-700',
  },
  {
    icon: HelpCircle,
    title: 'AI Quizzes',
    emoji: '❓',
    desc: 'Test knowledge with dynamic MCQs, True/False, instant scoring, answer explanations, and revision hints.',
    tab: 'quiz',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-100 text-emerald-700',
  },
  {
    icon: Target,
    title: 'Learning Paths',
    emoji: '🎯',
    desc: 'Generate weekly personalized roadmaps with actionable milestones, practice tasks, and progress tracking.',
    tab: 'path',
    color: 'from-rose-500/10 to-pink-500/10 border-rose-100 text-rose-700',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    emoji: '📊',
    desc: 'Monitor study streaks, average quiz scores, mastered topics, and saved concept cards in one place.',
    tab: 'dashboard',
    color: 'from-cyan-500/10 to-sky-500/10 border-cyan-100 text-cyan-700',
  },
];

const SAMPLE_QUESTIONS = [
  { prompt: 'What is photosynthesis?', label: 'Direct Answer + Explanation' },
  { prompt: 'A 1000 kg car accelerates from 0 to 20 m/s in 4 seconds. Calculate the net force.', label: 'Physics Numerical: Given • Formula • Calculation' },
  { prompt: 'Which organelle produces ATP? A) Ribosome B) Mitochondria C) Golgi apparatus D) Nucleus', label: 'MCQ: Correct Option Analysis' },
  { prompt: 'ஒளிச்சேர்க்கை (Photosynthesis) மற்றும் அதன் முக்கியத்துவத்தை விளக்குக.', label: 'Tamil Academic Tutor' },
  { prompt: 'Just give the answer: What is the definite integral of 3x^2 dx from 1 to 3?', label: 'Direct Answer Only' },
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 px-6 py-12 sm:px-12 sm:py-16 text-white shadow-xl">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            {/* Super tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-indigo-200 backdrop-blur-md border border-white/15 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Gemini Powered Learning Assistant</span>
            </div>

            {/* Main title */}
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              EduGenie
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-sky-200 to-amber-200 text-2xl sm:text-3xl lg:text-4xl mt-2 font-bold">
                Your Personal AI Learning Assistant
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-lg sm:text-xl font-medium text-indigo-100/90 max-w-2xl italic">
              “Learn smarter. Understand faster. Study better.”
            </p>

            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              From breaking down complex STEM proofs and image diagrams to customized study roadmaps and dynamic quizzes, EduGenie accelerates your academic success.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('chat')}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-102 active:scale-98 transition-all cursor-pointer"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className="flex items-center gap-2 rounded-2xl bg-white/15 px-6 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-98 transition-all cursor-pointer"
              >
                <span>Ask EduGenie</span>
              </button>

              <button
                onClick={() => onNavigate('quiz')}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 active:scale-98 transition-all cursor-pointer"
              >
                <span>Generate Quiz</span>
              </button>
            </div>

            {/* Quick Starter Chips */}
            <div className="mt-8 flex flex-col items-center">
              <span className="text-xs font-semibold text-indigo-300/80 uppercase tracking-wider mb-2">
                Try asking right now:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
                {SAMPLE_QUESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate('chat', item.prompt)}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 px-3.5 py-1.5 text-xs text-indigo-100 transition-all hover:scale-102 cursor-pointer text-left"
                  >
                    <span className="text-amber-300">✦</span>
                    <span className="font-medium">“{item.prompt}”</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="mt-12">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Master Any Subject
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Powered by state-of-the-art Google Gemini 3.8 Flash multimodal reasoning designed for students and educators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(card.tab)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border-slate-200/80`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{card.emoji}</span>
                    <span className="rounded-full bg-slate-100 p-2 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why EduGenie Banner */}
      <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/60 p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
              Interactive Academic Experience
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Built for Real Learning, Not Just Quick Answers
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike generic chat bots, EduGenie checks your prerequisites, asks clarifying questions when a question is ambiguous, renders formatted mathematical equations, and builds step-by-step problem derivations so you truly understand the concepts.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Zero Hallucinated Math</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Multimodal Vision</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>5 Regional Languages</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 px-4 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Tutor Now</span>
            </button>
            <button
              onClick={() => onNavigate('path')}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 py-3 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Build Custom Roadmap</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
