import api from './api';
import type { GenerationJob, MCQuestion } from '../types/question';

export const generateService = {
  startGeneration: async (documentId: number, criteriaIds?: number[]): Promise<GenerationJob> => {
    const url = criteriaIds
      ? `/generate/${documentId}/criteria`
      : `/generate/${documentId}`;
    const body = criteriaIds ? { criteria_ids: criteriaIds } : undefined;
    const { data } = await api.post<GenerationJob>(url, body);
    return data;
  },

  getJobStatus: async (jobId: number): Promise<GenerationJob> => {
    const { data } = await api.get<GenerationJob>(`/generate/${jobId}/status`);
    return data;
  },

  getJobResults: async (jobId: number): Promise<MCQuestion[]> => {
    const { data } = await api.get<MCQuestion[]>(`/generate/${jobId}/results`);
    return data;
  },
};
