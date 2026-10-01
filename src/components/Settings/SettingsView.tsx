import React from 'react';
import {
  Settings,
  Globe,
  GraduationCap,
  Sliders,
  Type,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Language, StudentLevel, ResponseStyle, FontSize, UserSettings } from '../../types';
import { clearAllEduGenieData, clearStoredChat } from '../../services/storage';
import { useToast } from '../Common/Toast';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onClearChat: () => void;
}

const LANGUAGES: { code: Language; name: string; native: string }[] = [
  { code: 'English', name: 'English', native: 'English' },
  { code: 'Tamil', name: 'Tamil', native: 'தமிழ்' },
  { code: 'Hindi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'Telugu', name: 'Telugu', native: 'తెలుగు' },
  { code: 'Kannada', name: 'Kannada', native: 'ಕನ್ನಡ' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearChat,
}) => {
  const { showToast } = useToast();

  const handleClearHistory = () => {
    if (confirm('Clear current AI Tutor conversation history?')) {
      clearStoredChat();
      onClearChat();
      showToast('Chat history cleared.', 'info');
    }
  };

  const handleResetAllData = () => {
    if (
      confirm(
        'WARNING: This will permanently delete your study history, saved notes, custom roadmaps, and reset your streak. Are you sure?'
      )
    ) {
      clearAllEduGenieData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Settings & Preferences
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Personalize your AI tutor language, academic level, explanation depth, and interface sizing.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-8 divide-y divide-slate-100">
        {/* Language Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Preferred Language</h2>
          </div>
          <p className="text-xs text-slate-500">
            EduGenie provides native explanations in your preferred language without distorting scientific formulas.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
            {LANGUAGES.map((lang) => {
              const isSelected = settings.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    onUpdateSettings({ language: lang.code });
                    showToast(`Language set to ${lang.name}`, 'success');
                  }}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold">{lang.name}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{lang.native}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Academic Student Level */}
        <div className="pt-8 space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Student Level</h2>
          </div>
          <p className="text-xs text-slate-500">
            Calibrates vocabulary, analogy selection, mathematical rigor, and step breakdown depth.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[
              { id: 'Beginner', title: '👶 Beginner', desc: 'Simple words, everyday metaphors, no jargon.' },
              { id: 'School Student', title: '🎓 School Student', desc: 'Textbook clarity, step-by-step foundation.' },
              { id: 'College Student', title: '📚 College Student', desc: 'Rigorous theories, proofs & applications.' },
              { id: 'Advanced', title: '🧠 Advanced', desc: 'Deep technical reasoning & mathematical nuance.' },
            ].map((lvl) => {
              const isSelected = settings.studentLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    onUpdateSettings({ studentLevel: lvl.id as StudentLevel });
                    showToast(`Level set to ${lvl.id}`, 'success');
                  }}
                  className={`flex flex-col text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <span className="font-bold text-sm text-slate-900">{lvl.title}</span>
                  <p className="text-xs text-slate-500 mt-1">{lvl.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Response Style */}
        <div className="pt-8 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Response Style</h2>
          </div>
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 max-w-md">
            {(['Concise', 'Balanced', 'Detailed'] as const).map((style) => (
              <button
                key={style}
                onClick={() => {
                  onUpdateSettings({ responseStyle: style });
                  showToast(`Response style: ${style}`, 'success');
                }}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                  settings.responseStyle === style
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Text Sizing */}
        <div className="pt-8 space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Reading Text Size</h2>
          </div>
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 max-w-xs">
            {(['normal', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                onClick={() => onUpdateSettings({ fontSize: size })}
                className={`flex-1 rounded-xl py-2 text-xs font-bold capitalize transition-all cursor-pointer ${
                  settings.fontSize === size
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Data & History Controls */}
        <div className="pt-8 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Storage & Session Data</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-slate-500" />
              <span>Clear Current Chat History</span>
            </button>

            <button
              onClick={handleResetAllData}
              className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Reset All Study Data & Storage</span>
            </button>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="pt-8">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Google Gemini Architecture Specifications</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              EduGenie is equipped with Google's latest multimodal <strong>gemini-3.8-flash</strong> engine running through secure server-side Express proxies with streaming and structured JSON endpoints. Browser local storage maintains study streaks, quiz test evaluations, and custom curriculum pathways.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
              <span>SDK: @google/genai</span>
              <span>Model: gemini-3.8-flash</span>
              <span>API Key: Verified & Attached</span>
              <span>Runtime: Node 22 Full-Stack</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
