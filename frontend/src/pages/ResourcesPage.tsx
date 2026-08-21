import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { LearningResource, ResourceType, ResourceStatus, Technology } from '../types';
import { BookOpen, Plus, Search, ExternalLink, Edit2, Trash2, X, Check, Loader2, Sparkles, Video, FileCode, Bookmark } from 'lucide-react';

const RESOURCE_TYPE_CONFIG: Record<ResourceType, { label: string; icon: React.FC<{ className?: string }> }> = {
  COURSE: { label: 'Course', icon: BookOpen },
  DOCUMENTATION: { label: 'Documentation', icon: FileCode },
  BOOK: { label: 'Book', icon: Bookmark },
  TUTORIAL: { label: 'Tutorial', icon: FileCode },
  VIDEO: { label: 'Video', icon: Video },
  ARTICLE: { label: 'Article', icon: FileCode },
  OTHER: { label: 'Other', icon: BookOpen },
};

const RESOURCE_STATUS_CONFIG: Record<ResourceStatus, { label: string; color: string; bg: string }> = {
  NOT_STARTED: { label: 'Not Started', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-brand-400', bg: 'bg-brand-500/10' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ARCHIVED: { label: 'Archived', color: 'text-dark-400', bg: 'bg-dark-800' },
};

export const ResourcesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    technologyId: '',
    type: 'ARTICLE' as ResourceType,
    status: 'IN_PROGRESS' as ResourceStatus,
    progress: 0,
    notes: '',
  });

  const { data: technologies } = useQuery({
    queryKey: ['technologies-options'],
    queryFn: async () => {
      const res = await api.get<Technology[]>('/technologies?limit=100');
      return res.data || [];
    },
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', searchTerm, selectedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType !== 'ALL') params.append('type', selectedType);
      const res = await api.get<LearningResource[]>(`/resources?${params.toString()}`);
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (newResource: typeof formData) =>
      api.post('/resources', {
        ...newResource,
        technologyId: newResource.technologyId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<typeof formData> }) =>
      api.patch(`/resources/${id}`, {
        ...updates,
        technologyId: updates.technologyId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const openCreateModal = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      technologyId: '',
      type: 'ARTICLE',
      status: 'IN_PROGRESS',
      progress: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (res: LearningResource) => {
    setEditingResource(res);
    setFormData({
      title: res.title,
      description: res.description || '',
      url: res.url,
      technologyId: res.technologyId || '',
      type: res.type,
      status: res.status,
      progress: res.progress,
      notes: res.notes || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-400" />
            <span>Learning Resources</span>
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Courses, documentation, books, tutorials, and video series
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-dark-700 bg-dark-900/60 p-4 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources by title, description or url..."
            className="w-full rounded-xl border border-dark-700 bg-dark-800/80 py-2 pl-10 pr-4 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'COURSE', 'DOCUMENTATION', 'BOOK', 'VIDEO', 'ARTICLE'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === type
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              {type === 'ALL' ? 'All' : RESOURCE_TYPE_CONFIG[type as ResourceType]?.label || type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : resources && resources.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((res) => {
            const typeConfig = RESOURCE_TYPE_CONFIG[res.type] || RESOURCE_TYPE_CONFIG.ARTICLE;
            const statusStyle = RESOURCE_STATUS_CONFIG[res.status] || RESOURCE_STATUS_CONFIG.NOT_STARTED;
            const Icon = typeConfig.icon;

            return (
              <div
                key={res.id}
                className="group relative rounded-2xl border border-dark-700 bg-dark-900/70 p-5 backdrop-blur-sm transition-all hover:border-dark-600 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-dark-400">
                          {typeConfig.label}
                        </span>
                        {res.technology && (
                          <span className="ml-2 rounded-md bg-dark-800 px-2 py-0.5 text-[10px] font-mono text-dark-300">
                            {res.technology.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(res)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete resource "${res.title}"?`)) {
                            deleteMutation.mutate(res.id);
                          }
                        }}
                        title="Delete"
                        className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base mt-2 group-hover:text-brand-300 transition-colors line-clamp-1">
                    {res.title}
                  </h3>

                  {res.description && (
                    <p className="text-xs text-dark-400 mt-1 line-clamp-2">{res.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-dark-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-dark-400">
                      <span>Progress</span>
                      <span className="font-mono text-white">{res.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-dark-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all rounded-full"
                        style={{ width: `${res.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-dark-700 bg-dark-900/40 p-12 text-center">
          <BookOpen className="h-12 w-12 text-dark-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No learning resources found</h3>
          <p className="text-xs text-dark-400 max-w-sm mx-auto mt-1 mb-6">
            Bookmark courses, books, documentation, and video series to organize your learning.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Resource</span>
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-dark-700 bg-dark-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span>{editingResource ? 'Edit Resource' : 'Add Resource'}</span>
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Total TypeScript Essentials"
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 px-3.5 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">URL (HTTP / HTTPS) *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/course"
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 px-3.5 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="COURSE">Course</option>
                    <option value="DOCUMENTATION">Documentation</option>
                    <option value="BOOK">Book</option>
                    <option value="TUTORIAL">Tutorial</option>
                    <option value="VIDEO">Video</option>
                    <option value="ARTICLE">Article</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Technology</label>
                  <select
                    value={formData.technologyId}
                    onChange={(e) => setFormData({ ...formData, technologyId: e.target.value })}
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">None</option>
                    {technologies?.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ResourceStatus })}
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-dark-300 uppercase">Progress</label>
                    <span className="font-mono text-xs font-bold text-blue-400">{formData.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    className="w-full accent-blue-500 bg-dark-800 mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key takeaways, chapters, or syllabus overview..."
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-dark-300 hover:text-white hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-500 shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>{editingResource ? 'Update Resource' : 'Save Resource'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
