import api from './api';
import type { ExportJob } from '../types/export';

interface ExportFilters {
  document_ids?: number[];
  difficulty_levels?: string[];
  nos_unit_ids?: number[];
}

export const exportService = {
  createExport: async (filters: ExportFilters): Promise<ExportJob> => {
    const { data } = await api.post<ExportJob>('/exports', filters);
    return data;
  },

  getExports: async (): Promise<ExportJob[]> => {
    const { data } = await api.get<ExportJob[]>('/exports');
    return data;
  },

  downloadExport: async (id: number): Promise<void> => {
    const response = await api.get(`/exports/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${id}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteExport: async (id: number): Promise<void> => {
    await api.delete(`/exports/${id}`);
  },
};
