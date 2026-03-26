import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Loader2, AlertCircle, Download, Upload, Type,
  Search, ChevronDown, X, Check, Sparkles, ChevronLeft, ChevronRight,
  Send, Bot, User, MessageSquare, Mic, MicOff, Image, Trash2,
  FolderInput, ArrowLeft, History, Eye, LayoutGrid, Table as TableIcon,
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { UploadDropzone } from '../components/documents/UploadDropzone';
import { chatService, type ChatDocument, type ChatResponse } from '../services/chatService';
import { questionGenService, type GeneratedMCQ } from '../services/questionGenService';
import { documentService } from '../services/documentService';
import type { Document as DocType } from '../types/document';
import { exportMCQsToExcel } from '../utils/exportExcel';
import { historyService, type HistoryEntry } from '../services/historyService';
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
        className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors w-full disabled:opacity-50 ${btnClass}`}
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
            className={`absolute left-0 right-0 top-full mt-1 border rounded-xl shadow-xl z-50 overflow-hidden ${dropdownClass}`}
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

/* ─── CSV Download ─── */
function downloadCSV(entry: HistoryEntry) {
  const headers = [
    'S No',
    ...(entry.hasNos ? ['NOS Code', 'NOS Name', 'Performance Criteria'] : []),
    'Question', 'Option A', 'Option B', 'Option C', 'Option D',
    'Correct Answer', 'Explanation', 'Page Reference',
  ];
  const escapeCSV = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  const rows = entry.questions.map((q, idx) => {
    const base = [
      String(idx + 1),
      ...(entry.hasNos ? [q.nos_code || '', q.nos_name || '', q.performance_criteria || ''] : []),
      q.question, q.option_a, q.option_b, q.option_c, q.option_d,
      q.correct_answer, q.explanation, q.page_reference || '',
    ];
    return base.map(escapeCSV).join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${entry.documentName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── History View Modal ─── */
function HistoryViewModal({ entry, onClose }: { entry: HistoryEntry; onClose: () => void }) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const perPage = 10;
  const totalPages = Math.ceil(entry.questions.length / perPage);
  const paginatedQuestions = entry.questions.slice((currentPage - 1) * perPage, currentPage * perPage);
  const paginationBorder = theme === 'dark' ? 'border-green-900/30' : 'border-gray-300';

  const toggleBtnClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
      active
        ? 'bg-green-500 text-white'
        : theme === 'dark'
          ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl ${
          theme === 'dark' ? 'bg-[#0d1410] border-green-900/30' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-lg font-bold theme-text-heading">{entry.documentName}</h2>
            <p className="text-xs theme-text-muted mt-0.5">
              {entry.questionCount} MCQs · Generated {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              theme === 'dark' ? 'border-green-900/30 bg-[#0a0f0a]' : 'border-gray-200 bg-gray-100'
            }`}>
              <button onClick={() => setViewMode('card')} className={toggleBtnClass(viewMode === 'card')} title="Card View">
                <LayoutGrid size={14} /> Card
              </button>
              <button onClick={() => setViewMode('table')} className={toggleBtnClass(viewMode === 'table')} title="Table View">
                <TableIcon size={14} /> Table
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center theme-text-muted hover:theme-text-secondary theme-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {viewMode === 'card' ? (
            <div className="space-y-4">
              {paginatedQuestions.map((q, idx) => (
                <QuestionCard key={idx} q={q} idx={(currentPage - 1) * perPage + idx} hasNos={entry.hasNos} />
              ))}
            </div>
          ) : (
            <QuestionTable questions={paginatedQuestions} hasNos={entry.hasNos} />
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
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
    </motion.div>
  );
}

/* ─── Tab Type ─── */
type WorkspaceTab = 'inputSource' | 'chat';
type InputSourceSubTab = 'uploadFiles' | 'plainText';

/* ─── Main Page ─── */
export function QAWorkspacePage({ projectId, projectName }: { projectId?: number; projectName?: string }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  /* Shared state */
  const [documents, setDocuments] = useState<ChatDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [isFetchingDocs, setIsFetchingDocs] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('inputSource');
  const [inputSourceSubTab, setInputSourceSubTab] = useState<InputSourceSubTab>('uploadFiles');
  const [plainText, setPlainText] = useState('');

  /* Documents tab state */
  const [fullDocs, setFullDocs] = useState<DocType[]>([]);
  const [isLoadingFullDocs, setIsLoadingFullDocs] = useState(true);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isDeletingDoc, setIsDeletingDoc] = useState<number | null>(null);
  const [showDropzone, setShowDropzone] = useState(false);

  /* History state */
  const [showHistory, setShowHistory] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [viewHistoryEntry, setViewHistoryEntry] = useState<HistoryEntry | null>(null);

  const refreshHistory = () => setHistoryEntries(historyService.getAll(projectId));

  useEffect(() => {
    refreshHistory();
  }, []);

  const fetchFullDocs = async (silent = false) => {
    if (!silent) setIsLoadingFullDocs(true);
    try {
      const res = await documentService.getDocuments(1, 100, projectId);
      setFullDocs(res.documents);
    } catch {
      // handled silently
    } finally {
      setIsLoadingFullDocs(false);
    }
  };

  useEffect(() => {
    fetchFullDocs();
  }, [projectId]);

  const handleUploadWithProgress = async (file: File) => {
    setIsUploadingDoc(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    try {
      await documentService.upload(file, (percent) => setUploadProgress(Math.min(percent, 90)), projectId);
      // Simulate processing: animate from 90% to 100% over 5 seconds
      setUploadProgress(90);
      const start = Date.now();
      const duration = 5000;
      await new Promise<void>((resolve) => {
        const tick = () => {
          const elapsed = Date.now() - start;
          if (elapsed >= duration) {
            setUploadProgress(100);
            resolve();
            return;
          }
          setUploadProgress(90 + Math.round((elapsed / duration) * 10));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    } finally {
      setIsUploadingDoc(false);
      setUploadProgress(0);
      setUploadFileName('');
      setShowDropzone(false);
      await fetchFullDocs(true);
      await fetchChatDocs();
    }
  };

  const handleDeleteDoc = async (id: number) => {
    setIsDeletingDoc(id);
    try {
      await documentService.deleteDocument(id);
      setFullDocs((prev) => prev.filter((d) => d.id !== id));
      setSelectedDocIds((prev) => prev.filter((did) => did !== id));
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // handled silently
    } finally {
      setIsDeletingDoc(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    uploaded: { label: 'READY', color: 'text-green-500', bg: 'bg-green-500/10' },
    processing: { label: 'PROCESSING', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    analyzed: { label: 'ANALYZED', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    failed: { label: 'FAILED', color: 'text-red-500', bg: 'bg-red-500/10' },
  };

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

  /* Fetch documents (scoped to project if applicable) */
  const fetchChatDocs = async () => {
    setIsFetchingDocs(true);
    try {
      const docs = await chatService.getDocuments(projectId);
      setDocuments(docs);
      if (docs.length > 0) setSelectedDocIds([docs[0].id]);
    } catch {
      setChatError('Failed to load documents');
      setGenError('Failed to load documents');
    } finally {
      setIsFetchingDocs(false);
    }
  };

  useEffect(() => {
    fetchChatDocs();
  }, [projectId]);

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

  /* Ready document IDs from the upload list (uploaded or analyzed status) */
  const readyDocIds = fullDocs
    .filter((d) => d.status === 'uploaded' || d.status === 'analyzed')
    .map((d) => d.id);

  /* Question Gen handlers */
  const handleGenerate = async () => {
    const docIds = readyDocIds.length > 0 ? readyDocIds : selectedDocIds;
    if (docIds.length === 0 || isGenLoading) return;
    setGenError('');
    setQuestions([]);
    setHasNos(false);
    setIsGenLoading(true);
    setCurrentPage(1);

    try {
      const res = await questionGenService.generate(docIds, numQuestions);
      setQuestions(res.questions);
      setHasNos(res.has_nos);
      setDocNames(res.document_names);
      historyService.save(res.document_names, res.questions, res.has_nos, projectId);
      refreshHistory();
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
        <div className="flex items-center gap-3">
          {projectName && (
            <button
              onClick={() => navigate('/projects')}
              className="p-1.5 rounded-lg theme-hover theme-text-muted hover:theme-text-secondary transition-colors"
              title="Back to Projects"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold theme-text-heading">
              {projectName ? `${projectName} — Workspace` : 'QA Workspace'}
            </h1>
            <p className="text-sm theme-text-muted">
              Upload documents, generate MCQs, and ask questions — all in one place
            </p>
          </div>
        </div>

        {/* Full Width Content */}
        <div className="flex flex-col" style={{ height: 'calc(100vh - 9rem)' }}>
            {/* Tab Switcher */}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveTab('inputSource')} className={tabClass(activeTab === 'inputSource')}>
                <span className="flex items-center gap-2">
                  <FolderInput size={16} />
                  Input Source
                </span>
              </button>
              <button onClick={() => setActiveTab('chat')} className={tabClass(activeTab === 'chat')}>
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  QA Chat
                </span>
              </button>
            </div>

            {/* ─── Input Source Tab ─── */}
            {activeTab === 'inputSource' && (
              <div className="flex-1 flex flex-col overflow-y-auto space-y-5">
                {/* Subtab Switcher */}
                <div className={`flex ${toggleBg} rounded-lg p-0.5 w-fit mx-auto`}>
                  <button
                    onClick={() => setInputSourceSubTab('uploadFiles')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      inputSourceSubTab === 'uploadFiles' ? toggleActive : 'theme-text-muted hover:theme-text-secondary'
                    }`}
                  >
                    <Upload size={14} />
                    Upload Files
                  </button>
                  <button
                    onClick={() => setInputSourceSubTab('plainText')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      inputSourceSubTab === 'plainText' ? toggleActive : 'theme-text-muted hover:theme-text-secondary'
                    }`}
                  >
                    <Type size={14} />
                    Plain Text
                  </button>
                </div>

                {/* Upload Files Subtab */}
                {inputSourceSubTab === 'uploadFiles' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${cardClass} rounded-2xl border shadow-lg p-8 flex-1 flex flex-col`}
                  >
                    {(fullDocs.length === 0 || showDropzone) && (
                      <div className="flex flex-col items-center">
                        <label
                          onDragOver={(e) => { e.preventDefault(); }}
                          onDragLeave={(e) => { e.preventDefault(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) handleUploadWithProgress(file);
                          }}
                          className={`w-full cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
                            theme === 'dark'
                              ? 'border-green-900/40 hover:border-green-500/60 hover:bg-green-500/5'
                              : 'border-gray-300 hover:border-green-500/50 hover:bg-green-50'
                          }`}
                        >
                          <input
                            type="file"
                            accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,.md"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadWithProgress(file);
                              e.target.value = '';
                            }}
                          />
                          <div className="flex flex-col items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                              theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
                            }`}>
                              {isUploadingDoc ? (
                                <Loader2 size={32} className="text-green-500 animate-spin" />
                              ) : (
                                <Upload size={32} className="text-green-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-lg font-semibold theme-text-heading mb-1">
                                {isUploadingDoc ? 'Uploading...' : 'Drag & drop files here or click to browse'}
                              </p>
                              <p className="text-sm theme-text-muted">
                                Upload your documents to analyze and generate MCQs
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                              {['PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT', 'CSV', 'MD'].map((fmt) => (
                                <span
                                  key={fmt}
                                  className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                                    theme === 'dark'
                                      ? 'bg-white/5 text-gray-400 border border-white/10'
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}
                                >
                                  .{fmt.toLowerCase()}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs theme-text-muted mt-1">Maximum file size: 20MB</p>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Uploaded Documents List */}
                    {isLoadingFullDocs ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 size={20} className="animate-spin text-green-500" />
                        <span className="ml-2 text-sm theme-text-muted">Loading documents...</span>
                      </div>
                    ) : fullDocs.length > 0 && (
                      <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-medium theme-text-muted uppercase tracking-wider">
                            Uploaded Documents ({fullDocs.length})
                          </p>
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { refreshHistory(); setShowHistory(true); }}
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                            >
                              <History size={13} />
                              History
                              {historyEntries.length > 0 && (
                                <span className="ml-0.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                                  {historyEntries.length}
                                </span>
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setShowDropzone(!showDropzone)}
                              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                showDropzone
                                  ? 'bg-green-500 text-white'
                                  : 'text-green-500 bg-green-500/10 hover:bg-green-500/20'
                              }`}
                            >
                              <Upload size={13} />
                              {showDropzone ? 'Hide Upload' : 'Upload Document'}
                            </motion.button>
                          </div>
                        </div>
                        {fullDocs.map((doc) => {
                          const status = statusConfig[doc.status] || statusConfig.uploaded;
                          const isProcessing = doc.status === 'processing';
                          const isDeleting = isDeletingDoc === doc.id;
                          return (
                            <div
                              key={doc.id}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                                theme === 'dark'
                                  ? 'bg-[#0a0f0a] border-green-900/20 hover:border-green-900/40'
                                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                                theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
                              }`}>
                                <FileText size={18} className="text-green-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium theme-text-heading truncate">
                                    {doc.original_filename}
                                  </p>
                                  <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${status.bg} ${status.color}`}>
                                    {status.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs theme-text-muted">
                                    {formatFileSize(doc.file_size)}
                                  </span>
                                  <span className="text-xs theme-text-muted">·</span>
                                  <span className="text-xs theme-text-muted">
                                    {doc.file_type.toUpperCase()}
                                  </span>
                                  <span className="text-xs theme-text-muted">·</span>
                                  <span className="text-xs theme-text-muted">
                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                disabled={isDeleting}
                                className="flex-shrink-0 p-1.5 rounded-lg theme-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                title="Delete document"
                              >
                                {isDeleting ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Upload progress overlay — only while uploading */}
                    {isUploadingDoc && uploadFileName && (
                      <div className={`mt-4 px-4 py-3 rounded-xl border ${
                        theme === 'dark'
                          ? 'bg-[#0a0f0a] border-green-900/20'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Loader2 size={16} className="animate-spin text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium theme-text-heading truncate">{uploadFileName}</p>
                            <div className={`mt-1.5 w-full h-1.5 rounded-full overflow-hidden ${
                              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                            }`}>
                              <div
                                className="h-full rounded-full bg-green-500 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium flex-shrink-0 text-green-500">
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Generate MCQs — shown when documents are ready */}
                    {readyDocIds.length > 0 && (
                      <div className={`mt-6 pt-5 border-t ${theme === 'dark' ? 'border-green-900/20' : 'border-gray-200'}`}>
                        <div className="flex items-end justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <Sparkles size={18} className="text-green-500" />
                            <div>
                              <p className="text-sm font-semibold theme-text-heading">Generate MCQs</p>
                              <p className="text-xs theme-text-muted">{readyDocIds.length} document{readyDocIds.length > 1 ? 's' : ''} ready</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div>
                              <label className="block text-[10px] font-medium theme-text-muted uppercase tracking-wider mb-1">MCQs</label>
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                className={`w-20 border rounded-lg px-2.5 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none hover:border-green-500/50 transition-colors ${inputClass}`}
                              />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleGenerate}
                              disabled={isGenLoading || readyDocIds.length === 0}
                              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isGenLoading ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={16} />
                                  Generate MCQs
                                </>
                              )}
                            </motion.button>
                          </div>
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
                      </div>
                    )}

                  </motion.div>
                )}

                {/* Generate MCQs Error */}
                {genError && inputSourceSubTab === 'uploadFiles' && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    <AlertCircle size={16} />
                    {genError}
                  </div>
                )}

                {/* Generate MCQs Results */}
                {questions.length > 0 && inputSourceSubTab === 'uploadFiles' && (
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

                {/* Plain Text Subtab */}
                {inputSourceSubTab === 'plainText' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${cardClass} rounded-2xl border shadow-lg p-6 flex-1 flex flex-col`}
                  >
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Paste or type your content
                    </label>
                    <textarea
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      placeholder="Paste your syllabus content, notes, or any text here to generate MCQs..."
                      className={`w-full flex-1 min-h-[400px] border rounded-2xl px-5 py-4 text-sm leading-relaxed focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none transition-colors ${inputClass}`}
                    />
                    <p className="text-xs theme-text-muted mt-3 text-right">
                      {plainText.length > 0 ? `${plainText.length.toLocaleString()} characters` : 'No content yet'}
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
      {/* History List Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border shadow-2xl ${
                theme === 'dark' ? 'bg-[#0d1410] border-green-900/30' : 'bg-white border-gray-200'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${
                theme === 'dark' ? 'border-green-900/20' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'
                  }`}>
                    <History size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold theme-text-heading">Generation History</h2>
                    <p className="text-xs theme-text-muted">{historyEntries.length} generation{historyEntries.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center theme-text-muted hover:theme-text-secondary theme-hover transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5">
                {historyEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 theme-text-muted">
                    <History size={40} strokeWidth={1.5} className="mb-3 opacity-40" />
                    <p className="text-sm font-medium theme-text-secondary">No history yet</p>
                    <p className="text-xs mt-1">Generated MCQs will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historyEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                          theme === 'dark'
                            ? 'bg-[#0a0f0a] border-green-900/20 hover:border-amber-500/30'
                            : 'bg-gray-50 border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'
                        }`}>
                          <FileText size={18} className="text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium theme-text-heading truncate">{entry.documentName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-green-500 font-medium">{entry.questionCount} MCQs</span>
                            <span className="text-xs theme-text-muted">·</span>
                            <span className="text-xs theme-text-muted">
                              {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                              {' '}
                              {new Date(entry.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                            {entry.hasNos && (
                              <>
                                <span className="text-xs theme-text-muted">·</span>
                                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">NOS</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setShowHistory(false); setViewHistoryEntry(entry); }}
                            className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                            title="View MCQs"
                          >
                            <Eye size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => downloadCSV(entry)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                            title="Download CSV"
                          >
                            <Download size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              historyService.delete(entry.id);
                              refreshHistory();
                            }}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History View Modal */}
      <AnimatePresence>
        {viewHistoryEntry && (
          <HistoryViewModal entry={viewHistoryEntry} onClose={() => setViewHistoryEntry(null)} />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
