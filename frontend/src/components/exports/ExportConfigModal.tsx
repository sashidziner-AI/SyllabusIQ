import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GradientButton } from '../ui/GradientButton';
import { useTheme } from '../../context/ThemeContext';

interface ExportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: { difficulty_levels?: string[]; }) => void;
  isLoading: boolean;
}

export function ExportConfigModal({ isOpen, onClose, onExport, isLoading }: ExportConfigModalProps) {
  const { theme } = useTheme();
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

  const toggleDifficulty = (level: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(level) ? prev.filter((d) => d !== level) : [...prev, level],
    );
  };

  const handleExport = () => {
    onExport({
      difficulty_levels: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
    });
  };

  const modalClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30'
    : 'bg-white border-gray-200';

  const checkboxClass = theme === 'dark'
    ? 'bg-gray-800 border-gray-600'
    : 'bg-gray-100 border-gray-300';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${modalClass} rounded-2xl p-6 w-full max-w-md shadow-xl border`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg theme-text-heading">Export Configuration</h3>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}>
                <X className="w-5 h-5 theme-text-muted" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium theme-text-secondary block mb-2">Difficulty Levels</label>
                <div className="flex gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <label key={level} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDifficulties.includes(level)}
                        onChange={() => toggleDifficulty(level)}
                        className={`w-4 h-4 rounded text-green-500 ${checkboxClass}`}
                      />
                      <span className="text-sm theme-text-secondary capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <GradientButton onClick={handleExport} isLoading={isLoading} className="w-full">
                Export to Excel
              </GradientButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
