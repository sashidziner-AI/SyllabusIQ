import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '../services/questionService';
import type { MCQuestion } from '../types/question';

interface QuestionFilters {
  page?: number;
  per_page?: number;
  q?: string;
  document_id?: number;
  nos_unit_id?: number;
  difficulty?: string;
  is_duplicate?: boolean;
}

export function useQuestions(filters: QuestionFilters = {}) {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: () => questionService.getQuestions(filters),
  });
}

export function useQuestion(id: number) {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: () => questionService.getQuestion(id),
    enabled: !!id,
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MCQuestion> }) =>
      questionService.updateQuestion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions'] }),
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => questionService.deleteQuestion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions'] }),
  });
}

export function useQuestionStats() {
  return useQuery({
    queryKey: ['questions', 'stats'],
    queryFn: () => questionService.getStats(),
  });
}
