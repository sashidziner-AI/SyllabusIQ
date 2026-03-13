import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GradientButton } from '../components/ui/GradientButton';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { useQuestion, useUpdateQuestion } from '../hooks/useQuestions';

export function QuestionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const questionId = Number(id);
  const { data: question } = useQuestion(questionId);
  const updateMutation = useUpdateQuestion();

  const [form, setForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: '',
    explanation: '',
    difficulty_level: 'medium',
  });

  useEffect(() => {
    if (question) {
      setForm({
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_option: question.correct_option,
        explanation: question.explanation,
        difficulty_level: question.difficulty_level,
      });
    }
  }, [question]);

  const handleSave = () => {
    updateMutation.mutate(
      { id: questionId, data: form },
      { onSuccess: () => navigate('/questions') },
    );
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ x: -3 }} onClick={() => navigate('/questions')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <textarea
              value={form.question_text}
              onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(['A', 'B', 'C', 'D'] as const).map((letter) => {
              const key = `option_${letter.toLowerCase()}` as keyof typeof form;
              return (
                <AnimatedInput
                  key={letter}
                  label={`Option ${letter}`}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              );
            })}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <div className="flex gap-4">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <label key={opt} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="correct"
                    value={opt}
                    checked={form.correct_option === opt}
                    onChange={() => setForm({ ...form, correct_option: opt })}
                    className="text-purple-500"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
            <textarea
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={form.difficulty_level}
              onChange={(e) => setForm({ ...form, difficulty_level: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-500 outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <GradientButton onClick={handleSave} isLoading={updateMutation.isPending}>
              Save Changes
            </GradientButton>
            <GradientButton variant="secondary" onClick={() => navigate('/questions')}>
              Cancel
            </GradientButton>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
