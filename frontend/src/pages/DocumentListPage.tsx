import { PageWrapper } from '../components/layout/PageWrapper';
import { AnimatedList } from '../components/ui/AnimatedList';
import { DocumentCard } from '../components/documents/DocumentCard';
import { useDocuments, useDeleteDocument } from '../hooks/useDocuments';

export function DocumentListPage() {
  const { data, isLoading } = useDocuments(1);
  const deleteMutation = useDeleteDocument();

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold theme-text-heading">Documents</h1>

        {isLoading ? (
          <p className="theme-text-muted">Loading documents...</p>
        ) : data?.documents.length ? (
          <AnimatedList>
            {data.documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </AnimatedList>
        ) : (
          <div className="text-center py-12 theme-text-muted">
            <p>No documents yet. Upload your first syllabus above.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
