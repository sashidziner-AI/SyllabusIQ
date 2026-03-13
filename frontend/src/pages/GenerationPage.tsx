import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GradientButton } from '../components/ui/GradientButton';
import { CriteriaSelector } from '../components/generation/CriteriaSelector';
import { ProgressTracker } from '../components/generation/ProgressTracker';
import { useDocument, useNOSUnits } from '../hooks/useDocuments';
import { generateService } from '../services/generateService';
import type { GenerationJob } from '../types/question';
import { useTheme } from '../context/ThemeContext';

export function GenerationPage() {
  const { theme } = useTheme();
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const docId = Number(documentId);
  const { data: doc } = useDocument(docId);
  const { data: nosUnits } = useNOSUnits(docId);
  const [selectedCriteria, setSelectedCriteria] = useState<number[]>([]);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!job || job.status === 'completed' || job.status === 'failed') return;
    const interval = setInterval(async () => {
      const updated = await generateService.getJobStatus(job.id);
      setJob(updated);
      if (updated.status === 'completed' || updated.status === 'failed') {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [job]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const newJob = await generateService.startGeneration(
      docId,
      selectedCriteria.length > 0 ? selectedCriteria : undefined,
    );
    setJob(newJob);
  };

  const cardClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30'
    : 'bg-white border-gray-200';

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ x: -3 }} onClick={() => navigate(`/documents/${docId}`)} className="theme-text-muted hover:text-green-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold theme-text-heading">Generate MCQs</h1>
            <p className="text-sm theme-text-muted">{doc?.original_filename}</p>
          </div>
        </div>

        {!job && nosUnits && (
          <div className={`${cardClass} rounded-xl p-6 border space-y-4`}>
            <h3 className="font-semibold theme-text-heading">Select Criteria</h3>
            <CriteriaSelector
              nosUnits={nosUnits}
              selectedIds={selectedCriteria}
              onSelectionChange={setSelectedCriteria}
            />
            <GradientButton onClick={handleGenerate} isLoading={isGenerating}>
              <Sparkles className="w-4 h-4 inline mr-2" />
              Generate MCQs
            </GradientButton>
          </div>
        )}

        {job && <ProgressTracker job={job} />}

        {job?.status === 'completed' && (
          <div className="space-y-4">
            <GradientButton onClick={() => navigate('/questions')}>
              View Generated Questions
            </GradientButton>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
