import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ShieldCheck, Database, Server, Lock } from 'lucide-react';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col bg-grid-pattern relative selection:bg-primary-500/20 selection:text-primary-300">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary-500/10 via-accent-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border/60 bg-surface/40 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-primary-400" />
            <span>DevTrack Engineering Platform</span>
            <span>•</span>
            <span className="text-slate-500">Defense-in-depth from Day 1</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-3 h-3 text-cyan-400" /> Express / TS
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-indigo-400" /> PostgreSQL 18 + Prisma
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Zero-Trust Security
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
