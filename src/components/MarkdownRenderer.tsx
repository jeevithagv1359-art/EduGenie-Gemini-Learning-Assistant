import React, { useMemo } from 'react';
import { marked } from 'marked';
import { Sparkles, Layers, CheckCircle2, Calculator, HelpCircle, Image as ImageIcon } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Check if content has a visual learning section or mentions visual explanation
  const hasVisualMention = useMemo(() => {
    const lower = content.toLowerCase();
    return (
      lower.includes('visual learning') ||
      lower.includes('visual explanation') ||
      lower.includes('solar system') ||
      lower.includes('water cycle') ||
      lower.includes('cell structure') ||
      lower.includes('photosynthesis diagram')
    );
  }, [content]);

  // Check if content has structured academic markers
  const hasMcqMarker = content.includes('Correct Answer:');
  const hasNumericalMarker = content.includes('Given:') && content.includes('Formula:');
  const hasImageMarker = content.includes('Question detected:') || content.includes('🖼️');

  // Pre-process content to highlight academic sections cleanly before markdown parsing
  const processedContent = useMemo(() => {
    let text = content;

    // Enhance MCQ Correct Answer line
    text = text.replace(
      /\*\*(Correct Answer:\s*Option\s*[A-D0-9].*?)\*\*/gi,
      '> 🎯 **$1**'
    );

    // Enhance Image Question Detected
    text = text.replace(
      /\*\*(🖼️\s*Question detected:.*?)\*\*/gi,
      '> 🔍 **$1**'
    );

    return text;
  }, [content]);

  // Configure marked safely
  const htmlContent = useMemo(() => {
    try {
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return marked.parse(processedContent) as string;
    } catch (e) {
      return content.replace(/\n/g, '<br/>');
    }
  }, [processedContent]);

  return (
    <div className={`edugenie-markdown space-y-3 leading-relaxed text-slate-800 ${className}`}>
      {/* Visual Learning Card if visual topic is covered */}
      {hasVisualMention && (
        <div className="my-3 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/60 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs tracking-wider uppercase mb-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
              <Sparkles className="w-3 h-3" />
            </span>
            <span>Visual Concept Guide</span>
          </div>
          <div className="flex items-start gap-3 text-xs text-indigo-950/80">
            <div className="p-2 rounded-xl bg-indigo-100/70 text-indigo-700 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Mental Visual Model
              </p>
              <p className="text-slate-600 mt-0.5 leading-snug">
                Review key structural relationships, spatial positions, and step transitions highlighted in the explanation below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main HTML render */}
      <div
        className="prose prose-slate max-w-none text-[15px] leading-relaxed
        prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
        prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-1
        prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1.5 prose-h3:text-indigo-900
        prose-p:my-2 prose-p:leading-relaxed
        prose-strong:text-slate-950 prose-strong:font-bold
        prose-ul:my-2 prose-ul:pl-5 prose-ul:list-disc prose-li:my-1
        prose-ol:my-2 prose-ol:pl-5 prose-ol:list-decimal prose-li:my-1
        prose-code:text-indigo-700 prose-code:bg-indigo-50/90 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-code:font-mono prose-code:border prose-code:border-indigo-100
        prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-3.5 prose-pre:rounded-2xl prose-pre:shadow-sm
        prose-table:w-full prose-table:text-sm prose-table:border-collapse prose-table:my-3
        prose-th:bg-slate-100 prose-th:p-2.5 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-slate-200
        prose-td:p-2.5 prose-td:border prose-td:border-slate-200
        prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50/60 prose-blockquote:p-3 prose-blockquote:rounded-r-xl prose-blockquote:my-2 prose-blockquote:text-emerald-950"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
