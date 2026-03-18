import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, FileText, Loader2, AlertCircle, Download,
  Search, ChevronDown, X, Check, Sparkles, ChevronLeft, ChevronRight,
  Send, Bot, User, MessageSquare, Mic, MicOff, Image,
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { UploadDropzone } from '../components/documents/UploadDropzone';
import { chatService, type ChatDocument, type ChatResponse } from '../services/chatService';
import { questionGenService, type GeneratedMCQ } from '../services/questionGenService';
import { exportMCQsToExcel } from '../utils/exportExcel';
import { historyService } from '../services/historyService';
import { useTheme } from '../context/ThemeContext';

/* ─── Document Picker ─── */
function DocumentPicker({
  documents,
  selectedIds,
  onChange,
  disabled,
}: {
  documents: ChatDocument[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled: boolean;
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = documents.filter((d) =>
    d.filename.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id: number) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    );
  };

  const selectedDocs = documents.filter((d) => selectedIds.includes(d.id));

  const btnClass = theme === 'dark'
    ? 'border-gray-700 bg-[#111a11] hover:border-green-500/50'
    : 'border-gray-300 bg-white hover:border-green-500/50';

  const dropdownClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30'
    : 'bg-white border-gray-200 shadow-2xl';

  const inputClass = theme === 'dark'
    ? 'border-green-900/30 bg-[#0a0f0a] text-gray-300'
    : 'border-gray-300 bg-gray-50 text-gray-700';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors min-w-[280px] max-w-[400px] disabled:opacity-50 ${btnClass}`}
      >
        <FileText size={16} className="text-green-500 flex-shrink-0" />
        <span className="flex-1 text-left truncate theme-text-secondary">
          {selectedDocs.length === 0
            ? 'Select documents...'
            : selectedDocs.length === 1
              ? selectedDocs[0].filename
              : `${selectedDocs.length} documents selected`}
        </span>
        <ChevronDown
          size={16}
          className={`theme-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-1 w-[340px] border rounded-xl shadow-xl z-50 overflow-hidden ${dropdownClass}`}
          >
            <div className="p-2 border-b theme-border-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 theme-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents..."
                  autoFocus
                  className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none hover:border-green-500/30 transition-colors ${inputClass}`}
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="text-sm theme-text-muted text-center py-4">No documents found</p>
              ) : (
                filtered.map((doc) => {
                  const selected = selectedIds.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => toggle(doc.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                        selected
                          ? 'bg-green-500/10 text-green-500'
                          : 'theme-text-secondary theme-hover'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                          selected
                            ? 'bg-green-500 border-green-500'
                            : theme === 'dark' ? 'border-gray-700 hover:border-green-500/50' : 'border-gray-400 hover:border-green-500/50'
                        }`}
                      >
                        {selected && <Check size={10} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{doc.filename}</p>
                        <p className="text-xs theme-text-muted">
                          {doc.file_type.toUpperCase()}
                          {doc.uploaded_at && ` · ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t px-3 py-2 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs theme-text-muted">{selectedIds.length} selected</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChange(documents.map((d) => d.id))}
                  className="text-xs text-green-500 hover:text-green-400 font-medium"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs theme-text-muted hover:theme-text-secondary font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Chat Message Type ─── */
interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

/* ─── Answer Badge ─── */
function AnswerBadge({ label, isCorrect }: { label: string; isCorrect: boolean }) {
  const { theme } = useTheme();
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
        isCorrect
          ? 'bg-green-500/20 text-green-500 ring-2 ring-green-500/30'
          : theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-500'
      }`}
    >
      {label}
    </span>
  );
}

/* ─── Question Card View ─── */
function QuestionCard({ q, idx, hasNos }: { q: GeneratedMCQ; idx: number; hasNos: boolean }) {
  const { theme } = useTheme();
  const [showExplanation, setShowExplanation] = useState(false);
  const options = [
    { label: 'A', text: q.option_a },
    { label: 'B', text: q.option_b },
    { label: 'C', text: q.option_c },
    { label: 'D', text: q.option_d },
  ];

  const cardClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30'
    : 'bg-white border-gray-200';

  const optionBg = theme === 'dark' ? 'bg-[#0a0f0a]' : 'bg-gray-50';
  const optionBorder = theme === 'dark' ? 'border-green-900/20' : 'border-gray-200';
  const pageBg = theme === 'dark' ? 'bg-[#0a0f0a]' : 'bg-gray-100';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={`${cardClass} rounded-xl border p-5 hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold flex items-center justify-center">
            {idx + 1}
          </span>
          <div className="flex-1 min-w-0">
            {hasNos && q.nos_code && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                  {q.nos_code}
                </span>
                {q.nos_name && (
                  <span className="text-xs theme-text-muted truncate">{q.nos_name}</span>
                )}
              </div>
            )}
            <p className="text-xs theme-text-muted mb-2">
              <span className="font-medium theme-text-secondary">PC:</span> {q.performance_criteria}
            </p>
            <p className="text-sm font-medium theme-text-heading leading-relaxed">{q.question}</p>
          </div>
        </div>
        <span className={`flex-shrink-0 text-xs theme-text-muted ${pageBg} px-2 py-1 rounded`}>
          {q.page_reference}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 ml-11">
        {options.map((opt) => {
          const isCorrect = q.correct_answer.toUpperCase() === opt.label;
          return (
            <div
              key={opt.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                isCorrect
                  ? 'bg-green-500/10 border border-green-500/20 text-green-600'
                  : `${optionBg} border ${optionBorder} theme-text-secondary`
              }`}
            >
              <AnswerBadge label={opt.label} isCorrect={isCorrect} />
              <span className="flex-1">{opt.text}</span>
              {isCorrect && <Check size={14} className="text-green-500 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      <div className="ml-11 mt-3">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs font-medium text-green-500 hover:text-green-400 transition-colors"
        >
          {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
        </button>
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-xs theme-text-secondary mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 leading-relaxed">
                {q.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── Table View ─── */
function QuestionTable({ questions, hasNos }: { questions: GeneratedMCQ[]; hasNos: boolean }) {
  const { theme } = useTheme();
  const headBg = theme === 'dark' ? 'bg-[#0a0f0a]' : 'bg-gray-50';
  const divideClass = theme === 'dark' ? 'divide-green-900/20' : 'divide-gray-200';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className={`${headBg} theme-text-muted text-xs uppercase tracking-wider`}>
            <th className="px-4 py-3 font-semibold">#</th>
            {hasNos && <th className="px-4 py-3 font-semibold">NOS Code</th>}
            {hasNos && <th className="px-4 py-3 font-semibold">NOS Name</th>}
            <th className="px-4 py-3 font-semibold">Performance Criteria</th>
            <th className="px-4 py-3 font-semibold">Question</th>
            <th className="px-4 py-3 font-semibold">A</th>
            <th className="px-4 py-3 font-semibold">B</th>
            <th className="px-4 py-3 font-semibold">C</th>
            <th className="px-4 py-3 font-semibold">D</th>
            <th className="px-4 py-3 font-semibold">Answer</th>
            <th className="px-4 py-3 font-semibold">Explanation</th>
            <th className="px-4 py-3 font-semibold">Page</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${divideClass}`}>
          {questions.map((q, idx) => (
            <tr key={idx} className="theme-hover transition-colors">
              <td className="px-4 py-3 theme-text-muted font-medium">{idx + 1}</td>
              {hasNos && <td className="px-4 py-3 text-green-500 font-medium whitespace-nowrap">{q.nos_code || '-'}</td>}
              {hasNos && <td className="px-4 py-3 theme-text-secondary max-w-[150px] truncate">{q.nos_name || '-'}</td>}
              <td className="px-4 py-3 theme-text-muted max-w-[200px]">{q.performance_criteria}</td>
              <td className="px-4 py-3 theme-text-heading font-medium max-w-[250px]">{q.question}</td>
              <td className="px-4 py-3 theme-text-secondary max-w-[120px]">{q.option_a}</td>
              <td className="px-4 py-3 theme-text-secondary max-w-[120px]">{q.option_b}</td>
              <td className="px-4 py-3 theme-text-secondary max-w-[120px]">{q.option_c}</td>
              <td className="px-4 py-3 theme-text-secondary max-w-[120px]">{q.option_d}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500/20 text-green-500 font-bold text-xs">
                  {q.correct_answer}
                </span>
              </td>
              <td className="px-4 py-3 theme-text-muted max-w-[250px] text-xs leading-relaxed">{q.explanation}</td>
              <td className="px-4 py-3 theme-text-muted whitespace-nowrap text-xs">{q.page_reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab Type ─── */
type WorkspaceTab = 'chat' | 'generate';

/* ─── Main Page ─── */
export function QAWorkspacePage() {
  const { theme } = useTheme();

  /* Shared state */
  const [documents, setDocuments] = useState<ChatDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [isFetchingDocs, setIsFetchingDocs] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('generate');

  /* Chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);

  /* Screenshot/image attachment state */
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* Voice input state */
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setChatError('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setChatInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      setIsListening(false);
      inputRef.current?.focus();
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  /* Question Gen state */
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState<GeneratedMCQ[]>([]);
  const [hasNos, setHasNos] = useState(false);
  const [docNames, setDocNames] = useState<string[]>([]);
  const [isGenLoading, setIsGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  /* Fetch documents once */
  useEffect(() => {
    chatService
      .getDocuments()
      .then((docs) => {
        setDocuments(docs);
        if (docs.length > 0) setSelectedDocIds([docs[0].id]);
      })
      .catch(() => {
        setChatError('Failed to load documents');
        setGenError('Failed to load documents');
      })
      .finally(() => setIsFetchingDocs(false));
  }, []);

  /* Document search */
  const [docSearch, setDocSearch] = useState('');

  const filteredDocuments = documents.filter((d) =>
    d.filename.toLowerCase().includes(docSearch.toLowerCase()),
  );

  /* Auto-scroll chat */
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  /* Chat handlers */
  const handleSend = async () => {
    const trimmed = chatInput.trim();
    if ((!trimmed && !attachedImage) || selectedDocIds.length === 0 || isChatLoading) return;

    setChatError('');
    const userMsg: ChatMessage = { id: nextId.current++, role: 'user', content: trimmed || '(screenshot attached)', image: attachedImage || undefined };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setAttachedImage(null);
    setIsChatLoading(true);

    try {
      const res: ChatResponse = await chatService.askQuestion(selectedDocIds, trimmed);
      const botMsg: ChatMessage = { id: nextId.current++, role: 'assistant', content: res.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setChatError(axiosErr.response?.data?.detail || 'Failed to get answer. Please try again.');
    } finally {
      setIsChatLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Question Gen handlers */
  const handleGenerate = async () => {
    if (selectedDocIds.length === 0 || isGenLoading) return;
    setGenError('');
    setQuestions([]);
    setHasNos(false);
    setIsGenLoading(true);
    setCurrentPage(1);

    try {
      const res = await questionGenService.generate(selectedDocIds, numQuestions);
      setQuestions(res.questions);
      setHasNos(res.has_nos);
      setDocNames(res.document_names);
      historyService.save(res.document_names, res.questions, res.has_nos);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setGenError(axiosErr.response?.data?.detail || 'Failed to generate questions. Please try again.');
    } finally {
      setIsGenLoading(false);
    }
  };

  const handleExportExcel = () => {
    exportMCQsToExcel(questions, hasNos, docNames);
  };

  const handleDocChange = (ids: number[]) => {
    setSelectedDocIds(ids);
    setMessages([]);
    setChatError('');
    setQuestions([]);
    setGenError('');
  };

  const totalPages = Math.ceil(questions.length / perPage);
  const paginatedQuestions = questions.slice((currentPage - 1) * perPage, currentPage * perPage);

  const selectedNames = documents
    .filter((d) => selectedDocIds.includes(d.id))
    .map((d) => d.filename);

  /* Theme classes */
  const cardClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30'
    : 'bg-white border-gray-200';

  const inputClass = theme === 'dark'
    ? 'border-gray-700 bg-[#0a0f0a] text-gray-200'
    : 'border-gray-300 bg-white text-gray-700';

  const toggleBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200';
  const toggleActive = theme === 'dark'
    ? 'bg-[#111a11] text-gray-100 shadow-lg shadow-green-500/5'
    : 'bg-white text-gray-900 shadow-md';

  const paginationBorder = theme === 'dark' ? 'border-green-900/30' : 'border-gray-300';

  const botBubbleClass = theme === 'dark'
    ? 'bg-[#0a0f0a] text-gray-300 border-green-900/20 hover:border-green-900/40'
    : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300';

  const userAvatarClass = theme === 'dark'
    ? 'bg-gray-700 text-gray-300'
    : 'bg-gray-300 text-gray-600';

  const inputBgClass = theme === 'dark'
    ? 'border-gray-700 bg-[#0a0f0a] text-gray-200 placeholder-gray-500 disabled:bg-[#0a0f0a] disabled:text-gray-600'
    : 'border-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400';

  const loadingBubbleClass = theme === 'dark'
    ? 'bg-[#0a0f0a] border-green-900/20 text-gray-400'
    : 'bg-gray-100 border-gray-200 text-gray-500';

  const tabClass = (active: boolean) =>
    `px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
        : theme === 'dark'
          ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <PageWrapper>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold theme-text-heading">QA Workspace</h1>
          <p className="text-sm theme-text-muted">
            Upload documents, generate MCQs, and ask questions — all in one place
          </p>
        </div>

        {/* Split Screen */}
        <div className="flex gap-5" style={{ height: 'calc(100vh - 9rem)' }}>

          {/* ═══ Left Panel: Upload & Documents ═══ */}
          <div className={`w-80 flex-shrink-0 flex flex-col gap-4 ${cardClass} rounded-2xl border shadow-lg p-4 overflow-hidden`}>
            {/* Upload */}
            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1">Upload Document</label>
              <UploadDropzone />
            </div>

            {/* Select All / Clear + Search Bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium theme-text-secondary">
                  Documents ({documents.length})
                  {selectedDocIds.length > 0 && (
                    <span className="ml-1 text-green-500">· {selectedDocIds.length} selected</span>
                  )}
                </label>
                {documents.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDocChange(documents.map((d) => d.id))}
                      className="text-xs text-green-500 hover:text-green-400 font-medium"
                    >
                      Select all
                    </button>
                    <span className="text-xs theme-text-muted">|</span>
                    <button
                      onClick={() => handleDocChange([])}
                      className="text-xs theme-text-muted hover:theme-text-secondary font-medium"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 theme-text-muted" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Search documents..."
                  className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none hover:border-green-500/30 transition-colors ${inputClass}`}
                />
                {docSearch && (
                  <button
                    onClick={() => setDocSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text-secondary"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto -mx-1 px-1">
              {isFetchingDocs ? (
                <div className="flex items-center gap-2 theme-text-muted text-sm py-4 justify-center">
                  <Loader2 size={14} className="animate-spin" />
                  Loading...
                </div>
              ) : filteredDocuments.length === 0 ? (
                <p className="text-sm theme-text-muted py-4 text-center">
                  {documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your search'}
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredDocuments.map((doc) => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <button
                        key={doc.id}
                        onClick={() => {
                          handleDocChange(
                            isSelected
                              ? selectedDocIds.filter((id) => id !== doc.id)
                              : [...selectedDocIds, doc.id]
                          );
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                          isSelected
                            ? 'bg-green-500/10 text-green-500'
                            : 'theme-text-secondary theme-hover'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-green-500 border-green-500'
                              : theme === 'dark' ? 'border-gray-700' : 'border-gray-400'
                          }`}
                        >
                          {isSelected && <Check size={8} className="text-white" />}
                        </div>
                        <FileText size={14} className={isSelected ? 'text-green-500' : 'theme-text-muted'} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium">{doc.filename}</p>
                          <p className="text-[10px] theme-text-muted">
                            {doc.file_type.toUpperCase()}
                            {doc.uploaded_at && ` · ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ═══ Right Panel: Generate MCQs & QA Chat ═══ */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tab Switcher */}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveTab('generate')} className={tabClass(activeTab === 'generate')}>
                <span className="flex items-center gap-2">
                  <Sparkles size={16} />
                  Generate MCQs
                </span>
              </button>
              <button onClick={() => setActiveTab('chat')} className={tabClass(activeTab === 'chat')}>
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  QA Chat
                </span>
              </button>
            </div>

            {/* ─── Generate MCQs Tab ─── */}
            {activeTab === 'generate' && (
              <div className="flex-1 overflow-y-auto space-y-5">
                {/* Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${cardClass} rounded-2xl border shadow-lg p-5`}
                >
                  <div className="flex items-end justify-between flex-wrap gap-4">
                    <div>
                      <label className="block text-xs font-medium theme-text-secondary mb-1">Number of MCQs</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                        className={`w-24 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none hover:border-green-500/50 transition-colors ${inputClass}`}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerate}
                      disabled={isGenLoading || selectedDocIds.length === 0}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Generating MCQs...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Generate MCQs
                        </>
                      )}
                    </motion.button>
                  </div>

                  {isGenLoading && (
                    <div className="mt-4 p-4 bg-green-500/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Loader2 size={18} className="animate-spin text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-green-500">Analyzing document and generating questions...</p>
                          <p className="text-xs text-green-600 mt-0.5">This may take a minute depending on document size</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Error */}
                {genError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    <AlertCircle size={16} />
                    {genError}
                  </div>
                )}

                {/* Results */}
                {questions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold theme-text-heading">
                          Results ({questions.length} MCQs)
                        </h2>
                        {hasNos && (
                          <span className="text-xs font-medium bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full">
                            NOS Detected
                          </span>
                        )}
                        {!hasNos && (
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                            No NOS
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleExportExcel}
                          className="flex items-center gap-1.5 text-sm text-green-500 hover:text-green-400 font-medium bg-green-500/10 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                          <Download size={14} />
                          Export Excel
                        </motion.button>
                        <div className={`flex ${toggleBg} rounded-lg p-0.5`}>
                          <button
                            onClick={() => setViewMode('card')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              viewMode === 'card' ? toggleActive : 'theme-text-muted hover:theme-text-secondary'
                            }`}
                          >
                            Cards
                          </button>
                          <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              viewMode === 'table' ? toggleActive : 'theme-text-muted hover:theme-text-secondary'
                            }`}
                          >
                            Table
                          </button>
                        </div>
                      </div>
                    </div>

                    {viewMode === 'card' && (
                      <div className="space-y-4">
                        {paginatedQuestions.map((q, idx) => (
                          <QuestionCard key={idx} q={q} idx={(currentPage - 1) * perPage + idx} hasNos={hasNos} />
                        ))}
                      </div>
                    )}

                    {viewMode === 'table' && (
                      <div className={`${cardClass} rounded-2xl border shadow-lg overflow-hidden`}>
                        <QuestionTable questions={paginatedQuestions} hasNos={hasNos} />
                      </div>
                    )}

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg border ${paginationBorder} theme-text-muted theme-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              page === currentPage
                                ? 'bg-green-500 text-white'
                                : `border ${paginationBorder} theme-text-secondary theme-hover`
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg border ${paginationBorder} theme-text-muted theme-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Empty state */}
                {!isGenLoading && questions.length === 0 && !genError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 theme-text-muted"
                  >
                    <Lightbulb size={48} strokeWidth={1.5} className="mb-3" />
                    <p className="text-lg font-medium theme-text-secondary">Generate Assessment Questions</p>
                    <p className="text-sm mt-1 text-center max-w-md">
                      {documents.length === 0
                        ? 'Upload a document first to generate MCQs.'
                        : selectedDocIds.length === 0
                          ? 'Select a document to begin.'
                          : 'Set the number of MCQs and click "Generate MCQs" to create assessment questions from your documents.'}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ─── QA Chat Tab ─── */}
            {activeTab === 'chat' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex-1 flex flex-col ${cardClass} rounded-2xl border shadow-lg overflow-hidden`}
              >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 && !isChatLoading && (
                    <div className="flex flex-col items-center justify-center h-full theme-text-muted">
                      <MessageSquare size={48} strokeWidth={1.5} className="mb-3" />
                      <p className="text-lg font-medium theme-text-secondary">Start a conversation</p>
                      <p className="text-sm mt-1 text-center max-w-md">
                        {documents.length === 0
                          ? 'Upload a document first to start chatting.'
                          : selectedDocIds.length === 0
                            ? 'Select one or more documents to begin.'
                            : `Ask any question about ${selectedNames.length === 1 ? `"${selectedNames[0]}"` : `${selectedNames.length} selected documents`}`}
                      </p>
                    </div>
                  )}

                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap transition-all duration-200 ${
                            msg.role === 'user'
                              ? 'bg-green-600 text-white rounded-br-md hover:bg-green-700 hover:shadow-md'
                              : `${botBubbleClass} rounded-bl-md border hover:shadow-md`
                          }`}
                        >
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Attached screenshot"
                              className="max-w-full max-h-48 rounded-lg mb-2 border border-white/20"
                            />
                          )}
                          {msg.content}
                        </div>
                        {msg.role === 'user' && (
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${userAvatarClass} flex items-center justify-center`}>
                            <User size={16} />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isChatLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className={`${loadingBubbleClass} border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm`}>
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing {selectedDocIds.length > 1 ? `${selectedDocIds.length} documents` : 'document'} and generating answer...
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Error */}
                {chatError && (
                  <div className="mx-6 mb-2 flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle size={14} />
                    {chatError}
                  </div>
                )}

                {/* Chat Input */}
                <div className="border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
                  {/* Image Preview */}
                  <AnimatePresence>
                    {attachedImage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 overflow-hidden"
                      >
                        <div className="relative inline-block">
                          <img
                            src={attachedImage}
                            alt="Attached"
                            className={`max-h-28 rounded-lg border ${theme === 'dark' ? 'border-green-900/30' : 'border-gray-300'}`}
                          />
                          <button
                            onClick={() => setAttachedImage(null)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-end gap-3">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageAttach}
                    />
                    <textarea
                      ref={inputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        documents.length === 0
                          ? 'Upload a document first...'
                          : selectedDocIds.length === 0
                            ? 'Select documents to start chatting...'
                            : 'Ask a question about your documents...'
                      }
                      disabled={isChatLoading || selectedDocIds.length === 0}
                      rows={1}
                      className={`flex-1 resize-none border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none max-h-32 hover:border-green-500/30 transition-colors ${inputBgClass}`}
                      style={{ minHeight: '44px' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isChatLoading || selectedDocIds.length === 0}
                      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        attachedImage
                          ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                          : theme === 'dark'
                            ? 'bg-[#0a0f0a] border border-gray-700 text-gray-400 hover:text-green-400 hover:border-green-500/30'
                            : 'bg-gray-100 border border-gray-300 text-gray-500 hover:text-green-600 hover:border-green-500/30'
                      }`}
                      title="Attach screenshot"
                    >
                      <Image size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleVoiceInput}
                      disabled={isChatLoading || selectedDocIds.length === 0}
                      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                          : theme === 'dark'
                            ? 'bg-[#0a0f0a] border border-gray-700 text-gray-400 hover:text-green-400 hover:border-green-500/30'
                            : 'bg-gray-100 border border-gray-300 text-gray-500 hover:text-green-600 hover:border-green-500/30'
                      }`}
                      title={isListening ? 'Stop listening' : 'Voice input'}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={isChatLoading || (!chatInput.trim() && !attachedImage) || selectedDocIds.length === 0}
                      className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-green-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChatLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </motion.button>
                  </div>
                  <p className="text-xs theme-text-muted mt-2 text-center">
                    Answers are generated based only on the selected document{selectedDocIds.length > 1 ? 's' : ''} content.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
