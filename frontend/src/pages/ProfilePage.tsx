import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/apiClient';
import { 
  User as UserIcon, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  Calendar, 
  Save, 
  Loader2, 
  AlertCircle,
  Edit2,
  Lock,
  X,
  ShieldCheck
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [learningPrefs, setLearningPrefs] = useState<string>(
    Array.isArray(user?.learningPreferences) ? user.learningPreferences.join(', ') : ''
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change Password state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    const prefsArray = learningPrefs
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const res = await api.patch('/auth/profile', {
      name,
      bio,
      learningPreferences: prefsArray,
    });

    setIsUpdatingProfile(false);
    if (res.success) {
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      await refreshUser();
    } else {
      setProfileMessage({ type: 'error', text: res.error?.message || 'Failed to update profile.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsChangingPassword(true);
    const res = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    setIsChangingPassword(false);
    if (res.success) {
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
    } else {
      setPasswordMessage({ type: 'error', text: res.error?.message || 'Failed to change password.' });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header Profile Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden border border-surface-border/80">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/20 shrink-0">
            {user.username.substring(0, 1).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {user.name || user.username}
            </h1>
            <p className="text-sm font-mono text-brand-400">@{user.username}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-surface-border/80">
          <div className="flex items-center gap-2 border-b border-surface-border/60 pb-4">
            <UserIcon className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">Developer Profile Information</h2>
          </div>

          {profileMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                profileMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}
            >
              {profileMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Testimony Gbadegesin"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-900/80 border border-dark-700 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Bio / Learning Objective
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Brief summary of your learning journey and career goals..."
                className="w-full px-4 py-2.5 rounded-xl bg-dark-900/80 border border-dark-700 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Learning Preferences (Comma-separated)
              </label>
              <input
                type="text"
                value={learningPrefs}
                onChange={(e) => setLearningPrefs(e.target.value)}
                placeholder="e.g. Golang, TypeScript, JavaScript"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-900/80 border border-dark-700 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Separate technologies or topics with commas.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form / Locked Security Container */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-surface-border/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-surface-border/60 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Security & Password</h2>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setIsEditingPassword(!isEditingPassword);
                  setPasswordMessage(null);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isEditingPassword
                    ? 'bg-dark-800 text-slate-300 hover:text-white border border-dark-700'
                    : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {isEditingPassword ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Password</span>
                  </>
                )}
              </button>
            </div>

            {passwordMessage && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            {!isEditingPassword ? (
              /* Locked View */
              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400">Account Password</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" /> Protected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-base tracking-widest text-slate-300">••••••••••••</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-2 font-mono leading-relaxed">
                  <p>
                    🔒 Your password is encrypted with <strong className="text-slate-200">Bcrypt adaptive hashing (cost 12)</strong> with zero plain-text storage.
                  </p>
                  <p className="text-slate-400">
                    Click the <strong>Edit Password</strong> button above whenever you wish to update your credentials.
                  </p>
                </div>
              </div>
            ) : (
              /* Active Form View */
              <form onSubmit={handleChangePassword} className="mt-6 space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-900/80 border border-dark-700 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase, lowercase & number"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-900/80 border border-dark-700 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-900/80 border border-dark-700 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setPasswordMessage(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-dark-700 bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <KeyRound className="w-3.5 h-3.5" />
                    )}
                    <span>{isChangingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
