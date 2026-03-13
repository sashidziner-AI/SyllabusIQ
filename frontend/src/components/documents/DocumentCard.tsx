import { motion } from 'framer-motion';
import { FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '../../types/document';
import { useTheme } from '../../context/ThemeContext';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: number) => void;
}

const STATUS_COLORS_DARK: Record<string, string> = {
  uploaded: 'bg-gray-700 text-gray-300',
  processing: 'bg-yellow-500/10 text-yellow-400',
  analyzed: 'bg-green-500/10 text-green-400',
  failed: 'bg-red-500/10 text-red-400',
};

const STATUS_COLORS_LIGHT: Record<string, string> = {
  uploaded: 'bg-gray-200 text-gray-600',
  processing: 'bg-yellow-100 text-yellow-700',
  analyzed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const cardClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30 hover:shadow-green-500/5'
    : 'bg-white border-gray-200 hover:shadow-lg';

  const statusColors = theme === 'dark' ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      onClick={() => navigate(`/documents/${document.id}`)}
      className={`${cardClass} rounded-xl p-4 border cursor-pointer flex items-center gap-4 hover:shadow-lg transition-all`}
    >
      <div className="p-3 bg-green-500/10 rounded-lg">
        <FileText className="w-6 h-6 text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium theme-text-heading truncate">{document.original_filename}</p>
        <p className="text-sm theme-text-muted">
          {(document.file_size / 1024).toFixed(1)} KB &middot; {document.file_type.toUpperCase()}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[document.status]}`}>
        {document.status}
      </span>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); onDelete(document.id); }}
        className="p-2 theme-text-muted hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
