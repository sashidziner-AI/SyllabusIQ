import { motion } from 'framer-motion';
import type { GenerationJob } from '../../types/question';

interface ProgressTrackerProps {
  job: GenerationJob;
}

export function ProgressTracker({ job }: ProgressTrackerProps) {
  const progress = job.total_criteria > 0
    ? (job.processed_criteria / job.total_criteria) * 100
    : 0;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600 capitalize">{job.status}</span>
        <span className="text-gray-500">
          {job.processed_criteria} / {job.total_criteria} criteria
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
        />
      </div>
      {job.error_message && (
        <p className="text-red-500 text-sm mt-2">{job.error_message}</p>
      )}
    </div>
  );
}
