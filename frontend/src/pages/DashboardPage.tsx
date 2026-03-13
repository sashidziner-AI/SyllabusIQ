import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, HelpCircle,
  ArrowRight,
  Sparkles, History,
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useDocuments } from '../hooks/useDocuments';
import { useTheme } from '../context/ThemeContext';
import { historyService } from '../services/historyService';

/* ─── Animated Ring Chart ─── */
function RingChart({
  value,
  max,
  color,
  size = 80,
  strokeWidth = 7,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const { theme } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(value / max, 1) : 0;
  const trackColor = theme === 'dark' ? '#1a2e1a' : '#e5e7eb';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - percent) }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-bold theme-text-heading">{value}</span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data: docsData } = useDocuments(1);
  const historyEntries = historyService.getAll();
  const totalQuestions = historyEntries.reduce((sum, e) => sum + e.questionCount, 0);

  // Cap for ring charts (use reasonable max so the ring isn't always full)
  const docsTotal = docsData?.total ?? 0;
  const docsMax = Math.max(docsTotal, 10);
  const questionsMax = Math.max(totalQuestions, 50);
  const papersMax = Math.max(historyEntries.length, 10);

  const cardClass = theme === 'dark'
    ? 'bg-[#111a11] border-green-900/30 hover:shadow-green-500/5'
    : 'bg-white border-gray-200 hover:shadow-lg';

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-700 to-teal-700 p-8 text-white"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-green-200" />
              <span className="text-green-200 text-sm font-medium">AI-Powered Platform</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Syllabus-IQ</h1>
            <p className="text-green-100 max-w-lg">
              Analyze syllabus documents, generate intelligent questions, and chat with your content using AI.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/documents')}
              className="mt-5 inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:shadow-lg transition-shadow"
            >
              Get Started
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>

        {/* Platform Overview */}
        <div>
          <h2 className="text-lg font-semibold theme-text-heading mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Documents Uploaded */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className={`${cardClass} rounded-2xl p-6 border transition-shadow duration-300`}
            >
              <div className="flex items-center gap-5">
                <RingChart value={docsTotal} max={docsMax} color="#22c55e" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <FileText size={16} className="text-green-500" />
                    </div>
                    <p className="text-base font-semibold theme-text-heading">Documents Uploaded</p>
                  </div>
                  <p className="text-sm theme-text-muted mt-2 leading-relaxed">Total syllabus documents uploaded to the platform for analysis and question generation.</p>
                </div>
              </div>
            </motion.div>

            {/* Questions Generated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className={`${cardClass} rounded-2xl p-6 border transition-shadow duration-300`}
            >
              <div className="flex items-center gap-5">
                <RingChart value={totalQuestions} max={questionsMax} color="#10b981" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <HelpCircle size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-base font-semibold theme-text-heading">Questions Generated</p>
                  </div>
                  <p className="text-sm theme-text-muted mt-2 leading-relaxed">AI-generated MCQs aligned with NOS performance criteria from your documents.</p>
                </div>
              </div>
            </motion.div>

            {/* Question Papers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className={`${cardClass} rounded-2xl p-6 border transition-shadow duration-300`}
            >
              <div className="flex items-center gap-5">
                <RingChart value={historyEntries.length} max={papersMax} color="#14b8a6" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <History size={16} className="text-teal-500" />
                    </div>
                    <p className="text-base font-semibold theme-text-heading">Question Papers</p>
                  </div>
                  <p className="text-sm theme-text-muted mt-2 leading-relaxed">Complete question papers saved in history, available to view, download, or manage.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
