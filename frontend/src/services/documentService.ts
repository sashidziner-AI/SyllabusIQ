import api from './api';
import type { Document, NOSUnit, PerformanceCriterion } from '../types/document';

interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  per_page: number;
}

export const documentService = {
  upload: async (file: File): Promise<Document> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<Document>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getDocuments: async (page = 1, perPage = 10): Promise<DocumentListResponse> => {
    const { data } = await api.get<DocumentListResponse>('/documents', {
      params: { page, per_page: perPage },
    });
    return data;
  },

  getDocument: async (id: number): Promise<Document> => {
    const { data } = await api.get<Document>(`/documents/${id}`);
    return data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  analyze: async (id: number): Promise<Document> => {
    const { data } = await api.post<Document>(`/documents/${id}/analyze`);
    return data;
  },

  getNOSUnits: async (docId: number): Promise<NOSUnit[]> => {
    const { data } = await api.get<NOSUnit[]>(`/documents/${docId}/nos-units`);
    return data;
  },

  getCriteria: async (docId: number): Promise<PerformanceCriterion[]> => {
    const { data } = await api.get<PerformanceCriterion[]>(`/documents/${docId}/criteria`);
    return data;
  },
};
