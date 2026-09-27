import React from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  BrainCircuit,
  BotMessageSquare,
  ArrowDown,
  Clock,
  MapPin,
  Wifi,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { SecurityEvent } from '../types/index.ts';

interface EventDetailModalProps {
  event: SecurityEvent | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onAcknowledge,
  onResolve,
}) => {
  if (!event) return null;

  const isIntrusion = event.event_type === 'INTRUSION';
  const isSuspicious = event.event_type === 'SUSPICIOUS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isIntrusion
                  ? 'bg-red-500/15 border-red-500/40 text-red-400'
                  : isSuspicious
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  {event.event_type} EVENT LOG
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    event.severity === 'CRITICAL'
                      ? 'bg-red-950 text-red-300 border border-red-500/50'
                      : event.severity === 'HIGH'
                      ? 'bg-orange-950 text-orange-300 border border-orange-500/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  }`}
                >
                  {event.severity} SEVERITY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {event.id} • {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Movement Distance Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-cyan-400">
              <Activity className="w-4 h-4" />
              <span className="font-semibold uppercase tracking-wider">
                Ultrasonic Movement Timeline (Time-of-Flight Trajectory)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between gap-1 overflow-x-auto py-2">
                {event.history_trace && event.history_trace.length > 0 ? (
                  event.history_trace.map((dist, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono border ${
                            idx === event.history_trace.length - 1
                              ? isIntrusion
                                ? 'bg-red-500/20 border-red-500 text-red-300 font-bold scale-110 shadow-lg shadow-red-500/20'
                                : 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold scale-110'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="text-xs">{dist.toFixed(0)}</span>
                          <span className="text-[9px] text-slate-500">cm</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 mt-1">
                          {idx === event.history_trace.length - 1 ? 'BREACH' : `T-${event.history_trace.length - 1 - idx}`}
                        </span>
                      </div>

                      {idx < event.history_trace.length - 1 && (
                        <div className="flex items-center text-slate-600 px-1">
                          <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                        </div>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs font-mono">
                    Baseline: {event.previous_distance_cm} cm → Trigger: {event.distance_cm} cm
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Baseline Distance: <b className="text-slate-200">{event.previous_distance_cm} cm</b></span>
                <span>Final Trigger Distance: <b className={isIntrusion ? 'text-red-400' : 'text-amber-400'}>{event.distance_cm} cm</b></span>
                <span>Delta (Δ): <b className="text-cyan-400">{Math.abs(event.previous_distance_cm - event.distance_cm).toFixed(1)} cm</b></span>
              </div>
            </div>
          </div>

          {/* Section 2: DNN Analysis & AI Confidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
                <BrainCircuit className="w-4 h-4" />
                <span className="font-semibold uppercase tracking-wider">DNN Neural Analysis</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Classification:</span>
                  <span className={`font-bold ${isIntrusion ? 'text-red-400' : 'text-amber-400'}`}>
                    {event.event_type}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Inference Confidence:</span>
                  <span className="font-bold text-cyan-300">
                    {(event.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Neural Layers:</span>
                  <span className="text-slate-300">Dense(16) → Dense(8) → Softmax(3)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Feature Dimensions:</span>
                  <span className="text-slate-300">9 Derived Spatial Vectors</span>
                </div>
              </div>
            </div>

            {/* Device & Hardware Info */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Cpu className="w-4 h-4" />
                <span className="font-semibold uppercase tracking-wider">IoT Hardware Telemetry</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Device ID:</span>
                  <span className="text-slate-200 font-bold">{event.device_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Sensor Model:</span>
                  <span className="text-slate-200">HC-SR04 Ultrasonic</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Monitored Zone:</span>
                  <span className="text-cyan-300">{event.location}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Resolution Status:</span>
                  <span
                    className={`font-bold ${
                      event.status === 'RESOLVED'
                        ? 'text-emerald-400'
                        : event.status === 'ACKNOWLEDGED'
                        ? 'text-amber-400'
                        : 'text-red-400 animate-pulse'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: GenAI Security Explanation */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <BotMessageSquare className="w-4 h-4" />
                <span className="font-semibold uppercase tracking-wider">
                  GenAI Security Dispatch (Gemini API)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                MODEL: gemini-3.8-flash
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-sans mt-2 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
              {event.genai_message}
            </p>

            {/* Quick Dispatch Action to Client */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Dispatch this GenAI alert record directly to client:
              </span>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/client-messages/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        subject: `${event.event_type === 'INTRUSION' ? '🚨 INTRUSION ALERT' : '⚠️ ADVISORY NOTICE'}: ${event.location}`,
                        message: event.genai_message,
                        alert_id: event.id,
                        severity: event.severity,
                        event_type: event.event_type,
                        channel: 'SMS',
                      }),
                    });
                    alert('✅ GenAI Alert Message dispatched to client via SMS & Email!');
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-md shadow-cyan-500/20 transition-all active:scale-95"
              >
                <span>SEND MESSAGE TO CLIENT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-500 font-mono">
            Event timestamp: {event.timestamp}
          </div>

          <div className="flex items-center gap-2">
            {event.status === 'ACTIVE' && (
              <button
                onClick={() => onAcknowledge(event.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                Acknowledge Alert
              </button>
            )}

            {event.status !== 'RESOLVED' && (
              <button
                onClick={() => onResolve(event.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm shadow-emerald-600/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
