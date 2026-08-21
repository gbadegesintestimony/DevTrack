import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { Note, Technology } from '../types';
import { FileText, Plus, Search, Edit2, Trash2, X, Check, Loader2, Sparkles, Eye, Code, Calendar } from 'lucide-react';

export const NotesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    technologyId: '',
    tagInput: '',
    tags: [] as string[],
  });

  const { data: technologies } = useQuery({
    queryKey: ['technologies-options'],
    queryFn: async () => {
      const res = await api.get<Technology[]>('/technologies?limit=100');
      return res.data || [];
    },
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', searchTerm, selectedTag, selectedTech],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTag) params.append('tag', selectedTag);
      if (selectedTech) params.append('technologyId', selectedTech);
      const res = await api.get<Note[]>(`/notes?${params.toString()}`);
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (newNote: { title: string; content: string; technologyId?: string; tags: string[] }) =>
      api.post('/notes', newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{ title: string; content: string; technologyId?: string; tags: string[] }> }) =>
      api.patch(`/notes/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const openCreateModal = () => {
    setEditingNote(null);
    setActiveTab('write');
    setFormData({
      title: '',
      content: '## Summary\n\n### Key Concepts\n- Concept 1\n- Concept 2\n\n```ts\n// Code snippet example\n```',
      technologyId: selectedTech || '',
      tagInput: '',
      tags: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setActiveTab('write');
    setFormData({
      title: note.title,
      content: note.content,
      technologyId: note.technologyId || '',
      tagInput: '',
      tags: note.tags || [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const addTag = () => {
    const trimmed = formData.tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmed],
        tagInput: '',
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      content: formData.content,
      technologyId: formData.technologyId || undefined,
      tags: formData.tags,
    };

    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, updates: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Collect all unique tags for filter
  const allTags = Array.from(new Set(notes?.flatMap((n) => n.tags || []) || []));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-3">
            <FileText className="h-8 w-8 text-emerald-400" />
            <span>Developer Knowledge & Notes</span>
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Store markdown notes, architecture decisions, snippets, and technical cheat sheets
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
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
            placeholder="Search notes by title or content..."
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

          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-xl border border-dark-700 bg-dark-800 py-1.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group relative rounded-2xl border border-dark-700 bg-dark-900/70 p-5 backdrop-blur-sm transition-all hover:border-dark-600 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-brand-300 transition-colors line-clamp-1">
                      {note.title}
                    </h3>
                    {note.technology && (
                      <span className="mt-1 inline-block rounded-md bg-dark-800 px-2 py-0.5 text-[10px] font-mono text-dark-300 border border-dark-700">
                        {note.technology.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(note)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete note "${note.title}"?`)) {
                          deleteMutation.mutate(note.id);
                        }
                      }}
                      title="Delete"
                      className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="my-3 rounded-xl bg-dark-950/60 p-3 text-xs font-mono text-dark-300 line-clamp-5 whitespace-pre-wrap border border-dark-800/80">
                  {note.content}
                </div>
              </div>

              {/* Tags & Date */}
              <div className="mt-2 pt-3 border-t border-dark-800 space-y-2">
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        onClick={() => setSelectedTag(t === selectedTag ? '' : t)}
                        className={`cursor-pointer rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                          selectedTag === t
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-dark-500">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-dark-700 bg-dark-900/40 p-12 text-center">
          <FileText className="h-12 w-12 text-dark-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No notes created yet</h3>
          <p className="text-xs text-dark-400 max-w-sm mx-auto mt-1 mb-6">
            Write markdown notes, store code snippets, and build your developer second brain.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Note</span>
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-dark-700 bg-dark-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span>{editingNote ? 'Edit Note' : 'Create New Note'}</span>
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. CSRF Protection Patterns in Express"
                    className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2 px-3 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
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

              {/* Tag Management */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.tagInput}
                    onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Type a tag and press Add"
                    className="flex-1 rounded-xl border border-dark-700 bg-dark-800 py-1.5 px-3 text-xs text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-xl bg-dark-800 px-3 py-1.5 text-xs font-semibold text-white border border-dark-700 hover:bg-dark-700"
                  >
                    Add Tag
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 border border-emerald-500/20"
                      >
                        #{t}
                        <button type="button" onClick={() => removeTag(t)} className="hover:text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Editor / Preview Tabs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase">Content (Markdown) *</label>
                  <div className="flex items-center rounded-lg bg-dark-800 p-0.5 border border-dark-700">
                    <button
                      type="button"
                      onClick={() => setActiveTab('write')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        activeTab === 'write' ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-white'
                      }`}
                    >
                      <Code className="h-3 w-3" /> Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        activeTab === 'preview' ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-white'
                      }`}
                    >
                      <Eye className="h-3 w-3" /> Preview
                    </button>
                  </div>
                </div>

                {activeTab === 'write' ? (
                  <textarea
                    rows={8}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border border-dark-700 bg-dark-800/90 py-2.5 px-3.5 text-xs font-mono text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
                  />
                ) : (
                  <div className="min-h-[175px] max-h-[250px] overflow-y-auto rounded-xl border border-dark-700 bg-dark-950 p-4 text-xs font-mono text-dark-200 whitespace-pre-wrap">
                    {formData.content}
                  </div>
                )}
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
                  <span>{editingNote ? 'Update Note' : 'Save Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
