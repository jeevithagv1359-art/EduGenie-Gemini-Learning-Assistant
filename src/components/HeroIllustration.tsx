import React, { useState } from 'react';
import { Sparkles, Atom, BookOpen, Brain, Calculator, Compass, Stars } from 'lucide-react';

interface HeroIllustrationProps {
  className?: string;
}

export const HeroIllustration: React.FC<HeroIllustrationProps> = ({ className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-1 shadow-2xl ring-1 ring-white/10 ${className}`}>
      {/* Ambient background glow effects */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900/80">
        {!imgError ? (
          <>
            {/* Loading skeleton */}
            {!imgLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-950/60 animate-pulse text-indigo-300">
                <Brain className="w-12 h-12 mb-3 text-indigo-400 animate-bounce" />
                <p className="text-sm font-medium">Preparing EduGenie visual universe...</p>
              </div>
            )}
            <img
              src="/hero-illustration.jpg"
              alt="EduGenie AI Learning Assistant with student, books, laptop, and floating science symbols"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-opacity duration-700 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          /* High-Fidelity SVG/CSS Educational Fallback */
          <div className="relative h-full w-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white">
            {/* Floating STEM Icons */}
            <div className="absolute top-8 left-10 flex items-center gap-2 rounded-xl bg-indigo-500/20 backdrop-blur-md px-3 py-1.5 border border-indigo-400/30 text-xs text-indigo-200">
              <Atom className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>Physics & Science</span>
            </div>
            <div className="absolute bottom-8 left-12 flex items-center gap-2 rounded-xl bg-amber-500/20 backdrop-blur-md px-3 py-1.5 border border-amber-400/30 text-xs text-amber-200">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Math: E = mc² & Calculus</span>
            </div>
            <div className="absolute top-10 right-10 flex items-center gap-2 rounded-xl bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 border border-emerald-400/30 text-xs text-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Gemini 3.8 Powered</span>
            </div>

            {/* Central Animated Graphic */}
            <div className="relative flex flex-col items-center">
              <div className="relative flex items-center justify-center h-28 w-28 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 p-1 shadow-lg shadow-indigo-500/50">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
                  <Brain className="h-14 w-14 text-indigo-300" />
                </div>
                <div className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md">
                  <Stars className="h-4 w-4" />
                </div>
              </div>
              <h3 className="mt-5 text-xl font-bold text-white tracking-tight">EduGenie Study Studio</h3>
              <p className="mt-1 text-xs text-indigo-200 text-center max-w-sm">
                Interactive intelligent explanations, visual concept breakdown, and adaptive learning pathways
              </p>
            </div>
          </div>
        )}

        {/* Floating live badge overlays */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/10 shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Tutor Active</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-indigo-950/80 backdrop-blur-md px-3 py-1 text-xs font-medium text-indigo-200 border border-indigo-500/20 shadow-lg">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multilingual Tutoring</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-950/80 backdrop-blur-md px-3 py-1 text-xs font-medium text-amber-200 border border-amber-500/20 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Visual Concept Reasoning</span>
          </div>
        </div>
      </div>
    </div>
  );
};
