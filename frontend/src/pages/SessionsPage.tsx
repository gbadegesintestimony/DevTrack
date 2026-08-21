import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { LearningSession, Technology } from '../types';
import { Clock, Plus, Play, Square, Calendar, Edit2, Trash2, X, Check, Loader2, Sparkles, Flame } from 'lucide-react';

export const SessionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LearningSession | null>(null);

  // Live Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    technologyId: '',
    durationMinutes: 45,
    topicsCovered: '',
    notes: '',
    sessionDate: new Date().toISOString().split('T')[0],
  });

  const { data: technologies } = useQuery({
    queryKey: ['technologies-options'],
    queryFn: async () => {
      const res = await api.get<Technology[]>('/technologies?limit=100');
      return res.data || [];
    },
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', selectedTech],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedTech) params.append('technologyId', selectedTech);
      const res = await api.get<LearningSession[]>(`/sessions?${params.toString()}`);
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (newSession: typeof formData) =>
      api.post('/sessions', {
        ...newSession,
        technologyId: newSession.technologyId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<typeof formData> }) =>
      api.patch(`/sessions/${id}`, {
        ...updates,
        technologyId: updates.technologyId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const openCreateModal = (suggestedMinutes?: number) => {
    setEditingSession(null);
    setFormData({
      technologyId: selectedTech || '',
      durationMinutes: suggestedMinutes || 45,
      topicsCovered: '',
      notes: '',
      sessionDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sess: LearningSession) => {
    setEditingSession(sess);
    setFormData({
      technologyId: sess.technologyId || '',
      durationMinutes: sess.durationMinutes,
      topicsCovered: sess.topicsCovered,
      notes: sess.notes || '',
      sessionDate: sess.sessionDate ? sess.sessionDate.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  const handleStopAndLog = () => {
    setIsTimerRunning(false);
    const recordedMinutes = Math.max(1, Math.round(timerSeconds / 60));
    setTimerSeconds(0);
    openCreateModal(recordedMinutes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const totalMinutes = sessions?.reduce((acc, s) => acc + s.durationMinutes, 0) || 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-3">
            <Clock className="h-8 w-8 text-purple-400" />
            <span>Learning Sessions & Study Timer</span>
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Log your study time, topics mastered, and measure deep work consistency
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Log Session</span>
        </button>
      </div>

      {/* Live Stopwatch & Stats Card */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Active Timer Box */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-purple-400" /> Live Study Timer
              </span>
              {isTimerRunning && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                </span>
              )}
            </div>
            <div className="text-4xl font-mono font-bold text-white tracking-wider my-2">
              {formatTimer(timerSeconds)}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-purple-500/20">
            {!isTimerRunning ? (
              <button
                onClick={() => setIsTimerRunning(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors shadow-md shadow-purple-600/30"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Timer</span>
              </button>
            ) : (
              <button
                onClick={handleStopAndLog}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/30"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop & Log</span>
              </button>
            )}
          </div>
        </div>

        {/* Total Hours Metric */}
        <div className="rounded-2xl border border-dark-700 bg-dark-900/60 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Total Study Time</span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mt-4">{totalHours} <span className="text-sm font-normal text-dark-400">hours</span></div>
            <p className="text-xs text-dark-400 mt-1">{totalMinutes} total focused minutes logged</p>
          </div>
        </div>

        {/* Total Sessions Metric */}
        <div className="rounded-2xl border border-dark-700 bg-dark-900/60 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Total Sessions</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mt-4">{sessions?.length || 0}</div>
            <p className="text-xs text-dark-400 mt-1">Recorded deep work study sessions</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      {technologies && technologies.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-dark-400 font-semibold">Filter by Tech:</span>
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
        </div>
      )}

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="group rounded-2xl border border-dark-700 bg-dark-900/70 p-5 backdrop-blur-sm transition-all hover:border-dark-600 hover:shadow-xl hover:shadow-black/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-mono font-bold text-purple-300">
                    {sess.durationMinutes} mins
                  </div>
                  {sess.technology && (
                    <span className="rounded-md bg-dark-800 px-2 py-0.5 text-[11px] font-mono text-dark-300 border border-dark-700">
                      {sess.technology.name}
                    </span>
                  )}
                  <span className="text-xs text-dark-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(sess.sessionDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white pt-1">{sess.topicsCovered}</h3>
                {sess.notes && (
                  <p className="text-xs text-dark-400 line-clamp-1">{sess.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity self-end sm:self-center">
                <button
                  onClick={() => openEditModal(sess)}
                  title="Edit"
                  className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this learning session log?')) {
                      deleteMutation.mutate(sess.id);
                    }
                  }}
                  title="Delete"
                  className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-dark-700 bg-dark-900/40 p-12 text-center">
          <Clock className="h-12 w-12 text-dark-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No learning sessions recorded</h3>
          <p className="text-xs text-dark-400 max-w-sm mx-auto mt-1 mb-6">
            Track your focus hours and note key topics covered during your study sessions.
          </p>
          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" />
            <span>Log First Session</span>
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-dark-700 bg-dark-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span>{editingSession ? 'Edit Session' : 'Log Learning Session'}</span>
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Topics Covered *</label>
                <input
                  type="text"
                  required
                  value={formData.topicsCovered}
                  onChange={(e) => setFormData({ ...formData, topicsCovered: e.target.value })}
                  placeholder="e.g. Next.js App Router, SSR, Middleware"
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 px-3.5 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

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
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Session Date</label>
                <input
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Notes & Key Takeaways</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What went well? Any blockers or concepts to revisit?"
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
                  <span>{editingSession ? 'Update Session' : 'Save Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
