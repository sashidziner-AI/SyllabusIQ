import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GradientButton } from '../components/ui/GradientButton';
import { NOSUnitAccordion } from '../components/documents/NOSUnitAccordion';
import { AnimatedList } from '../components/ui/AnimatedList';
import { useDocument, useNOSUnits, useAnalyzeDocument } from '../hooks/useDocuments';

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const docId = Number(id);
  const { data: doc, isLoading } = useDocument(docId);
  const { data: nosUnits } = useNOSUnits(docId);
  const analyzeMutation = useAnalyzeDocument();

  if (isLoading) return <PageWrapper><p className="theme-text-muted">Loading...</p></PageWrapper>;
  if (!doc) return <PageWrapper><p className="text-red-400">Document not found</p></PageWrapper>;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ x: -3 }} onClick={() => navigate('/documents')} className="theme-text-muted hover:text-green-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold theme-text-heading">{doc.original_filename}</h1>
            <p className="text-sm theme-text-muted">{doc.file_type.toUpperCase()} &middot; {(doc.file_size / 1024).toFixed(1)} KB</p>
          </div>
        </div>

        {doc.status === 'uploaded' && (
          <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-6 text-center">
            <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="theme-text-secondary mb-4">Document uploaded. Analyze to extract NOS units and criteria.</p>
            <GradientButton
              onClick={() => analyzeMutation.mutate(docId)}
              isLoading={analyzeMutation.isPending}
            >
              Analyze Document
            </GradientButton>
          </div>
        )}

        {doc.status === 'processing' && (
          <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-6 text-center">
            <Loader2 className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-spin" />
            <p className="theme-text-secondary">Analyzing document...</p>
          </div>
        )}

        {doc.status === 'failed' && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">Analysis failed: {doc.error_message}</p>
            <GradientButton onClick={() => analyzeMutation.mutate(docId)} isLoading={analyzeMutation.isPending}>
              Retry Analysis
            </GradientButton>
          </div>
        )}

        {doc.status === 'analyzed' && nosUnits && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold theme-text-heading">NOS Units ({nosUnits.length})</h2>
              <GradientButton onClick={() => navigate(`/generate/${docId}`)}>
                Generate MCQs
              </GradientButton>
            </div>
            <AnimatedList>
              {nosUnits.map((unit) => (
                <NOSUnitAccordion key={unit.id} unit={unit} />
              ))}
            </AnimatedList>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
