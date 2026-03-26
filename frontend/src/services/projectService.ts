import api from './api';

export interface ProjectData {
  id: number;
  name: string;
  description: string | null;
  color: string;
  document_count: number;
  question_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface ProjectCreateData {
  name: string;
  description?: string;
  color?: string;
}

export interface ProjectUpdateData {
  name?: string;
  description?: string;
  color?: string;
}

export const projectService = {
  list: async (): Promise<ProjectData[]> => {
    const { data } = await api.get<ProjectData[]>('/projects');
    return data;
  },

  get: async (id: number): Promise<ProjectData> => {
    const { data } = await api.get<ProjectData>(`/projects/${id}`);
    return data;
  },

  create: async (project: ProjectCreateData): Promise<ProjectData> => {
    const { data } = await api.post<ProjectData>('/projects', project);
    return data;
  },

  update: async (id: number, project: ProjectUpdateData): Promise<ProjectData> => {
    const { data } = await api.put<ProjectData>(`/projects/${id}`, project);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
