export interface MCQuestion {
  id: number;
  document_id: number;
  nos_unit_id: number | null;
  criterion_id: number | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  source_page_reference: string | null;
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_duplicate: boolean;
  created_at: string;
  updated_at: string;
  tags: QuestionTag[];
}

export interface QuestionTag {
  id: number;
  name: string;
}

export interface GenerationJob {
  id: number;
  document_id: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  total_criteria: number;
  processed_criteria: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}
