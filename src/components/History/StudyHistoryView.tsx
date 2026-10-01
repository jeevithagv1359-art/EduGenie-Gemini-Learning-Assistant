import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  FileText,
  Target,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { StudySessionHistory } from '../../types';
import {
  getStudyHistory,
  deleteHistoryEntry,
  clearStudyHistory,
} from '../../services/storage';
import { useToast } from '../Common/Toast';

interface StudyHistoryViewProps {
  onNavigateToChat: (prompt: string) => void;
  onNavigateToQuiz?: (topic: string) => void;
}

export const StudyHistoryView: React.FC<StudyHistoryViewProps> = ({
  onNavigateToChat,
  onNavigateToQuiz,
}) => {
  const { showToast } = useToast();
  const [history, setHistory] = useState<StudySessionHistory[]>(() => getStudyHistory());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    showToast('Deleted history entry.', 'info');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire study history?')) {
      clearStudyHistory();
      setHistory([]);
      showToast('Study history cleared.', 'info');
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-emerald-600" />;
      case 'summary':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'path':
        return <Target className="w-4 h-4 text-rose-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Study History
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Persistent archive of previous tutoring sessions, test scores, and learning milestones.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past questions, quizzes, or topics..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden shadow-2xs"
          />
        </div>

        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 overflow-x-auto">
          {['all', 'chat', 'quiz', 'summary', 'path'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterType === type ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {type === 'all' ? 'All Activities' : type}
            </button>
          ))}
        </div>
      </div>

      {/* History Items */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60">
                  {getIconForType(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      {item.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{item.snippet}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {new Date(item.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                {/* Resume / Open Button */}
                <button
                  onClick={() => {
                    if (item.type === 'quiz' && onNavigateToQuiz) {
                      onNavigateToQuiz(item.title);
                    } else {
                      onNavigateToChat(`Let's resume discussing this study topic: "${item.title}"`);
                    }
                  }}
                  className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors cursor-pointer"
                  title="Open this session in AI Tutor"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No History Records Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Your study sessions, questions, and quizzes will be automatically archived here.
          </p>
        </div>
      )}
    </div>
  );
};
