import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exportService } from '../services/exportService';

interface ExportFilters {
  document_ids?: number[];
  difficulty_levels?: string[];
  nos_unit_ids?: number[];
}

export function useExports() {
  return useQuery({
    queryKey: ['exports'],
    queryFn: () => exportService.getExports(),
  });
}

export function useCreateExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (filters: ExportFilters) => exportService.createExport(filters),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exports'] }),
  });
}

export function useDeleteExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => exportService.deleteExport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exports'] }),
  });
}
