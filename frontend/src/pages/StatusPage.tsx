import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { HealthCheckResponse } from '../types';
import { 
  Activity, 
  Database, 
  Server, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  ShieldAlert, 
  Terminal,
  Zap
} from 'lucide-react';

export const StatusPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await api.get<HealthCheckResponse>('/health');
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Health check failed');
      }
      return response.data;
    },
    refetchInterval: 10000, // auto refresh every 10s
  });

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m ${seconds % 60}s`;
    if (mins > 0) return `${mins}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary-400 mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>REAL-TIME DIAGNOSTICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Status & Health</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live telemetry from Express API & self-hosted PostgreSQL database
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-slate-800 text-xs font-mono text-slate-200 border border-surface-border transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-primary-400' : ''}`} />
          <span>{isFetching ? 'Refreshing...' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* API Status */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <Server className="w-5 h-5" />
            </div>
            {isLoading ? (
              <span className="text-xs font-mono text-slate-400 animate-pulse">Checking...</span>
            ) : isError ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                <XCircle className="w-3.5 h-3.5" /> Offline
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operational
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-white">Express Backend API</h2>
          <p className="text-xs text-slate-400 mt-1">HTTP / JSON Gateway with security middlewares</p>

          <div className="mt-4 pt-4 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Environment:</span>
            <span className="text-primary-400 font-semibold uppercase">{data?.environment || '—'}</span>
          </div>
        </div>

        {/* Database Status */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            {isLoading ? (
              <span className="text-xs font-mono text-slate-400 animate-pulse">Testing...</span>
            ) : data?.services?.database?.status === 'healthy' ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5" /> Standby
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-white">PostgreSQL 18</h2>
          <p className="text-xs text-slate-400 mt-1">Self-hosted local database with Prisma ORM</p>

          <div className="mt-4 pt-4 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Query Latency:</span>
            <span className="text-indigo-400 font-semibold">{data?.services?.database?.latencyMs ?? 0} ms</span>
          </div>
        </div>

        {/* API Uptime */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              <Zap className="w-3 h-3" /> Live
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white">Process Uptime</h2>
          <p className="text-xs text-slate-400 mt-1">Continuous daemon execution telemetry</p>

          <div className="mt-4 pt-4 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Uptime Duration:</span>
            <span className="text-cyan-400 font-semibold">{data?.uptimeSeconds ? formatUptime(data.uptimeSeconds) : '—'}</span>
          </div>
        </div>
      </div>

      {/* Raw Diagnostic JSON Payload */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-white">Raw /api/v1/health Telemetry Payload</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Timestamp: {data?.timestamp || new Date().toISOString()}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400 animate-pulse">
            Querying backend endpoint /api/v1/health...
          </div>
        ) : isError ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            Error contacting backend: {(error as Error)?.message || 'Make sure the backend server is running.'}
          </div>
        ) : (
          <pre className="p-4 rounded-xl bg-surface-elevated/90 border border-surface-border text-xs font-mono text-cyan-300 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
