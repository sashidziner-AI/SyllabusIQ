import api from './api';

export interface GeneratedMCQ {
  nos_code: string | null;
  nos_name: string | null;
  performance_criteria: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  page_reference: string;
}

export interface QuestionGenResponse {
  has_nos: boolean;
  questions: GeneratedMCQ[];
  document_ids: number[];
  document_names: string[];
}

export const questionGenService = {
  generate: async (documentIds: number[], numberOfQuestions: number): Promise<QuestionGenResponse> => {
    const { data } = await api.post('/question-gen/generate', {
      document_ids: documentIds,
      number_of_questions: numberOfQuestions,
    });
    return data;
  },
};
