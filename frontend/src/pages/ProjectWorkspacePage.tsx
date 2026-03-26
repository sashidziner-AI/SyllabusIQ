import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { QAWorkspacePage } from './QAWorkspacePage';
import { projectService, type ProjectData } from '../services/projectService';

export function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    const fetch = async () => {
      try {
        const data = await projectService.get(Number(projectId));
        setProject(data);
      } catch {
        setError('Project not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [projectId]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-green-500" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !project) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <p className="theme-text-muted mb-4">{error || 'Project not found'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
        </div>
      </PageWrapper>
    );
  }

  return <QAWorkspacePage projectId={project.id} projectName={project.name} />;
}
