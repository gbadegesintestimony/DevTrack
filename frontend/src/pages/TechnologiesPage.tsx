import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { Technology, TechStatus } from '../types';
import { Plus, Search, Cpu, Sparkles, Edit2, Trash2, X, Check, BookOpen, Target, Clock, FileText, Loader2, AlertCircle } from 'lucide-react';

const STATUS_CONFIG: Record<TechStatus, { label: string; color: string; bg: string; border: string }> = {
  NOT_STARTED: { label: 'Not Started', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
  MASTERED: { label: 'Mastered', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ON_HOLD: { label: 'On Hold', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
};

export const TechnologiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    status: 'IN_PROGRESS' as TechStatus,
    progress: 0,
    startDate: '',
    targetDate: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['technologies', searchTerm, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      const res = await api.get<Technology[]>(`/technologies?${params.toString()}`);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to fetch technologies');
      }
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newTech: typeof formData) => {
      const res = await api.post<Technology>('/technologies', newTech);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create technology');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      refetch();
      closeModal();
    },
    onError: (err: Error) => {
      setModalError(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<typeof formData> }) => {
      const res = await api.patch<Technology>(`/technologies/${id}`, updates);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to update technology');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      refetch();
      closeModal();
    },
    onError: (err: Error) => {
      setModalError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/technologies/${id}`);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to delete technology');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      refetch();
    },
  });

  const openCreateModal = () => {
    setEditingTech(null);
    setModalError(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      status: 'IN_PROGRESS',
      progress: 10,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tech: Technology) => {
    setEditingTech(tech);
    setModalError(null);
    setFormData({
      name: tech.name,
      category: tech.category || '',
      description: tech.description || '',
      status: tech.status,
      progress: tech.progress,
      startDate: tech.startDate ? tech.startDate.split('T')[0] : '',
      targetDate: tech.targetDate ? tech.targetDate.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTech(null);
    setModalError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (editingTech) {
      updateMutation.mutate({ id: editingTech.id, updates: formData });
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
            <Cpu className="h-8 w-8 text-brand-400" />
            <span>Technology Tracker</span>
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Track your tech stacks, masteries, frameworks, and milestones in one secure place
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Technology</span>
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
            placeholder="Search technologies or categories..."
            className="w-full rounded-xl border border-dark-700 bg-dark-800/80 py-2 pl-10 pr-4 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'MASTERED', 'ON_HOLD'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === status
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              {status === 'ALL' ? 'All' : STATUS_CONFIG[status as TechStatus]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((tech) => {
            const statusStyle = STATUS_CONFIG[tech.status] || STATUS_CONFIG.NOT_STARTED;
            return (
              <div
                key={tech.id}
                className="group relative rounded-2xl border border-dark-700 bg-dark-900/70 p-5 backdrop-blur-sm transition-all hover:border-dark-600 hover:shadow-xl hover:shadow-black/40"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base group-hover:text-brand-300 transition-colors">
                        {tech.name}
                      </h3>
                      {tech.category && (
                        <span className="rounded-md bg-dark-800 px-2 py-0.5 text-[10px] font-mono text-dark-300 border border-dark-700">
                          {tech.category}
                        </span>
                      )}
                    </div>
                    {tech.description && (
                      <p className="text-xs text-dark-400 mt-1 line-clamp-2">{tech.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(tech)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${tech.name}"?`)) {
                          deleteMutation.mutate(tech.id);
                        }
                      }}
                      title="Delete"
                      className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status & Progress Bar */}
                <div className="space-y-2 mt-4 pt-4 border-t border-dark-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                      {statusStyle.label}
                    </span>
                    <span className="font-mono font-bold text-white">{tech.progress}%</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-dark-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-500 rounded-full"
                      style={{ width: `${tech.progress}%` }}
                    />
                  </div>
                </div>

                {/* Associated counts pill */}
                {tech._count && (
                  <div className="mt-4 flex items-center justify-between text-[11px] text-dark-400 border-t border-dark-800/60 pt-3">
                    <span className="flex items-center gap-1" title="Goals">
                      <Target className="h-3 w-3 text-amber-400" /> {tech._count.goals}
                    </span>
                    <span className="flex items-center gap-1" title="Resources">
                      <BookOpen className="h-3 w-3 text-blue-400" /> {tech._count.resources}
                    </span>
                    <span className="flex items-center gap-1" title="Sessions">
                      <Clock className="h-3 w-3 text-purple-400" /> {tech._count.sessions}
                    </span>
                    <span className="flex items-center gap-1" title="Notes">
                      <FileText className="h-3 w-3 text-emerald-400" /> {tech._count.notes}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-dark-700 bg-dark-900/40 p-12 text-center">
          <Cpu className="h-12 w-12 text-dark-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No technologies found</h3>
          <p className="text-xs text-dark-400 max-w-sm mx-auto mt-1 mb-6">
            Get started by adding technologies or frameworks you are currently mastering.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Technology</span>
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div 
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-dark-700 bg-dark-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-400" />
                <span>{editingTech ? 'Edit Technology' : 'Add New Technology'}</span>
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. React, PostgreSQL, Docker"
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 px-3.5 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Frontend, Database"
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TechStatus })}
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="MASTERED">Mastered</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-dark-300 uppercase">Progress</label>
                  <span className="font-mono text-xs font-bold text-brand-400">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                  className="w-full accent-brand-500 bg-dark-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes about your learning focus, roadmap, or targets..."
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
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>{editingTech ? 'Update Technology' : 'Create Technology'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
