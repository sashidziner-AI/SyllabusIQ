export interface ExportJob {
  id: number;
  filename: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  row_count: number;
  created_at: string;
  completed_at: string | null;
}
