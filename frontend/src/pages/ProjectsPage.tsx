import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Plus, Search, MoreVertical, X, Check, Pencil, Trash2, AlertTriangle, Loader2, FileText, HelpCircle } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useTheme } from '../context/ThemeContext';
import { projectService, type ProjectData, type ProjectCreateData, type ProjectUpdateData } from '../services/projectService';
import { historyService } from '../services/historyService';

const PROJECT_COLORS = [
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
];

interface ProjectFormData {
  name: string;
  description: string;
  color: string;
}

/* ─── Project Modal (Create / Edit) ─── */
function ProjectModal({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  initialData?: ProjectFormData;
  mode: 'create' | 'edit';
  isSubmitting: boolean;
}) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0].value);

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '');
      setDescription(initialData?.description ?? '');
      setColor(initialData?.color ?? PROJECT_COLORS[0].value);
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!name.trim() || isSubmitting) return;
    onSubmit({ name: name.trim(), description: description.trim(), color });
  };

  const overlayClass = 'bg-black/50 backdrop-blur-sm';
  const modalClass = theme === 'dark'
    ? 'bg-[#1a1a2e] border-white/10'
    : 'bg-white border-gray-200';
  const inputClass = theme === 'dark'
    ? 'bg-[#0f0f1a] border-white/10 text-white placeholder-gray-500 focus:border-green-500'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClass}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md mx-4 rounded-2xl border shadow-2xl ${modalClass}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
              <h2 className="text-lg font-semibold theme-text-heading">
                {mode === 'create' ? 'Create Project' : 'Edit Project'}
              </h2>
              <button
                onClick={onClose}
                className="theme-text-muted hover:theme-text-secondary p-1 rounded-lg theme-hover transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1.5">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., NOS Level 4 Syllabus"
                  autoFocus
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none transition-colors ${inputClass}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1.5">
                  Description <span className="text-xs theme-text-muted font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this project..."
                  rows={3}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none transition-colors resize-none ${inputClass}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Color</label>
                <div className="flex items-center gap-2.5">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      title={c.name}
                      className="relative w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      style={{
                        backgroundColor: c.value,
                        boxShadow: color === c.value ? `0 0 0 3px ${theme === 'dark' ? '#1a1a2e' : '#ffffff'}, 0 0 0 5px ${c.value}` : 'none',
                      }}
                    >
                      {color === c.value && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Check size={14} className="text-white drop-shadow" />
                        </motion.span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t theme-border">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-500 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {mode === 'create' ? 'Create' : 'Save Changes'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Delete Confirmation Modal ─── */
function DeleteConfirmModal({
  open,
  projectName,
  onClose,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const { theme } = useTheme();

  const overlayClass = 'bg-black/50 backdrop-blur-sm';
  const modalClass = theme === 'dark'
    ? 'bg-[#1a1a2e] border-white/10'
    : 'bg-white border-gray-200';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClass}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm mx-4 rounded-2xl border shadow-2xl ${modalClass}`}
          >
            <div className="px-6 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold theme-text-heading mb-2">Delete Project</h3>
              <p className="text-sm theme-text-muted">
                Are you sure you want to delete <span className="font-semibold theme-text-secondary">"{projectName}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 border-t theme-border">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-white/10'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Project Card Context Menu ─── */
function ProjectCardMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menuClass = theme === 'dark'
    ? 'bg-[#1a1a2e] border-white/10'
    : 'bg-white border-gray-200';

  const itemHover = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="theme-text-muted hover:theme-text-secondary p-1 rounded-lg theme-hover"
      >
        <MoreVertical size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-1 w-36 border rounded-xl shadow-xl z-20 overflow-hidden ${menuClass}`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm theme-text-secondary ${itemHover} transition-colors`}
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 ${itemHover} transition-colors`}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Projects Page ─── */
export function ProjectsPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectData | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await projectService.list();
      setProjects(data);
    } catch (err) {
      // silently handle — user sees empty state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setModalMode('create');
    setEditingProject(null);
    setShowModal(true);
  };

  const openEditModal = (project: ProjectData) => {
    setModalMode('edit');
    setEditingProject(project);
    setShowModal(true);
  };

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const created = await projectService.create({
          name: data.name,
          description: data.description || undefined,
          color: data.color,
        });
        setProjects((prev) => [created, ...prev]);
      } else if (editingProject) {
        const updated = await projectService.update(editingProject.id, {
          name: data.name,
          description: data.description || undefined,
          color: data.color,
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? updated : p))
        );
      }
      setShowModal(false);
      setEditingProject(null);
    } catch (err) {
      // error handled by axios interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await projectService.delete(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      // error handled by axios interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const cardClass = theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white';
  const inputClass = theme === 'dark'
    ? 'bg-[#0f0f1a] border-white/10 text-white placeholder-gray-500'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400';

  return (
    <PageWrapper
      title="Projects"
      subtitle="Organize your documents and questions into projects"
    >
      {/* Header Actions */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${inputClass}`}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Project
        </motion.button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-green-500" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardClass} rounded-2xl border theme-border p-12 text-center`}
        >
          <div className={`w-16 h-16 rounded-2xl ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'} flex items-center justify-center mx-auto mb-4`}>
            <FolderOpen size={28} className="text-green-500" />
          </div>
          <h3 className="text-lg font-semibold theme-text mb-2">
            {projects.length === 0 ? 'No projects yet' : 'No projects match your search'}
          </h3>
          <p className="theme-text-muted text-sm mb-6 max-w-sm mx-auto">
            {projects.length === 0
              ? 'Create your first project to organize documents and generated questions together.'
              : 'Try a different search term.'}
          </p>
          {projects.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Create Project
            </motion.button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate(`/projects/${project.id}`)}
              className={`${cardClass} rounded-2xl border theme-border p-5 cursor-pointer transition-colors hover:border-green-500/30`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: `${project.color}15`, color: project.color }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <ProjectCardMenu
                  onEdit={() => openEditModal(project)}
                  onDelete={() => setDeleteTarget(project)}
                />
              </div>
              <h3 className="font-semibold theme-text mb-1">{project.name}</h3>
              {project.description && (
                <p className="text-sm theme-text-muted mb-3 line-clamp-2">{project.description}</p>
              )}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-xs theme-text-muted">
                  <FileText size={13} style={{ color: project.color }} />
                  <span><span className="font-semibold theme-text-secondary">{(() => {
                    const historyDocs = new Set(historyService.getAll(project.id).flatMap(e => e.documentNames));
                    return Math.max(project.document_count || 0, historyDocs.size);
                  })()}</span> Documents</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs theme-text-muted">
                  <HelpCircle size={13} style={{ color: project.color }} />
                  <span><span className="font-semibold theme-text-secondary">{(project.question_count || 0) + historyService.getAll(project.id).reduce((sum, e) => sum + e.questionCount, 0)}</span> Questions</span>
                </div>
              </div>
              <p className="text-xs theme-text-muted">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <ProjectModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingProject(null); }}
        onSubmit={handleSubmit}
        mode={modalMode}
        isSubmitting={isSubmitting}
        initialData={
          editingProject
            ? { name: editingProject.name, description: editingProject.description ?? '', color: editingProject.color }
            : undefined
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        projectName={deleteTarget?.name ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </PageWrapper>
  );
}
