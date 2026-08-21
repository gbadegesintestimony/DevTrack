import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { Goal, GoalStatus, Technology } from '../types';
import { Target, Plus, Search, Calendar, Edit2, Trash2, X, Check, Loader2, Sparkles } from 'lucide-react';

const GOAL_STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; bg: string; border: string }> = {
  NOT_STARTED: { label: 'Not Started', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ARCHIVED: { label: 'Archived', color: 'text-dark-400', bg: 'bg-dark-800', border: 'border-dark-700' },
};

export const GoalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologyId: '',
    targetMetric: '',
    progress: 0,
    deadline: '',
    status: 'IN_PROGRESS' as GoalStatus,
  });

  const { data: technologies } = useQuery({
    queryKey: ['technologies-options'],
    queryFn: async () => {
      const res = await api.get<Technology[]>('/technologies?limit=100');
      return res.data || [];
    },
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', searchTerm, selectedStatus, selectedTech],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedTech) params.append('technologyId', selectedTech);
      const res = await api.get<Goal[]>(`/goals?${params.toString()}`);
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (newGoal: typeof formData) =>
      api.post('/goals', {
        ...newGoal,
        technologyId: newGoal.technologyId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<typeof formData> }) =>
      api.patch(`/goals/${id}`, {
        ...updates,
        technologyId: updates.technologyId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const toggleComplete = (goal: Goal) => {
    const nextStatus = goal.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    const nextProgress = nextStatus === 'COMPLETED' ? 100 : goal.progress;
    updateMutation.mutate({
      id: goal.id,
      updates: { status: nextStatus, progress: nextProgress },
    });
  };

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      technologyId: '',
      targetMetric: '',
      progress: 0,
      deadline: '',
      status: 'IN_PROGRESS',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      technologyId: goal.technologyId || '',
      targetMetric: goal.targetMetric || '',
      progress: goal.progress,
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      status: goal.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, updates: formData });
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
            <Target className="h-8 w-8 text-amber-400" />
            <span>Learning Goals</span>
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Set targets, assign technologies, and measure milestones
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Goal</span>
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
            placeholder="Search goals by title or description..."
            className="w-full rounded-xl border border-dark-700 bg-dark-800/80 py-2 pl-10 pr-4 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {technologies && technologies.length > 0 && (
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="rounded-xl border border-dark-700 bg-dark-800 py-1.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Technologies</option>
              {technologies.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1">
            {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedStatus === status
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                {status === 'ALL' ? 'All' : GOAL_STATUS_CONFIG[status as GoalStatus]?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const statusStyle = GOAL_STATUS_CONFIG[goal.status] || GOAL_STATUS_CONFIG.NOT_STARTED;
            const isCompleted = goal.status === 'COMPLETED';

            return (
              <div
                key={goal.id}
                className="group relative rounded-2xl border border-dark-700 bg-dark-900/70 p-5 backdrop-blur-sm transition-all hover:border-dark-600 hover:shadow-xl hover:shadow-black/40"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => toggleComplete(goal)}
                        title={isCompleted ? 'Mark in progress' : 'Mark completed'}
                        className={`h-5 w-5 rounded-md flex items-center justify-center border transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-dark-600 hover:border-emerald-400 text-transparent hover:text-emerald-400'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <h3 className={`font-bold text-white text-base ${isCompleted ? 'line-through text-dark-400' : ''}`}>
                        {goal.title}
                      </h3>
                    </div>

                    {goal.technology && (
                      <span className="inline-block rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-mono text-brand-400 border border-brand-500/20">
                        {goal.technology.name}
                      </span>
                    )}

                    {goal.description && (
                      <p className="text-xs text-dark-400 mt-2 line-clamp-2">{goal.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(goal)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete goal "${goal.title}"?`)) {
                          deleteMutation.mutate(goal.id);
                        }
                      }}
                      title="Delete"
                      className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Target Metric */}
                {goal.targetMetric && (
                  <div className="text-xs text-dark-300 bg-dark-800/50 rounded-lg px-2.5 py-1.5 border border-dark-800 mt-2">
                    <span className="text-dark-400 font-medium">Target:</span> {goal.targetMetric}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-2 mt-4 pt-4 border-t border-dark-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                      {statusStyle.label}
                    </span>
                    <span className="font-mono font-bold text-white">{goal.progress}%</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-dark-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                {goal.deadline && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-dark-400">
                    <Calendar className="h-3 w-3 text-brand-400" />
                    <span>Target Date: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-dark-700 bg-dark-900/40 p-12 text-center">
          <Target className="h-12 w-12 text-dark-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No learning goals found</h3>
          <p className="text-xs text-dark-400 max-w-sm mx-auto mt-1 mb-6">
            Create goals to stay focused on specific milestones and competencies.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Goal</span>
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-dark-700 bg-dark-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span>{editingGoal ? 'Edit Goal' : 'Create Learning Goal'}</span>
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
                  placeholder="e.g. Build DevTrack Auth System"
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 px-3.5 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Technology</label>
                  <select
                    value={formData.technologyId}
                    onChange={(e) => setFormData({ ...formData, technologyId: e.target.value })}
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">None / General</option>
                    {technologies?.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as GoalStatus })}
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Target Metric / Metric of Done</label>
                <input
                  type="text"
                  value={formData.targetMetric}
                  onChange={(e) => setFormData({ ...formData, targetMetric: e.target.value })}
                  placeholder="e.g. Pass 10 test suites, finish 5 modules"
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-dark-300 uppercase">Progress</label>
                    <span className="font-mono text-xs font-bold text-amber-400">{formData.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    className="w-full accent-amber-500 bg-dark-800 mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional context or milestones..."
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
                  <span>{editingGoal ? 'Update Goal' : 'Save Goal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
