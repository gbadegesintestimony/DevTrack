import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Terminal,
  Database,
  Lock,
  ArrowRight,
  Sparkles,
  Activity,
  Cpu,
  Target,
  BookOpen,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-brand-400" />,
      title: 'Technology Mastery Tracker',
      description: 'Track frameworks, languages, and tools with progress indicators, status categorization, and roadmap dates.',
      link: '/technologies',
    },
    {
      icon: <Target className="w-6 h-6 text-amber-400" />,
      title: 'Target Goals & Milestones',
      description: 'Define clear target metrics, track progress percentages, set deadlines, and celebrate completed milestones.',
      link: '/goals',
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-400" />,
      title: 'Study Timer & Focus Log',
      description: 'Live stopwatch and focused study timer. Log deep work sessions, topics covered, and calculate active day streaks.',
      link: '/sessions',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-blue-400" />,
      title: 'Learning Resources & Curricula',
      description: 'Bookmark courses, documentation, books, tutorials, and video series with sanitized URLs and progress tracking.',
      link: '/resources',
    },
    {
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
      title: 'Developer Second Brain & Notes',
      description: 'Write markdown notes, store code snippets, categorize with searchable tags, and review with live preview tabs.',
      link: '/notes',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
      title: 'Real-Time Analytics Dashboard',
      description: '7-day visual study activity bars, study streaks, technology mastery stacks, and milestone completion metrics.',
      link: '/dashboard',
    },
  ];

  const pillars = [
    {
      icon: <Lock className="w-5 h-5 text-cyan-400" />,
      title: 'Server-Side Authority & Anti-IDOR',
      description: 'Every single resource query strictly enforces composite user scoping. Zero cross-tenant ID leakage.',
      badge: 'Zero Trust',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: 'Defense in Depth & CSRF Protection',
      description: 'Layered security with Helmet CSP headers, HttpOnly session cookies, double-submit CSRF, and anti-brute force rate limiting.',
      badge: 'Hardened',
    },
    {
      icon: <Database className="w-5 h-5 text-indigo-400" />,
      title: 'Relational Integrity with PostgreSQL',
      description: 'Self-hosted PostgreSQL with Prisma ORM. Strict relational constraints, cascading policies, and foreign key indexes.',
      badge: 'PostgreSQL 16',
    },
    {
      icon: <Terminal className="w-5 h-5 text-amber-400" />,
      title: 'Production Observability & Safe Logging',
      description: 'Structured Pino logging with automated redaction of sensitive credentials, tokens, cookies, and non-leaking errors.',
      badge: 'Safe Logging',
    },
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-mono text-brand-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
          <span>Secure Full-Stack Developer Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Engineering a <span className="text-cyan-400">Secure Full-</span>
          <br className="hidden sm:inline" />{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-teal-600/75 bg-clip-text text-transparent">
            Stack
          </span>{' '}
          Platform
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          DevTrack empowers developers to track technologies, learning goals, resources, focus sessions, and markdown notes in a secure, high-performance platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow transition-all hover:scale-[1.02]"
            >
              <BarChart3 className="w-4 h-4" />
              Go to Developer Dashboard
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow transition-all hover:scale-[1.02]"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-700 text-sm font-medium transition-all"
              >
                Sign In
              </Link>
            </>
          )}

          <Link
            to="/status"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-dark-800/60 hover:bg-dark-800 text-dark-300 hover:text-white border border-dark-700 text-sm font-medium transition-all"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Live System Health
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Developer Tracking Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-dark-400">
            Everything you need to manage your engineering skills, study time, and milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl border border-dark-700 bg-dark-900/70 p-6 backdrop-blur-sm transition-all hover:border-dark-600 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between"
            >
              <div>
                <div className="p-3 rounded-xl bg-dark-800/80 border border-dark-700 w-fit mb-4 group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-dark-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-800/80">
                <Link
                  to={feature.link}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Engineering Pillars */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-dark-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Security-First Architecture</h2>
            <p className="text-xs text-dark-400 font-mono mt-0.5">Enterprise security embedded into every layer from day one</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center border border-surface-border">
                  {pillar.icon}
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-300">
                  {pillar.badge}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{pillar.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
