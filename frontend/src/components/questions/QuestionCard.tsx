import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { MCQuestion } from '../../types/question';

interface QuestionCardProps {
  question: MCQuestion;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export function QuestionCard({ question }: QuestionCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      onClick={() => navigate(`/questions/${question.id}`)}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer"
    >
      <p className="text-gray-900 line-clamp-2 mb-3">{question.question_text}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
          Answer: {question.correct_option}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${DIFFICULTY_COLORS[question.difficulty_level]}`}>
          {question.difficulty_level}
        </span>
        {question.is_duplicate && (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
            Duplicate
          </span>
        )}
        {question.source_page_reference && (
          <span className="text-xs text-gray-400">p.{question.source_page_reference}</span>
        )}
      </div>
    </motion.div>
  );
}
