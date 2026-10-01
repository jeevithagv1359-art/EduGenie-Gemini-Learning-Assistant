import React from 'react';
import {
  Sparkles,
  Flame,
  Globe,
  Menu,
  X,
  GraduationCap,
  Brain,
  ChevronDown,
} from 'lucide-react';
import { Language, UserSettings } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'English', label: 'English', native: 'English' },
  { code: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { code: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { code: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  settings,
  onUpdateSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden -ml-1 p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  EduGenie
                </span>
                <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Google Gemini Powered Learning Assistant
              </p>
            </div>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Study streak badge */}
          <div
            title="Your Daily Study Streak! Keep learning every day."
            className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200/80 shadow-2xs"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{settings.studyStreak} Day Streak</span>
          </div>

          {/* Student Level Tag */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-indigo-50/80 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-100">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>{settings.studentLevel}</span>
          </div>

          {/* Language Selector */}
          <div className="relative group">
            <label htmlFor="language-select" className="sr-only">
              Select Language
            </label>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/20">
              <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                id="language-select"
                value={settings.language}
                onChange={(e) => onUpdateSettings({ language: e.target.value as Language })}
                className="bg-transparent pr-1 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label} ({lang.native})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
