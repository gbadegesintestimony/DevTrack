import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User as UserIcon, Mail, UserCheck, Eye, EyeOff, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password rules validation
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const passwordsMatch = formData.password.length > 0 && formData.password === formData.confirmPassword;

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage('Please satisfy all password complexity criteria.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        name: formData.name.trim() || undefined,
        password: formData.password,
      });

      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header Icon & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-4 shadow-lg shadow-brand-500/10">
            <UserCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Developer Account</h1>
          <p className="text-sm text-dark-400 mt-1">Start tracking your skills, technologies & goals securely</p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-dark-700 bg-dark-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                  Username *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-dark-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="johndoe"
                    className="w-full rounded-xl border border-dark-700 bg-dark-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 transition-all focus:border-brand-500 focus:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-dark-700 bg-dark-800/80 py-2.5 px-4 text-sm text-white placeholder-dark-500 transition-all focus:border-brand-500 focus:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-dark-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="developer@example.com"
                  className="w-full rounded-xl border border-dark-700 bg-dark-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 transition-all focus:border-brand-500 focus:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-dark-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-dark-700 bg-dark-800/80 py-2.5 pl-10 pr-10 text-sm text-white placeholder-dark-500 transition-all focus:border-brand-500 focus:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-dark-400 hover:text-dark-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-dark-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-dark-700 bg-dark-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 transition-all focus:border-brand-500 focus:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Password strength checklist */}
            <div className="rounded-xl border border-dark-800 bg-dark-800/50 p-3.5 space-y-1.5 text-xs text-dark-400">
              <div className="font-semibold text-dark-300 mb-1">Password Requirements:</div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasMinLength ? 'text-green-400' : 'text-dark-600'}`} />
                <span className={hasMinLength ? 'text-dark-200' : ''}>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasUppercase && hasLowercase ? 'text-green-400' : 'text-dark-600'}`} />
                <span className={hasUppercase && hasLowercase ? 'text-dark-200' : ''}>Uppercase & lowercase letters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasNumber ? 'text-green-400' : 'text-dark-600'}`} />
                <span className={hasNumber ? 'text-dark-200' : ''}>At least one number</span>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-3.5 w-3.5 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`} />
                  <span className={passwordsMatch ? 'text-dark-200' : 'text-red-400'}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-dark-400 border-t border-dark-800 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 text-center text-xs text-dark-500 flex items-center justify-center gap-2">
          <Shield className="h-3.5 w-3.5 text-brand-400/80" />
          <span>Hashed with Bcrypt (Work Factor 12) & Protected against CSRF attacks</span>
        </div>
      </div>
    </div>
  );
};
