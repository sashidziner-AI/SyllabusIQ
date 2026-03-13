import { motion } from 'framer-motion';

interface FilterPanelProps {
  difficulty: string;
  onDifficultyChange: (v: string) => void;
  showDuplicatesOnly: boolean;
  onDuplicatesChange: (v: boolean) => void;
}

export function FilterPanel({
  difficulty,
  onDifficultyChange,
  showDuplicatesOnly,
  onDuplicatesChange,
}: FilterPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl p-4 border border-gray-100 space-y-4"
    >
      <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={showDuplicatesOnly}
          onChange={(e) => onDuplicatesChange(e.target.checked)}
          className="w-4 h-4 rounded text-purple-500"
        />
        <span className="text-gray-600">Duplicates only</span>
      </label>
    </motion.div>
  );
}
