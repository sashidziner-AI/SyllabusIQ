import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, FileText, Loader2, AlertCircle, Download,
  Search, ChevronDown, X, Check, Sparkles, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { UploadDropzone } from '../components/documents/UploadDropzone';
import { chatService, type ChatDocument } from '../services/chatService';
import { questionGenService, type GeneratedMCQ } from '../services/questionGenService';
import { exportMCQsToExcel } from '../utils/exportExcel';
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
            className={`absolute right-0 top-full mt-1 w-[340px] border rounded-xl shadow-xl z-50 overflow-hidden ${dropdownClass}`}
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
      {/* Header */}
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

      {/* Options */}
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

      {/* Explanation Toggle */}
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

/* ─── Main Page ─── */
export function QuestionGenPage() {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<ChatDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState<GeneratedMCQ[]>([]);
  const [hasNos, setHasNos] = useState(false);
  const [docNames, setDocNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDocs, setIsFetchingDocs] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    chatService
      .getDocuments()
      .then((docs) => {
        setDocuments(docs);
        if (docs.length > 0) setSelectedDocIds([docs[0].id]);
      })
      .catch(() => setError('Failed to load documents'))
      .finally(() => setIsFetchingDocs(false));
  }, []);

  const handleGenerate = async () => {
    if (selectedDocIds.length === 0 || isLoading) return;
    setError('');
    setQuestions([]);
    setHasNos(false);
    setIsLoading(true);
    setCurrentPage(1);

    try {
      const res = await questionGenService.generate(selectedDocIds, numQuestions);
      setQuestions(res.questions);
      setHasNos(res.has_nos);
      setDocNames(res.document_names);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const detail = axiosErr.response?.data?.detail || 'Failed to generate questions. Please try again.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    exportMCQsToExcel(questions, hasNos, docNames);
  };

  const totalPages = Math.ceil(questions.length / perPage);
  const paginatedQuestions = questions.slice((currentPage - 1) * perPage, currentPage * perPage);

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

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold theme-text-heading">Assessment Question Generator</h1>
          <p className="text-sm theme-text-muted">
            Generate MCQs with Performance Criteria and NOS mapping from your documents
          </p>
        </div>

        {/* Upload Dropzone */}
        <UploadDropzone />

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardClass} rounded-2xl border shadow-lg p-6 hover:shadow-xl transition-shadow duration-300`}
        >
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4 flex-wrap">
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
              <div>
                <label className="block text-xs font-medium theme-text-secondary mb-1">Select Documents</label>
                <DocumentPicker
                  documents={documents}
                  selectedIds={selectedDocIds}
                  onChange={(ids) => {
                    setSelectedDocIds(ids);
                    setQuestions([]);
                    setError('');
                  }}
                  disabled={isFetchingDocs || documents.length === 0}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isLoading || selectedDocIds.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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

          {isLoading && (
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
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Results */}
        {questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Results Header */}
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

            {/* Card View */}
            {viewMode === 'card' && (
              <div className="space-y-4">
                {paginatedQuestions.map((q, idx) => (
                  <QuestionCard
                    key={idx}
                    q={q}
                    idx={(currentPage - 1) * perPage + idx}
                    hasNos={hasNos}
                  />
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className={`${cardClass} rounded-2xl border shadow-lg overflow-hidden`}>
                <QuestionTable questions={paginatedQuestions} hasNos={hasNos} />
              </div>
            )}

            {/* Pagination */}
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
        {!isLoading && questions.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 theme-text-muted"
          >
            <Lightbulb size={48} strokeWidth={1.5} className="mb-3" />
            <p className="text-lg font-medium theme-text-secondary">Assessment Question Generator</p>
            <p className="text-sm mt-1 text-center max-w-md">
              {documents.length === 0
                ? 'Upload a document first to generate MCQs.'
                : selectedDocIds.length === 0
                  ? 'Select a document to begin.'
                  : 'Click "Generate MCQs" to create assessment questions with NOS mapping from your documents.'}
            </p>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}
