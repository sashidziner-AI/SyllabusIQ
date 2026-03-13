import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, FileText, Bot, User, Loader2, AlertCircle,
  MessageSquare, Search, Check, ChevronDown, X,
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { chatService, type ChatDocument, type ChatResponse } from '../services/chatService';
import { useTheme } from '../context/ThemeContext';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

/* ─── Multi-select Document Picker ─── */
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
    ? 'border-gray-700 bg-[#111a11] hover:border-green-500/50 text-gray-300'
    : 'border-gray-300 bg-white hover:border-green-500/50 text-gray-700';

  const dropdownClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30'
    : 'bg-white border-gray-200 shadow-2xl';

  const inputClass = theme === 'dark'
    ? 'border-gray-700 bg-[#0a0f0a] text-gray-300 placeholder-gray-500'
    : 'border-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400';

  const itemHover = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const checkboxBorder = theme === 'dark' ? 'border-gray-600' : 'border-gray-400';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors min-w-[280px] max-w-[400px] disabled:opacity-50 ${btnClass}`}
      >
        <FileText size={16} className="text-green-500 flex-shrink-0" />
        <span className="flex-1 text-left truncate">
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

      {selectedDocs.length > 1 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selectedDocs.map((doc) => (
            <span
              key={doc.id}
              className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {doc.filename.length > 20 ? doc.filename.slice(0, 20) + '...' : doc.filename}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggle(doc.id); }}
                className="hover:text-green-400"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-1 w-[340px] border rounded-xl shadow-xl z-50 overflow-hidden ${dropdownClass}`}
          >
            <div className="p-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
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
                          : `theme-text-secondary ${itemHover}`
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                          selected
                            ? 'bg-green-500 border-green-500'
                            : `${checkboxBorder} hover:border-green-500/50`
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
                  className="text-xs theme-text-muted font-medium"
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

/* ─── QA Chat Page ─── */
export function QAChatPage() {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<ChatDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDocs, setIsFetchingDocs] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);

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

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || selectedDocIds.length === 0 || isLoading) return;

    setError('');
    const userMsg: ChatMessage = {
      id: nextId.current++,
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res: ChatResponse = await chatService.askQuestion(selectedDocIds, trimmed);
      const botMsg: ChatMessage = {
        id: nextId.current++,
        role: 'assistant',
        content: res.answer,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const detail = axiosErr.response?.data?.detail || 'Failed to get answer. Please try again.';
      setError(detail);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedNames = documents
    .filter((d) => selectedDocIds.includes(d.id))
    .map((d) => d.filename);

  const chatCardClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30'
    : 'bg-white border-gray-200';

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

  return (
    <PageWrapper>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold theme-text-heading">QA Chat</h1>
            <p className="text-sm theme-text-muted">
              Ask questions about your uploaded syllabus documents
            </p>
          </div>
          <DocumentPicker
            documents={documents}
            selectedIds={selectedDocIds}
            onChange={(ids) => {
              setSelectedDocIds(ids);
              setMessages([]);
              setError('');
            }}
            disabled={isFetchingDocs || documents.length === 0}
          />
        </div>

        {/* Chat area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex-1 flex flex-col ${chatCardClass} rounded-2xl border shadow-lg overflow-hidden`}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isLoading && (
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

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-start"
              >
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

          {/* Error */}
          {error && (
            <div className="mx-6 mb-2 flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  documents.length === 0
                    ? 'Upload a document first...'
                    : selectedDocIds.length === 0
                      ? 'Select documents to start chatting...'
                      : 'Ask a question about your documents...'
                }
                disabled={isLoading || selectedDocIds.length === 0}
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
                onClick={handleSend}
                disabled={isLoading || !input.trim() || selectedDocIds.length === 0}
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-green-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
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
      </div>
    </PageWrapper>
  );
}
