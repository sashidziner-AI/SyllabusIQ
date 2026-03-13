import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GradientButton } from '../components/ui/GradientButton';
import { AnimatedList } from '../components/ui/AnimatedList';
import { ExportConfigModal } from '../components/exports/ExportConfigModal';
import { useExports, useCreateExport, useDeleteExport } from '../hooks/useExports';
import { exportService } from '../services/exportService';
import { useTheme } from '../context/ThemeContext';

export function ExportsPage() {
  const { theme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: exports, isLoading } = useExports();
  const createMutation = useCreateExport();
  const deleteMutation = useDeleteExport();

  const handleExport = (filters: { difficulty_levels?: string[] }) => {
    createMutation.mutate(filters, { onSuccess: () => setModalOpen(false) });
  };

  const cardClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30'
    : 'bg-white border-gray-200';

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold theme-text-heading">Exports</h1>
          <GradientButton onClick={() => setModalOpen(true)}>
            Create Export
          </GradientButton>
        </div>

        {isLoading ? (
          <p className="theme-text-muted">Loading exports...</p>
        ) : exports?.length ? (
          <AnimatedList>
            {exports.map((exp) => (
              <div key={exp.id} className={`${cardClass} rounded-xl p-4 border flex items-center gap-4`}>
                <div className="flex-1">
                  <p className="font-medium theme-text-heading">{exp.filename}</p>
                  <p className="text-sm theme-text-muted">
                    {exp.row_count} questions &middot; {exp.status}
                  </p>
                </div>
                {exp.status === 'completed' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => exportService.downloadExport(exp.id)}
                    className="p-2 text-green-500 hover:text-green-400 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteMutation.mutate(exp.id)}
                  className="p-2 theme-text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </AnimatedList>
        ) : (
          <p className="theme-text-muted text-center py-12">No exports yet. Create your first export above.</p>
        )}

        <ExportConfigModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onExport={handleExport}
          isLoading={createMutation.isPending}
        />
      </div>
    </PageWrapper>
  );
}
