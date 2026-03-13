import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface DifficultyChartProps {
  data: Record<string, number>;
}

const COLORS: Record<string, string> = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

export function DifficultyChart({ data }: DifficultyChartProps) {
  const { theme } = useTheme();
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);
  if (total === 0) return <p className="theme-text-muted text-sm">No questions yet</p>;

  const trackBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200';

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([level, count]) => (
        <div key={level}>
          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize theme-text-secondary">{level}</span>
            <span className="theme-text-muted">{count} ({Math.round((count / total) * 100)}%)</span>
          </div>
          <div className={`h-2 ${trackBg} rounded-full overflow-hidden`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(count / total) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${COLORS[level] || 'bg-gray-500'}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
