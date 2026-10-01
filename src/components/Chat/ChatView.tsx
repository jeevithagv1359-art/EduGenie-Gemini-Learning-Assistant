import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Volume2,
  VolumeX,
  Bookmark,
  Sparkles,
  Bot,
  User,
  X,
  RefreshCw,
  Lightbulb,
  GraduationCap,
  AlertCircle,
  HelpCircle,
  Share2,
  Check,
  Zap,
  Target,
  Calculator,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, UserSettings, StudentLevel, Language } from '../../types';
import { sendMessageToTutor } from '../../services/api';
import {
  getStoredChat,
  saveStoredChat,
  clearStoredChat,
  addSavedItem,
  addHistoryEntry,
} from '../../services/storage';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useToast } from '../Common/Toast';

interface ChatViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onNavigateToQuiz?: (topic: string) => void;
  onNavigateToSummarizer?: (text?: string) => void;
}

type AnswerMode = 'standard' | 'direct' | 'steps' | 'simple';

const WELCOME_EXAMPLES = [
  {
    title: 'Biology Concept',
    prompt: 'What is photosynthesis?',
    tag: 'Direct + Explanation',
  },
  {
    title: 'Physics Numerical',
    prompt: 'A 1200 kg car accelerates from 0 to 25 m/s in 5 seconds. Calculate the net force acting on the car.',
    tag: 'Given • Formula • Calculation',
  },
  {
    title: 'Multiple Choice Question',
    prompt: 'Which organelle is known as the powerhouse of the cell?\nA) Ribosome\nB) Mitochondria\nC) Golgi apparatus\nD) Nucleus',
    tag: 'Option Analysis',
  },
  {
    title: 'Tamil Academic Tutor',
    prompt: 'ஒளிச்சேர்க்கை (Photosynthesis) மற்றும் அதன் முக்கியத்துவத்தை தமிழில் விளக்குக.',
    tag: 'Clear Tamil',
  },
  {
    title: 'Direct Answer Only',
    prompt: 'Just give the answer: What is the derivative of f(x) = 3x^2 + 4x - 5 at x = 3?',
    tag: 'Direct Answer First',
  },
  {
    title: 'Concept Simplifier',
    prompt: 'Explain Newton’s Third Law in simple words with an everyday analogy.',
    tag: 'ELI5 Simplicity',
  },
];

const QUICK_ACTIONS = [
  {
    label: '🎯 Just Answer',
    promptPrefix: 'Just give the answer: ',
    tooltip: 'Direct final answer without unnecessary text',
  },
  {
    label: '📐 Step-by-Step',
    promptPrefix: 'Please explain and solve step-by-step: ',
    tooltip: 'Detailed derivation with Given, Formula, Calculation',
  },
  {
    label: '💡 In Simple Words',
    promptPrefix: 'Explain in simple words with an everyday analogy: ',
    tooltip: 'Beginner-friendly explanation with relatable examples',
  },
  {
    label: '🧮 Solve Numerical',
    promptPrefix: 'Solve this numerical problem with Given values, Formula, Step-by-Step Calculation, and Final Answer: ',
    tooltip: 'Full physics/chemistry/math numerical breakdown',
  },
  {
    label: '📝 MCQ Solver',
    promptPrefix: 'Identify the correct option, explain why it is correct, and explain why the other options are incorrect:\n',
    tooltip: 'Multiple-choice question solver',
  },
  {
    label: '🖼️ Image Question',
    promptPrefix: 'Please inspect the uploaded image carefully. Detect the exact question, solve it step-by-step, and state the final answer: ',
    tooltip: 'Inspect and solve question visible in uploaded image',
  },
];

export const ChatView: React.FC<ChatViewProps> = ({
  settings,
  onUpdateSettings,
  initialPrompt,
  onClearInitialPrompt,
  onNavigateToQuiz,
  onNavigateToSummarizer,
}) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredChat());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Answering Mode: 'standard' | 'direct' | 'steps' | 'simple'
  const [answerMode, setAnswerMode] = useState<AnswerMode>('standard');

  // Attached image state
  const [attachedImage, setAttachedImage] = useState<{
    data: string; // base64
    mimeType: string;
    name: string;
  } | null>(null);

  // Attached document state
  const [attachedDocName, setAttachedDocName] = useState<string | null>(null);
  const [attachedDocText, setAttachedDocText] = useState<string | null>(null);

  // Audio Speech Synthesis state
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Save chat on change
  useEffect(() => {
    saveStoredChat(messages);
  }, [messages]);

  // Handle initial prompt passed from Home or elsewhere
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Stop TTS if unmounted
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Image File Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('Image file size is too large (max 15MB).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        data: reader.result as string,
        mimeType: file.type,
        name: file.name,
      });
      showToast(`Attached image: ${file.name}. EduGenie will inspect the question.`, 'info');
    };
    reader.onerror = () => {
      showToast('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Document File Selection
  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setAttachedDocName(file.name);
      setAttachedDocText(text);
      showToast(`Loaded study document: ${file.name}`, 'info');
    };
    reader.onerror = () => {
      showToast('Failed to read document.', 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Send message
  const handleSend = async (customPrompt?: string) => {
    let promptToSend = (customPrompt !== undefined ? customPrompt : input).trim();
    if (!promptToSend && !attachedImage && !attachedDocText) return;

    // Apply answer mode modifier if applicable
    if (answerMode === 'direct' && !promptToSend.toLowerCase().includes('just give the answer')) {
      promptToSend = `Just give the answer directly: ${promptToSend}`;
    } else if (answerMode === 'steps' && !promptToSend.toLowerCase().includes('step-by-step')) {
      promptToSend = `Explain and solve step-by-step with formulas and calculations: ${promptToSend}`;
    } else if (answerMode === 'simple' && !promptToSend.toLowerCase().includes('simple words')) {
      promptToSend = `Explain in simple words for a beginner: ${promptToSend}`;
    }

    setErrorMsg(null);
    const userMsgId = 'msg-' + Date.now();

    // Prepare full text if document is attached
    let combinedContent = promptToSend;
    if (attachedDocText) {
      combinedContent = `${promptToSend ? promptToSend + '\n\n' : 'Please analyze and answer based on this study material:\n\n'}[Document Content: ${attachedDocName}]\n"""\n${attachedDocText.slice(0, 30000)}\n"""`;
    } else if (!promptToSend && attachedImage) {
      combinedContent = 'Carefully inspect this uploaded image. Detect the visible question, extract all given data, solve the exact question step by step, and state the final answer clearly.';
    }

    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: combinedContent,
      timestamp: Date.now(),
      image: attachedImage
        ? {
            data: attachedImage.data,
            mimeType: attachedImage.mimeType,
            name: attachedImage.name,
          }
        : undefined,
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setAttachedImage(null);
    setAttachedDocName(null);
    setAttachedDocText(null);
    setIsLoading(true);

    try {
      const replyText = await sendMessageToTutor({
        messages: updatedMessages,
        message: combinedContent,
        image: newUserMessage.image
          ? {
              data: newUserMessage.image.data,
              mimeType: newUserMessage.image.mimeType,
            }
          : undefined,
        language: settings.language,
        level: settings.studentLevel,
        style: settings.responseStyle,
      });

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Add to study history
      addHistoryEntry({
        title: promptToSend.slice(0, 60) || 'Academic Question',
        type: 'chat',
        snippet: replyText.slice(0, 100) + '...',
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Sorry, I could not process that right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Reaction Buttons
  const handleReaction = (messageId: string, type: 'liked' | 'disliked') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const currentReaction = m.reaction === type ? null : type;
          return { ...m, reaction: currentReaction };
        }
        return m;
      })
    );

    if (type === 'liked') {
      showToast('Thanks for your feedback!', 'success');
    } else {
      showToast('Thanks! Help us improve this answer.', 'info');
    }
  };

  // Copy Message
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('Copied!', 'success');
  };

  // Regenerate Response
  const handleRegenerate = async (messageIndex: number) => {
    let userPrompt = '';
    let userImage: { data: string; mimeType: string } | undefined;

    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userPrompt = messages[i].content;
        if (messages[i].image) {
          userImage = {
            data: messages[i].image!.data,
            mimeType: messages[i].image!.mimeType,
          };
        }
        break;
      }
    }

    if (!userPrompt && !userImage) {
      showToast('Cannot find original question to regenerate.', 'error');
      return;
    }

    showToast('Regenerating response with exact question checks...', 'info');
    setIsLoading(true);

    try {
      const replyText = await sendMessageToTutor({
        messages: messages.slice(0, messageIndex),
        message: userPrompt,
        image: userImage,
        language: settings.language,
        level: settings.studentLevel,
        style: settings.responseStyle,
      });

      setMessages((prev) =>
        prev.map((m, idx) => (idx === messageIndex ? { ...m, content: replyText } : m))
      );
      showToast('Regenerated answer!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to regenerate response.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Read Aloud (Speech Synthesis)
  const handleReadAloud = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis is not supported in this browser.', 'error');
      return;
    }

    if (currentlySpeakingId === messageId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      showToast('Stopped audio', 'info');
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown symbols for cleaner speech
    const cleanText = text
      .replace(/[*_#`~>\[\]\(\)]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const langMap: Record<Language, string> = {
      English: 'en-US',
      Tamil: 'ta-IN',
      Hindi: 'hi-IN',
      Telugu: 'te-IN',
      Kannada: 'kn-IN',
    };
    utterance.lang = langMap[settings.language] || 'en-US';

    utterance.onstart = () => {
      setCurrentlySpeakingId(messageId);
      showToast('Reading aloud...', 'info');
    };

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Save to Saved Learning
  const handleSaveResponse = (msg: ChatMessage) => {
    addSavedItem({
      title: msg.content.slice(0, 50).replace(/[#*]/g, '') + '...',
      content: msg.content,
      type: 'answer',
      subject: settings.language + ' Study Session',
      tags: ['AI Tutor', settings.studentLevel],
    });

    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, saved: true } : m))
    );

    showToast('Saved to your learning library! ⭐', 'success');
  };

  // Clear chat history
  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear this conversation?')) {
      clearStoredChat();
      setMessages([]);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      showToast('Conversation cleared.', 'info');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 sm:px-6 py-3 backdrop-blur-xs gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                EduGenie AI Tutor
              </h2>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500">
              Accurate Academic Problem Solver • {settings.studentLevel}
            </p>
          </div>
        </div>

        {/* Answering Mode Pills & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Answer Mode Selector */}
          <div className="flex rounded-xl bg-slate-200/70 p-0.5 border border-slate-200 text-xs">
            <button
              onClick={() => setAnswerMode('standard')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                answerMode === 'standard'
                  ? 'bg-white text-indigo-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Direct answer first, then clear step-by-step explanation"
            >
              Standard
            </button>
            <button
              onClick={() => setAnswerMode('direct')}
              className={`rounded-lg px-2 py-1 font-semibold transition-all cursor-pointer ${
                answerMode === 'direct'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Direct final answer first without extra fluff"
            >
              Direct
            </button>
            <button
              onClick={() => setAnswerMode('steps')}
              className={`rounded-lg px-2 py-1 font-semibold transition-all cursor-pointer ${
                answerMode === 'steps'
                  ? 'bg-white text-indigo-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Given, Formula, Calculation, Final Answer"
            >
              Steps
            </button>
            <button
              onClick={() => setAnswerMode('simple')}
              className={`rounded-lg px-2 py-1 font-semibold transition-all cursor-pointer ${
                answerMode === 'simple'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Explain in simple words with analogies"
            >
              Simple
            </button>
          </div>

          {/* Level Selector */}
          <select
            value={settings.studentLevel}
            onChange={(e) => onUpdateSettings({ studentLevel: e.target.value as StudentLevel })}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:border-indigo-300 focus:outline-hidden cursor-pointer"
            title="Adjust student explanation level"
          >
            <option value="Beginner">👶 Beginner</option>
            <option value="School Student">🎓 School</option>
            <option value="College Student">📚 College</option>
            <option value="Advanced">🧠 Advanced</option>
          </select>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-rose-600 transition-colors cursor-pointer"
              title="Clear current chat"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/40">
        {/* Welcome State when empty */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Hi! I'm EduGenie 👋
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
              Ask any academic, math, science, or image-based problem. I provide the <strong>direct answer first</strong>, followed by verified step-by-step derivations and clear explanations.
            </p>

            <div className="mt-6 w-full space-y-2 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center mb-1">
                Try asking an exact academic question:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WELCOME_EXAMPLES.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(example.prompt)}
                    className="text-left rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900 transition-all flex flex-col justify-between group shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{example.title}</span>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {example.tag}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">“{example.prompt}”</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Render Conversation Messages */}
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Message Bubble */}
                <div
                  className={`rounded-3xl p-4 sm:p-5 shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs'
                  }`}
                >
                  {/* Uploaded Image inside message if present */}
                  {msg.image && (
                    <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/10">
                      <img
                        src={msg.image.data}
                        alt={msg.image.name || 'Uploaded study diagram or question'}
                        className="max-h-72 w-auto max-w-full rounded-2xl object-contain bg-black/5"
                      />
                      {msg.image.name && (
                        <p className={`mt-1 text-[11px] px-2 py-0.5 font-medium ${isUser ? 'text-indigo-100' : 'text-slate-500'}`}>
                          📎 Question Image: {msg.image.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Text content */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>

                {/* Action Buttons Under EVERY AI Response */}
                {!isUser && (
                  <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-1.5 px-1 text-slate-500">
                    {/* Like button */}
                    <button
                      onClick={() => handleReaction(msg.id, 'liked')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        msg.reaction === 'liked'
                          ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                          : 'hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title="Like this response"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${msg.reaction === 'liked' ? 'fill-emerald-600' : ''}`} />
                      <span className="hidden sm:inline">Like</span>
                    </button>

                    {/* Dislike button */}
                    <button
                      onClick={() => handleReaction(msg.id, 'disliked')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        msg.reaction === 'disliked'
                          ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                          : 'hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title="Dislike this response"
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${msg.reaction === 'disliked' ? 'fill-rose-600' : ''}`} />
                      <span className="hidden sm:inline">Dislike</span>
                    </button>

                    {/* Copy button */}
                    <button
                      onClick={() => handleCopy(msg.content)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Copy response to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>

                    {/* Regenerate button */}
                    <button
                      onClick={() => handleRegenerate(index)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Regenerate this response"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>

                    {/* Read Aloud button */}
                    <button
                      onClick={() => handleReadAloud(msg.id, msg.content)}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        currentlySpeakingId === msg.id
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 animate-pulse'
                          : 'hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title="Read aloud using speech synthesis"
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>

                    {/* Save Response button */}
                    <button
                      onClick={() => handleSaveResponse(msg)}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        msg.saved
                          ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                          : 'hover:bg-slate-100 hover:text-amber-600'
                      }`}
                      title="Save to Saved Learning"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${msg.saved ? 'fill-amber-500' : ''}`} />
                      <span>{msg.saved ? 'Saved' : 'Save'}</span>
                    </button>

                    {/* Just Answer Pill */}
                    <button
                      onClick={() => handleSend(`Just give the final answer directly for this question:\n\n${msg.content.slice(0, 300)}`)}
                      className="hidden md:flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Request just the direct final answer"
                    >
                      <Target className="w-3 h-3 text-emerald-600" />
                      <span>Just Answer</span>
                    </button>

                    {/* Explain Simply button */}
                    <button
                      onClick={() => handleSend(`Explain this in simple words for a beginner with an everyday analogy:\n\n${msg.content.slice(0, 400)}`)}
                      className="hidden md:flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Explain this in simpler terms"
                    >
                      <Zap className="w-3 h-3 text-indigo-600" />
                      <span>In Simple Words</span>
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-center text-slate-500 text-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span className="font-medium text-slate-700">EduGenie is verifying & calculating...</span>
            </div>
          </div>
        )}

        {/* Error State with Retry */}
        {errorMsg && (
          <div className="flex items-center justify-between rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => handleSend()}
              className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 font-bold text-white hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer ml-3 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Area */}
      <div className="border-t border-slate-200/80 bg-white p-3 sm:p-4 space-y-2.5">
        {/* Attached image preview banner with quick prompts */}
        {attachedImage && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={attachedImage.data}
                  alt="Upload preview"
                  className="h-12 w-12 rounded-xl object-cover border border-indigo-200 bg-white"
                />
                <div>
                  <p className="text-xs font-bold text-indigo-950 truncate max-w-xs sm:max-w-md">
                    {attachedImage.name}
                  </p>
                  <p className="text-[11px] text-indigo-700">
                    EduGenie will inspect the question, extract text, and solve accurately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAttachedImage(null)}
                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-100 hover:text-rose-600 transition-colors"
                title="Remove attached image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick prompts for attached image */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-indigo-200/50">
              <button
                onClick={() => handleSend('Solve the exact question visible in this image step by step.')}
                className="rounded-lg bg-white border border-indigo-200 px-2 py-1 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                🔍 Solve Question in Image
              </button>
              <button
                onClick={() => handleSend('Extract the question from the image and just give the final answer directly.')}
                className="rounded-lg bg-white border border-indigo-200 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
              >
                🎯 Just Give Final Answer
              </button>
              <button
                onClick={() => handleSend('Explain this diagram and its labeled components clearly.')}
                className="rounded-lg bg-white border border-indigo-200 px-2 py-1 text-[11px] font-semibold text-slate-800 hover:bg-indigo-100 transition-colors"
              >
                📊 Explain Diagram
              </button>
            </div>
          </div>
        )}

        {/* Attached document preview banner */}
        {attachedDocName && (
          <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/80 p-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Attached Document: {attachedDocName}</span>
            </div>
            <button
              onClick={() => {
                setAttachedDocName(null);
                setAttachedDocText(null);
              }}
              className="p-1 text-amber-600 hover:text-rose-600"
              title="Remove document"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Action Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(action.promptPrefix);
                textareaRef.current?.focus();
              }}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-900 px-3 py-1 font-medium text-slate-600 transition-colors cursor-pointer"
              title={action.tooltip}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Main Textarea and Controls */}
        <div className="relative flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-2 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-2xs">
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
          />
          <input
            type="file"
            ref={docInputRef}
            onChange={handleDocSelect}
            accept=".txt,.md,.json,.csv"
            className="hidden"
          />

          {/* Upload Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 rounded-xl p-2 text-slate-500 hover:bg-slate-200/70 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Upload Image (JPG, PNG, WEBP)"
          >
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <span className="hidden sm:inline text-xs font-semibold text-slate-700">Image</span>
          </button>

          {/* Upload Document Button */}
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="flex items-center gap-1 rounded-xl p-2 text-slate-500 hover:bg-slate-200/70 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Upload Study Material (.txt, .md)"
          >
            <FileText className="w-5 h-5 text-amber-600" />
            <span className="hidden sm:inline text-xs font-semibold text-slate-700">Doc</span>
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              answerMode === 'direct'
                ? 'Type question (Direct answer mode active)...'
                : answerMode === 'steps'
                ? 'Type numerical or problem (Step-by-step mode active)...'
                : answerMode === 'simple'
                ? 'Type concept to simplify...'
                : 'Ask EduGenie anything you want to learn... (Enter to send, Shift+Enter for new line)'
            }
            className="flex-1 max-h-32 resize-none bg-transparent py-1.5 px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />

          {/* Clear input text if typed */}
          {input.length > 0 && (
            <button
              onClick={() => setInput('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && !attachedImage && !attachedDocText)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 active:scale-95 disabled:bg-slate-300 disabled:shadow-none transition-all cursor-pointer"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
