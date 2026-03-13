import api from './api';
import type { MCQuestion, QuestionTag } from '../types/question';

interface QuestionListResponse {
  questions: MCQuestion[];
  total: number;
  page: number;
  per_page: number;
}

interface QuestionStats {
  total: number;
  by_difficulty: Record<string, number>;
  by_document: Record<string, number>;
  duplicates_count: number;
}

interface QuestionFilters {
  page?: number;
  per_page?: number;
  q?: string;
  document_id?: number;
  nos_unit_id?: number;
  difficulty?: string;
  is_duplicate?: boolean;
}

export const questionService = {
  getQuestions: async (filters: QuestionFilters = {}): Promise<QuestionListResponse> => {
    const { data } = await api.get<QuestionListResponse>('/questions', { params: filters });
    return data;
  },

  getQuestion: async (id: number): Promise<MCQuestion> => {
    const { data } = await api.get<MCQuestion>(`/questions/${id}`);
    return data;
  },

  updateQuestion: async (id: number, update: Partial<MCQuestion>): Promise<MCQuestion> => {
    const { data } = await api.put<MCQuestion>(`/questions/${id}`, update);
    return data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  getDuplicates: async (): Promise<MCQuestion[]> => {
    const { data } = await api.get<MCQuestion[]>('/questions/duplicates');
    return data;
  },

  addTags: async (id: number, tags: string[]): Promise<MCQuestion> => {
    const { data } = await api.post<MCQuestion>(
      `/questions/${id}/tags`,
      tags.map((name) => ({ name })),
    );
    return data;
  },

  getStats: async (): Promise<QuestionStats> => {
    const { data } = await api.get<QuestionStats>('/questions/stats');
    return data;
  },
};
