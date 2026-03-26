import api from './api';

export interface ChatDocument {
  id: number;
  filename: string;
  file_type: string;
  uploaded_at: string | null;
}

export interface ChatResponse {
  answer: string;
  document_ids: number[];
  document_names: string[];
}

export const chatService = {
  getDocuments: async (projectId?: number): Promise<ChatDocument[]> => {
    const params: Record<string, number> = {};
    if (projectId !== undefined) params.project_id = projectId;
    const { data } = await api.get('/chat/documents', { params });
    return data;
  },

  askQuestion: async (documentIds: number[], message: string): Promise<ChatResponse> => {
    const { data } = await api.post('/chat/ask', {
      document_ids: documentIds,
      message,
    });
    return data;
  },
};
