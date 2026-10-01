import React, { useState, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  BookOpen,
  CheckCircle2,
  Copy,
  Layers,
  HelpCircle,
  Lightbulb,
  Zap,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { SummaryResult, UserSettings } from '../../types';
import { generateSummary } from '../../services/api';
import { addSavedItem, addHistoryEntry } from '../../services/storage';
import { useToast } from '../Common/Toast';

interface SummarizerViewProps {
  settings: UserSettings;
  onNavigateToQuiz?: (studyMaterial: string) => void;
}

const SAMPLE_TEXTS = [
  {
    title: 'Biology: Cell Respiration & Mitochondria',
    content: `Cellular respiration is a series of chemical reactions that break down glucose to produce ATP, which may be used as energy to power many reactions throughout the body. There are three main steps of cellular respiration: glycolysis, the citric acid cycle (Krebs cycle), and oxidative phosphorylation.
Glycolysis takes place in the cytosol, where glucose (a six-carbon sugar) is converted into two molecules of pyruvate, producing a net gain of 2 ATP and 2 NADH. In the presence of oxygen, pyruvate enters the mitochondria and undergoes pyruvate oxidation, creating Acetyl-CoA.
Acetyl-CoA enters the citric acid cycle within the mitochondrial matrix, producing ATP, NADH, and FADH2, while releasing carbon dioxide as a byproduct. Finally, in oxidative phosphorylation on the mitochondrial cristae, electrons from NADH and FADH2 move through an electron transport chain, pumping protons into the intermembrane space. This creates a proton gradient that drives ATP synthase, yielding approximately 30-32 ATP molecules per glucose.`,
  },
  {
    title: "Physics: Newton's Laws of Motion",
    content: `Newton's laws of motion are three basic laws of classical mechanics that describe the relationship between the motion of an object and the forces acting on it.
First Law (Law of Inertia): An object at rest remains at rest, and an object in motion continues in motion with constant velocity (constant speed in a straight line) unless acted upon by a net external force. Inertia is quantified by mass.
Second Law: The acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass. Mathematically, F_net = m * a, where F is in Newtons (kg·m/s²), m is in kilograms, and a is in m/s². The force and acceleration are vectors pointing in the same direction.
Third Law (Action and Reaction): For every action force, there is an equal and opposite reaction force. When object A exerts a force F_AB on object B, object B simultaneously exerts a force F_BA on object A such that F_AB = -F_BA. These forces act on different bodies, so they never cancel each other out.`,
  },
  {
    title: 'Computer Science: Object-Oriented Programming (OOP)',
    content: `Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects', which can contain data in the form of fields (attributes or properties) and code in the form of procedures (methods).
The four core pillars of OOP are:
1. Encapsulation: Bundling data and the methods that operate on that data into a single unit (class), while restricting direct access to internal object components to prevent unintended interference.
2. Abstraction: Hiding complex implementation details and showing only the essential features of the object to the outside world, typically through abstract classes and interfaces.
3. Inheritance: A mechanism where a new class (subclass/derived class) adopts properties and methods from an existing class (superclass/base class), promoting code reusability and hierarchical categorization.
4. Polymorphism: The ability for different classes to be treated as instances of the same class through a common interface. Subclasses can provide specific implementations of methods defined in their superclass (method overriding).`,
  },
];

export const SummarizerView: React.FC<SummarizerViewProps> = ({ settings, onNavigateToQuiz }) => {
  const { showToast } = useToast();
  const [inputText, setInputText] = useState('');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Detailed'>('Medium');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);

  // Flashcard flip states
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setInputText(reader.result as string);
      showToast(`Loaded "${file.name}"`, 'success');
    };
    reader.onerror = () => {
      showToast('Error reading file.', 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      showToast('Please paste text or load a study sample.', 'error');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setShowAnswer(false);
    setFlashcardIndex(0);

    try {
      const summaryData = await generateSummary({
        text: inputText,
        length,
        difficulty,
        language: settings.language,
      });

      setResult(summaryData);
      showToast('Summary and study pack generated!', 'success');

      // Add to study history
      addHistoryEntry({
        title: `Summary (${length}, ${difficulty})`,
        type: 'summary',
        snippet: summaryData.summary.slice(0, 100) + '...',
        data: summaryData,
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to generate summary.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSummary = () => {
    if (!result) return;
    addSavedItem({
      title: 'Study Summary: ' + (result.definitions?.[0]?.term || 'Key Concept'),
      content: result.summary,
      type: 'summary',
      subject: settings.language + ' Summarizer',
      tags: ['Summary', difficulty, length],
    });
    showToast('Summary saved to your learning library! ⭐', 'success');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Smart Summarizer
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Turn textbooks, notes, and study guides into high-yield summaries, key definitions, formulas & flashcards.
          </p>
        </div>

        {/* Quick File Upload Trigger */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900 transition-all shadow-2xs cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-600" />
            <span>Upload Study Material (.txt, .md)</span>
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        {/* Sample text chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Samples:
          </span>
          {SAMPLE_TEXTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(sample.content)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 transition-colors cursor-pointer"
            >
              {sample.title}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <div>
          <textarea
            rows={7}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your chapter notes, textbook paragraphs, lecture transcripts, or study guide here..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all focus:outline-hidden"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 px-1">
            <span>Character count: {inputText.length}</span>
            {inputText.length > 0 && (
              <button
                onClick={() => setInputText('')}
                className="text-slate-400 hover:text-rose-600"
              >
                Clear text
              </button>
            )}
          </div>
        </div>

        {/* Controls: Length & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Summary Length */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Summary Length
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(['Short', 'Medium', 'Detailed'] as const).map((len) => (
                <button
                  key={len}
                  onClick={() => setLength(len)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    length === len
                      ? 'bg-white text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Difficulty
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    difficulty === diff
                      ? 'bg-white text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputText.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 shadow-md shadow-amber-500/25 active:scale-98 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Study Material...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Smart Summary</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Executive Summary</h3>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                  {length} • {difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.summary);
                    showToast('Copied summary!', 'success');
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Copy summary"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSaveSummary}
                  className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
              {result.summary}
            </p>
          </div>

          {/* Key Points & Definitions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Points */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Core Takeaways</span>
              </div>
              <ul className="space-y-2.5">
                {result.keyPoints?.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Definitions */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Important Definitions</span>
              </div>
              <div className="space-y-2.5">
                {result.definitions?.map((def, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 block mb-0.5">{def.term}</span>
                    <span className="text-slate-600 leading-relaxed">{def.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulas and Exam Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Important Formulas & Laws */}
            {result.formulas && result.formulas.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm">
                  <Zap className="w-4 h-4 text-cyan-600" />
                  <span>Key Formulas & Principles</span>
                </div>
                <div className="space-y-2">
                  {result.formulas.map((formula, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-cyan-50/70 border border-cyan-100 p-3 font-mono text-xs text-cyan-950 font-semibold"
                    >
                      {formula}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exam-Focused Tips */}
            {result.examPoints && result.examPoints.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-rose-600" />
                  <span>Exam-Focused High Yield Tips</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {result.examPoints.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">★</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Interactive Flashcards */}
          {result.flashcards && result.flashcards.length > 0 && (
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-violet-50/60 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Interactive Recall Flashcards ({flashcardIndex + 1} of {result.flashcards.length})
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShowAnswer(false);
                      setFlashcardIndex((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={flashcardIndex === 0}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowAnswer(false);
                      setFlashcardIndex((prev) => Math.min(result.flashcards.length - 1, prev + 1));
                    }}
                    disabled={flashcardIndex === result.flashcards.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flashcard Item */}
              <div
                onClick={() => setShowAnswer(!showAnswer)}
                className="cursor-pointer rounded-2xl border border-white bg-white p-8 text-center shadow-md transition-all hover:shadow-lg min-h-48 flex flex-col justify-center items-center"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2">
                  {showAnswer ? 'Answer' : 'Question (Click card to flip)'}
                </span>
                <p className="text-base sm:text-lg font-semibold text-slate-900 max-w-lg">
                  {showAnswer
                    ? result.flashcards[flashcardIndex].answer
                    : result.flashcards[flashcardIndex].question}
                </p>
                <span className="text-xs text-slate-400 mt-4 underline decoration-indigo-200">
                  {showAnswer ? 'Click to view question' : 'Click to reveal answer'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
