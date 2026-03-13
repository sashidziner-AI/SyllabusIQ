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
  getDocuments: async (): Promise<ChatDocument[]> => {
    const { data } = await api.get('/chat/documents');
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
