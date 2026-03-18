import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Eye, Trash2, AlertCircle, X, Check, ChevronLeft, ChevronRight,
  Download, LayoutGrid, Table,
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { historyService, type HistoryEntry } from '../services/historyService';
import type { GeneratedMCQ } from '../services/questionGenService';
import { useTheme } from '../context/ThemeContext';

/* ─── CSV Download ─── */
function downloadCSV(entry: HistoryEntry) {
  const headers = [
    'S No',
    ...(entry.hasNos ? ['NOS Code', 'NOS Name', 'Performance Criteria'] : []),
    'Question',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Correct Answer',
    'Explanation',
    'Page Reference',
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
      q.question,
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d,
      q.correct_answer,
      q.explanation,
      q.page_reference || '',
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

/* ─── Question Card (reused from workspace) ─── */
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

/* ─── Question Table View ─── */
function QuestionTable({ questions, hasNos }: { questions: GeneratedMCQ[]; hasNos: boolean }) {
  const { theme } = useTheme();
  const headBg = theme === 'dark' ? 'bg-[#0a0f0a]' : 'bg-gray-50';
  const divideClass = theme === 'dark' ? 'divide-green-900/20' : 'divide-gray-200';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className={`${headBg} theme-text-muted text-xs uppercase tracking-wider`}>
            <th className="px-4 py-3 font-semibold w-12">S No</th>
            {hasNos && <th className="px-4 py-3 font-semibold w-24">NOS Code</th>}
            <th className="px-4 py-3 font-semibold">Question</th>
            <th className="px-4 py-3 font-semibold">Option A</th>
            <th className="px-4 py-3 font-semibold">Option B</th>
            <th className="px-4 py-3 font-semibold">Option C</th>
            <th className="px-4 py-3 font-semibold">Option D</th>
            <th className="px-4 py-3 font-semibold w-20 text-center">Answer</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${divideClass}`}>
          {questions.map((q, idx) => (
            <tr key={idx} className="theme-hover transition-colors">
              <td className="px-4 py-3 theme-text-muted font-medium">{idx + 1}</td>
              {hasNos && (
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                    {q.nos_code}
                  </span>
                </td>
              )}
              <td className="px-4 py-3 theme-text-heading font-medium max-w-xs">
                <p className="line-clamp-2">{q.question}</p>
              </td>
              <td className="px-4 py-3 theme-text-secondary text-xs max-w-[140px]">
                <p className="line-clamp-2">{q.option_a}</p>
              </td>
              <td className="px-4 py-3 theme-text-secondary text-xs max-w-[140px]">
                <p className="line-clamp-2">{q.option_b}</p>
              </td>
              <td className="px-4 py-3 theme-text-secondary text-xs max-w-[140px]">
                <p className="line-clamp-2">{q.option_c}</p>
              </td>
              <td className="px-4 py-3 theme-text-secondary text-xs max-w-[140px]">
                <p className="line-clamp-2">{q.option_d}</p>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500/20 text-green-500 text-xs font-bold ring-2 ring-green-500/30">
                  {q.correct_answer.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── View Modal ─── */
function ViewModal({ entry, onClose }: { entry: HistoryEntry; onClose: () => void }) {
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl ${
          theme === 'dark' ? 'bg-[#0d1410] border-green-900/30' : 'bg-gray-50 border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-lg font-bold theme-text-heading">{entry.documentName}</h2>
            <p className="text-xs theme-text-muted mt-0.5">
              {entry.questionCount} MCQs · Generated {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              theme === 'dark' ? 'border-green-900/30 bg-[#0a0f0a]' : 'border-gray-200 bg-gray-100'
            }`}>
              <button
                onClick={() => setViewMode('card')}
                className={toggleBtnClass(viewMode === 'card')}
                title="Card View"
              >
                <LayoutGrid size={14} />
                Card
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={toggleBtnClass(viewMode === 'table')}
                title="Table View"
              >
                <Table size={14} />
                Table
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

        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-5">
          {viewMode === 'card' ? (
            <div className="space-y-4">
              {paginatedQuestions.map((q, idx) => (
                <QuestionCard
                  key={idx}
                  q={q}
                  idx={(currentPage - 1) * perPage + idx}
                  hasNos={entry.hasNos}
                />
              ))}
            </div>
          ) : (
            <QuestionTable
              questions={paginatedQuestions}
              hasNos={entry.hasNos}
            />
          )}
        </div>

        {/* Pagination */}
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

/* ─── Delete Confirmation Modal ─── */
function DeleteConfirmModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${
          theme === 'dark' ? 'bg-[#0d1410] border-green-900/30' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold theme-text-heading">Delete Question Set</h3>
        </div>
        <p className="text-sm theme-text-secondary mb-6">
          Are you sure you want to delete <span className="font-medium theme-text-heading">"{name}"</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              theme === 'dark' ? 'border-gray-700 theme-text-secondary hover:bg-white/5' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── History Page ─── */
export function HistoryPage() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [viewEntry, setViewEntry] = useState<HistoryEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<HistoryEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    setEntries(historyService.getAll());
  }, []);

  const totalPages = Math.ceil(entries.length / perPage);
  const paginatedEntries = entries.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleDelete = (entry: HistoryEntry) => {
    historyService.delete(entry.id);
    const updated = historyService.getAll();
    setEntries(updated);
    setDeleteEntry(null);
    // Go back a page if current page is now empty
    const newTotalPages = Math.ceil(updated.length / perPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const cardClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30'
    : 'bg-white border-gray-200';

  const headBg = theme === 'dark' ? 'bg-[#0a0f0a]' : 'bg-gray-50';
  const divideClass = theme === 'dark' ? 'divide-green-900/20' : 'divide-gray-200';

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold theme-text-heading">History</h1>
          <p className="text-sm theme-text-muted">
            View and manage all previously generated question papers
          </p>
        </div>

        {/* Table */}
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 theme-text-muted"
          >
            <History size={48} strokeWidth={1.5} className="mb-3" />
            <p className="text-lg font-medium theme-text-secondary">No History Yet</p>
            <p className="text-sm mt-1 text-center max-w-md">
              Generated question papers from the QA Workspace will appear here automatically.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cardClass} rounded-2xl border shadow-lg overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className={`${headBg} theme-text-muted text-xs uppercase tracking-wider`}>
                    <th className="px-5 py-3.5 font-semibold w-16">S No</th>
                    <th className="px-5 py-3.5 font-semibold">Document Name</th>
                    <th className="px-5 py-3.5 font-semibold w-36">No of Questions</th>
                    <th className="px-5 py-3.5 font-semibold w-48">Date & Time</th>
                    <th className="px-5 py-3.5 font-semibold w-52 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${divideClass}`}>
                  {paginatedEntries.map((entry, idx) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="theme-hover transition-colors"
                    >
                      <td className="px-5 py-4 theme-text-muted font-medium">{(currentPage - 1) * perPage + idx + 1}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium theme-text-heading">{entry.documentName}</p>
                          {entry.documentNames.length > 1 && (
                            <p className="text-xs theme-text-muted mt-0.5">
                              From: {entry.documentNames.join(', ')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-green-500 font-medium">
                          <span className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-xs font-bold">
                            {entry.questionCount}
                          </span>
                          MCQs
                        </span>
                      </td>
                      <td className="px-5 py-4 theme-text-secondary text-xs">
                        {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' · '}
                        {new Date(entry.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewEntry(entry)}
                            className="flex items-center gap-1.5 text-xs font-medium text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                          >
                            <Eye size={14} />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => downloadCSV(entry)}
                            className="flex items-center gap-1.5 text-xs font-medium text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            <Download size={14} />
                            Download
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteEntry(entry)}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-xs theme-text-muted">
                  Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, entries.length)} of {entries.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${theme === 'dark' ? 'border-green-900/30' : 'border-gray-300'} theme-text-muted theme-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
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
                          : `border ${theme === 'dark' ? 'border-green-900/30' : 'border-gray-300'} theme-text-secondary theme-hover`
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${theme === 'dark' ? 'border-green-900/30' : 'border-gray-300'} theme-text-muted theme-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewEntry && (
          <ViewModal entry={viewEntry} onClose={() => setViewEntry(null)} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteEntry && (
          <DeleteConfirmModal
            name={deleteEntry.documentName}
            onConfirm={() => handleDelete(deleteEntry)}
            onCancel={() => setDeleteEntry(null)}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
