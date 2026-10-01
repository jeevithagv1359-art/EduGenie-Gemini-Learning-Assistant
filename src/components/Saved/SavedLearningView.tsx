import React, { useState } from 'react';
import {
  BookmarkCheck,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  BookOpen,
  Filter,
  Sparkles,
} from 'lucide-react';
import { SavedItem } from '../../types';
import { getSavedItems, removeSavedItem } from '../../services/storage';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useToast } from '../Common/Toast';

interface SavedLearningViewProps {
  onNavigateToChat: (prompt: string) => void;
}

export const SavedLearningView: React.FC<SavedLearningViewProps> = ({ onNavigateToChat }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<SavedItem[]>(() => getSavedItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleDelete = (id: string) => {
    removeSavedItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast('Removed from saved library.', 'info');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('Copied to clipboard!', 'success');
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Saved Learning
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Review and reference high-yield explanations, key definitions, and bookmarked tutor responses.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-500">
          {items.length} Saved {items.length === 1 ? 'Resource' : 'Resources'}
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved formulas, concepts, or answers..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden shadow-2xs"
          />
        </div>

        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
          {['all', 'answer', 'summary'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterType === type ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 uppercase">
                    {item.type}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(item.content)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Copy content"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      onNavigateToChat(
                        `Hi EduGenie! I saved this response earlier. Can you give me more practice questions and deep-dive on it?\n\n${item.content.slice(0, 300)}`
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    title="Deep dive in AI Tutor"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content rendering */}
              <div className="text-xs sm:text-sm text-slate-800">
                <MarkdownRenderer content={item.content} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>{item.subject || 'Academic Session'}</span>
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Saved Items Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click the ⭐ Save button underneath any AI tutor response or summary to keep it in your permanent study archive.
          </p>
        </div>
      )}
    </div>
  );
};
