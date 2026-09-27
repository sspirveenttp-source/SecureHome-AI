import React, { useState } from 'react';
import {
  BellRing,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SecurityEvent } from '../types/index.ts';

interface AlertsViewProps {
  alerts: SecurityEvent[];
  onOpenDetails: (alert: SecurityEvent) => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onOpenDetails,
  onAcknowledge,
  onResolve,
}) => {
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INTRUSION' | 'SUSPICIOUS'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const filtered = alerts.filter((a) => {
    if (typeFilter !== 'ALL' && a.event_type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <BellRing className="w-5 h-5 text-red-400" />
            Security Alerts & Dispatch Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time security events classified by the DNN and narrated by GenAI
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Total Alerts: <b className="text-white">{alerts.length}</b></span>
          <span className="text-slate-500">•</span>
          <span className="text-red-400 font-semibold">
            Active: {alerts.filter((a) => a.status === 'ACTIVE').length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-mono text-slate-400">Classification:</span>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            {(['ALL', 'INTRUSION', 'SUSPICIOUS'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded font-semibold ${
                  typeFilter === t
                    ? t === 'INTRUSION'
                      ? 'bg-red-500 text-white'
                      : t === 'SUSPICIOUS'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">State:</span>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded font-semibold ${
                  statusFilter === s ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {filtered.map((alert) => {
          const isIntrusion = alert.event_type === 'INTRUSION';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${
                isIntrusion
                  ? 'bg-slate-900/90 border-red-500/40 hover:border-red-500/80 shadow-lg shadow-red-950/20'
                  : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-500/80 shadow-lg shadow-amber-950/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-xl font-bold ${
                      isIntrusion
                        ? 'bg-red-500/20 border border-red-500 text-red-400'
                        : 'bg-amber-500/20 border border-amber-500 text-amber-400'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono text-sm">
                        {alert.event_type}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border border-red-500/50'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          alert.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-950 text-red-400 animate-pulse'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>{alert.device_name} ({alert.location})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDetails(alert)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold transition-all"
                  >
                    <span>VIEW DETAILS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* GenAI Message Block */}
              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 mb-3">
                {alert.genai_message}
              </p>

              {/* Telemetry pill details */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-4">
                  <span>
                    Current Distance: <b className="text-white">{alert.distance_cm.toFixed(1)} cm</b>
                  </span>
                  <span>
                    Baseline: <b className="text-slate-300">{alert.previous_distance_cm.toFixed(1)} cm</b>
                  </span>
                  <span>
                    DNN Confidence: <b className="text-cyan-400">{(alert.confidence * 100).toFixed(1)}%</b>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No alerts logged matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
