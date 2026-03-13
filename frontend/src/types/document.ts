export interface Document {
  id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_type: 'pdf' | 'docx' | 'txt';
  file_size: number;
  status: 'uploaded' | 'processing' | 'analyzed' | 'failed';
  error_message: string | null;
  uploaded_at: string;
  processed_at: string | null;
}

export interface NOSUnit {
  id: number;
  document_id: number;
  unit_code: string;
  unit_title: string;
  description: string | null;
  order_index: number;
  criteria: PerformanceCriterion[];
}

export interface PerformanceCriterion {
  id: number;
  nos_unit_id: number;
  criterion_code: string;
  criterion_text: string;
  page_reference: string | null;
  order_index: number;
}
