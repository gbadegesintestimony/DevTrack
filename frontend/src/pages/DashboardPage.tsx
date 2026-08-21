import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  Clock,
  Cpu,
  Sparkles,
  Flame,
  ArrowUpRight,
  Plus,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { Technology, Goal, LearningSession, Note } from '../types';

interface DashboardSummary {
  stats: {
    technologies: {
      total: number;
      mastered: number;
      inProgress: number;
    };
    goals: {
      total: number;
      completed: number;
      active: number;
      completionRate: number;
    };
    learning: {
      totalMinutes: number;
      totalHours: number;
      totalSessions: number;
      currentStreakDays: number;
    };
    resources: {
      total: number;
      completed: number;
      completionRate: number;
    };
    notes: {
      total: number;
    };
  };
  activity: {
    periodDays: number;
    dailyActivity: Array<{
      date: string;
      dayName: string;
      minutes: number;
      sessionsCount: number;
    }>;
    technologyDistribution: Array<{
      technologyId: string | null;
      name: string;
      minutes: number;
      percentage: number;
    }>;
    totalMinutesLogged: number;
  };
  topTechnologies: Technology[];
  activeGoals: Goal[];
  recentSessions: LearningSession[];
  recentNotes: Note[];
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get<DashboardSummary>('/dashboard/summary');
      return res.data!;
    },
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const stats = summary?.stats;
  const activity = summary?.activity;
  const topTechnologies = summary?.topTechnologies || [];
  const activeGoals = summary?.activeGoals || [];
  const recentSessions = summary?.recentSessions || [];

  // Find max minutes for relative bar chart height
  const maxDailyMinutes = Math.max(
    ...(activity?.dailyActivity.map((d) => d.minutes) || [60]),
    60
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Welcome & Security Status Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-dark-700 bg-gradient-to-r from-dark-900 via-dark-900/90 to-brand-950/40 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Session Authenticated • HttpOnly & CSRF Active</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-3">
              <span>Welcome back, {user?.name || user?.username}!</span>
              <Sparkles className="h-6 w-6 text-brand-400 animate-pulse" />
            </h1>
            <p className="text-sm text-dark-300 mt-1 max-w-xl">
              Track your developer velocity, study streak, mastered technologies, and goal completion rates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/sessions"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-colors"
            >
              <Clock className="h-4 w-4" />
              <span>Start Study Timer</span>
            </Link>
            <Link
              to="/goals"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Goal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Streak Metric */}
        <div className="group rounded-2xl border border-dark-700 bg-dark-900/70 p-5 backdrop-blur-sm transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Current Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="h-4 w-4 fill-amber-500/30 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{stats?.learning.currentStreakDays || 0}</span>
            <span className="text-xs text-dark-400 font-medium">consecutive days</span>
          </div>
          <p className="text-[11px] text-dark-400 mt-1">
            {stats?.learning.currentStreakDays && stats.learning.currentStreakDays > 0
              ? 'Keep the momentum going today! 🔥'
              : 'Log a session today to start your streak!'}
          </p>
        </div>

        {/* Study Hours */}
        <div className="group rounded-2xl border border-dark-700 bg-dark-900/70 p-5 backdrop-blur-sm transition-all hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Total Study Time</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{stats?.learning.totalHours || 0}</span>
            <span className="text-xs text-dark-400 font-medium">hours</span>
          </div>
          <p className="text-[11px] text-dark-400 mt-1">
            Across {stats?.learning.totalSessions || 0} focused learning sessions
          </p>
        </div>

        {/* Mastered Technologies */}
        <div className="group rounded-2xl border border-dark-700 bg-dark-900/70 p-5 backdrop-blur-sm transition-all hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Tech Stacks</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{stats?.technologies.total || 0}</span>
            <span className="text-xs text-dark-400 font-medium">
              ({stats?.technologies.mastered || 0} Mastered)
            </span>
          </div>
          <p className="text-[11px] text-dark-400 mt-1">
            {stats?.technologies.inProgress || 0} currently in progress
          </p>
        </div>

        {/* Goal Completion */}
        <div className="group rounded-2xl border border-dark-700 bg-dark-900/70 p-5 backdrop-blur-sm transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dark-400">Goals Velocity</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{stats?.goals.completionRate || 0}%</span>
            <span className="text-xs text-dark-400 font-medium">
              ({stats?.goals.completed}/{stats?.goals.total})
            </span>
          </div>
          <p className="text-[11px] text-dark-400 mt-1">
            {stats?.goals.active || 0} active milestones remaining
          </p>
        </div>
      </div>

      {/* Main Analytics Grid: Activity Chart & Technology Mastery */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 7-Day Visual Activity Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-dark-700 bg-dark-900/70 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  <span>Learning Activity Breakdown</span>
                </h2>
                <p className="text-xs text-dark-400 mt-0.5">
                  Total {activity?.totalMinutesLogged || 0} minutes logged over the past 7 days
                </p>
              </div>

              <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                Last 7 Days
              </span>
            </div>

            {/* Daily Bars */}
            <div className="grid grid-cols-7 gap-3 items-end h-44 pt-4 border-b border-dark-800 pb-2">
              {activity?.dailyActivity.map((day, idx) => {
                const heightPercent = Math.max(8, Math.round((day.minutes / maxDailyMinutes) * 100));
                const hasActivity = day.minutes > 0;

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-purple-300">
                      {day.minutes}m
                    </div>
                    <div className="w-full max-w-[36px] bg-dark-800 rounded-t-xl overflow-hidden h-full flex items-end">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          hasActivity
                            ? 'bg-gradient-to-t from-purple-600 to-brand-500 group-hover:from-purple-500 group-hover:to-brand-400'
                            : 'bg-dark-800'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-dark-400 group-hover:text-white transition-colors">
                      {day.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technology Distribution Summary Pills */}
          {activity?.technologyDistribution && activity.technologyDistribution.length > 0 && (
            <div className="mt-6 pt-4 border-t border-dark-800/80">
              <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider block mb-2">
                Time Breakdown by Tech
              </span>
              <div className="flex flex-wrap gap-2">
                {activity.technologyDistribution.map((t, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-lg bg-dark-800 px-2.5 py-1 text-xs text-dark-300 border border-dark-700"
                  >
                    <span className="font-medium text-white">{t.name}</span>
                    <span className="font-mono text-purple-400">{t.minutes}m ({t.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Technologies Mastery Stack */}
        <div className="rounded-2xl border border-dark-700 bg-dark-900/70 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="h-5 w-5 text-brand-400" />
                <span>Tech Mastery</span>
              </h2>
              <Link to="/technologies" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <span>View all</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {topTechnologies.length > 0 ? (
              <div className="space-y-4">
                {topTechnologies.map((tech) => (
                  <div key={tech.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{tech.name}</span>
                      <span className="font-mono text-dark-400">{tech.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-dark-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${tech.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-dark-400">
                No technologies tracked yet.{' '}
                <Link to="/technologies" className="text-brand-400 underline">Add one now</Link>.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-dark-800">
            <Link
              to="/technologies"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dark-700 bg-dark-800/80 py-2 text-xs font-semibold text-white hover:bg-dark-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Track New Technology</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Active Goals & Recent Sessions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Goals */}
        <div className="rounded-2xl border border-dark-700 bg-dark-900/70 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-400" />
              <span>Upcoming Milestones & Goals</span>
            </h2>
            <Link to="/goals" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {activeGoals.length > 0 ? (
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-xl border border-dark-800 bg-dark-800/50 p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white">{goal.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-dark-400">
                      {goal.technology && (
                        <span className="font-mono text-brand-400">{goal.technology.name}</span>
                      )}
                      {goal.deadline && (
                        <span>• Due {new Date(goal.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-amber-400">{goal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-dark-400">
              No active goals right now.{' '}
              <Link to="/goals" className="text-brand-400 underline">Set a new goal</Link>.
            </div>
          )}
        </div>

        {/* Recent Study Sessions */}
        <div className="rounded-2xl border border-dark-700 bg-dark-900/70 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <span>Recent Learning Sessions</span>
            </h2>
            <Link to="/sessions" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="rounded-xl border border-dark-800 bg-dark-800/50 p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white">{sess.topicsCovered}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-dark-400">
                      {sess.technology && (
                        <span className="font-mono text-purple-400">{sess.technology.name}</span>
                      )}
                      <span>• {new Date(sess.sessionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-2 py-1 text-[11px] font-mono font-bold text-purple-300">
                    {sess.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-dark-400">
              No sessions recorded yet.{' '}
              <Link to="/sessions" className="text-brand-400 underline">Log your first session</Link>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
