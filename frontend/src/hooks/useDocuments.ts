import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';

export function useDocuments(page = 1) {
  return useQuery({
    queryKey: ['documents', page],
    queryFn: () => documentService.getDocuments(page),
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentService.getDocument(id),
    enabled: !!id,
  });
}

export function useNOSUnits(docId: number) {
  return useQuery({
    queryKey: ['documents', docId, 'nos-units'],
    queryFn: () => documentService.getNOSUnits(docId),
    enabled: !!docId,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => documentService.upload(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => documentService.deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useAnalyzeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => documentService.analyze(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['documents', id] });
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
