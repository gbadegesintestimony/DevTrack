import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevResetToken(null);

    if (!email.trim()) {
      setErrorMessage('Please provide your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<{ message: string; resetToken?: string }>('/auth/forgot-password', {
        email: email.trim(),
      });

      if (res.success && res.data) {
        setSuccessMessage(res.data.message);
        if (res.data.resetToken) {
          setDevResetToken(res.data.resetToken);
        }
      } else {
        setErrorMessage(res.error?.message || 'Failed to process password reset request.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-4 shadow-lg shadow-brand-500/10">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="text-sm text-dark-400 mt-1">We will send you instructions to safely recover your account</p>
        </div>

        <div className="rounded-2xl border border-dark-700 bg-dark-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
              {devResetToken && (
                <div className="mt-3 rounded-lg bg-dark-950 p-3 text-xs border border-dark-800">
                  <div className="font-semibold text-brand-400 mb-1">Development Quick Link:</div>
                  <Link
                    to={`/reset-password?token=${devResetToken}`}
                    className="text-brand-300 underline break-all hover:text-brand-200"
                  >
                    Click here to reset password directly
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-dark-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full rounded-xl border border-dark-700 bg-dark-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 transition-all focus:border-brand-500 focus:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-dark-400 border-t border-dark-800 pt-4">
            <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
