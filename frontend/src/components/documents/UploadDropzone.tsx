import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useUploadDocument } from '../../hooks/useDocuments';
import { useTheme } from '../../context/ThemeContext';

const MAX_SIZE_MB = 20;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

export function UploadDropzone({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const uploadMutation = useUploadDocument();

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File type ${ext} not supported. Use PDF, DOCX, or TXT.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File exceeds ${MAX_SIZE_MB}MB limit.`;
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    uploadMutation.mutate(file);
  }, [uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const borderClass = theme === 'dark'
    ? isDragging ? 'border-green-500 bg-green-500/5' : 'border-gray-700 hover:border-green-500/50'
    : isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500/50';

  return (
    <div>
      <motion.label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ scale: isDragging ? 1.02 : 1 }}
        className={`block cursor-pointer rounded-2xl border-2 border-dashed ${compact ? 'p-3' : 'p-8'} text-center transition-colors ${borderClass}`}
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleInputChange}
          className="hidden"
        />
        {uploadMutation.isPending ? (
          <div className={compact ? 'flex items-center gap-2' : 'flex flex-col items-center gap-2'}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className={`${compact ? 'w-5 h-5' : 'w-10 h-10'} border-3 border-green-500 border-t-transparent rounded-full`}
            />
            <p className={`text-green-500 font-medium ${compact ? 'text-sm' : ''}`}>Uploading...</p>
          </div>
        ) : compact ? (
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 theme-text-muted flex-shrink-0" />
            <p className="theme-text-secondary font-medium text-sm">Drop or click to upload</p>
            <p className="text-xs theme-text-muted">(PDF, DOCX, TXT)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-10 h-10 theme-text-muted" />
            <p className="theme-text-secondary font-medium">Drop your document here or click to browse</p>
            <p className="text-sm theme-text-muted">PDF, DOCX, TXT up to {MAX_SIZE_MB}MB</p>
          </div>
        )}
      </motion.label>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {uploadMutation.isSuccess && (
        <div className="mt-2 flex items-center gap-2 text-green-500 text-sm">
          <FileText className="w-4 h-4" />
          Document uploaded successfully!
        </div>
      )}
    </div>
  );
}
