import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Wifi,
  Cpu,
  Clock,
  Radio,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Play,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import {
  SystemStatusResponse,
  SensorReading,
  SecurityEvent,
} from '../types/index.ts';
import { LiveSensorChart } from '../components/LiveSensorChart.tsx';

interface DashboardViewProps {
  status: SystemStatusResponse | null;
  readings: SensorReading[];
  timeRange: string;
  setTimeRange: (range: string) => void;
  onOpenAlertDetails: (alert: SecurityEvent) => void;
  onOpenDemo: () => void;
  onNavigateToSimulator: () => void;
  onNavigateToAssistant: () => void;
  onNavigateToClientMessages?: () => void;
  alerts?: SecurityEvent[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  readings,
  timeRange,
  setTimeRange,
  onOpenAlertDetails,
  onOpenDemo,
  onNavigateToSimulator,
  onNavigateToAssistant,
  onNavigateToClientMessages,
  alerts = [],
}) => {
  const currentDist = status?.live_sensor.current_distance ?? 82.0;
  const minDist = status?.live_sensor.min_distance ?? 80.0;
  const maxDist = status?.live_sensor.max_distance ?? 84.5;
  const avgDist = status?.live_sensor.avg_distance ?? 82.2;
  const movements = status?.live_sensor.detected_movements_count ?? 0;
  const freq = status?.live_sensor.update_frequency_hz ?? 1.0;
  const secStatus = status?.security_status ?? 'NORMAL';
  const isLive = status?.active_mode === 'LIVE DEVICE MODE';
  const latestEvent = status?.latest_event;

  const handleQuickDispatch = async (event: SecurityEvent) => {
    try {
      await fetch('/api/client-messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `${event.event_type === 'INTRUSION' ? '🚨 INTRUSION ALERT' : '⚠️ SECURITY ADVISORY'}: ${event.location}`,
          message: event.genai_message,
          alert_id: event.id,
          severity: event.severity,
          event_type: event.event_type,
          channel: 'SMS',
        }),
      });
      alert(`✅ GenAI Alert Message dispatched to client via SMS!`);
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Presentation Launcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white font-mono tracking-tight">
              Command Center Overview
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
              PROTOTYPE v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live ultrasonic telemetry ingestion pipeline from HC-SR04 & ESP8266 node with real-time Deep Neural Network classification and GenAI alert synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START LIVE DEMO</span>
          </button>

          <button
            onClick={onNavigateToSimulator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulator</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Security Status */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            secStatus === 'INTRUSION'
              ? 'bg-red-950/40 border-red-500/60 glow-red'
              : secStatus === 'SUSPICIOUS'
              ? 'bg-amber-950/40 border-amber-500/60 glow-amber'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Security Status</span>
            <ShieldAlert
              className={`w-4 h-4 ${
                secStatus === 'INTRUSION'
                  ? 'text-red-400 animate-pulse'
                  : secStatus === 'SUSPICIOUS'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            />
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-extrabold font-mono tracking-wide ${
                secStatus === 'INTRUSION'
                  ? 'text-red-400 animate-pulse'
                  : secStatus === 'SUSPICIOUS'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {secStatus}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono mt-2 truncate">
            {secStatus === 'INTRUSION'
              ? 'Critical boundary breach detected'
              : secStatus === 'SUSPICIOUS'
              ? 'Irregular movement pattern flagged'
              : 'Perimeter clear • Ambient nominal'}
          </div>
        </div>

        {/* Card 2: Live Current Distance */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Live Ultrasonic Distance</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {currentDist.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-cyan-400 font-bold">cm</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/80">
            <span>Min: <b className="text-slate-300">{minDist}cm</b></span>
            <span>Avg: <b className="text-slate-300">{avgDist}cm</b></span>
            <span>Max: <b className="text-slate-300">{maxDist}cm</b></span>
          </div>
        </div>

        {/* Card 3: ESP8266 IoT Hardware Node */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Hardware Node</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white font-mono truncate">
              {status?.active_device?.device_id || 'ESP8266-HOME-01'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold">
              {status?.active_device?.status || 'ONLINE'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{status?.active_device?.ip_address}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-800/80">
            <span>RSSI: <b className="text-slate-300">{status?.active_device?.wifi_rssi} dBm</b></span>
            <span className="text-cyan-400">{status?.active_mode}</span>
          </div>
        </div>

        {/* Card 4: DNN & Event Analytics */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Telemetry & Rate</span>
            <Wifi className="w-4 h-4 text-purple-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {movements}
            </span>
            <span className="text-xs font-mono text-slate-400">movements</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Update Frequency: <b className="text-cyan-400">{freq} Hz</b> (~{Math.round(1000 / (freq || 1))}ms)
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-800/80">
            <span>Active Alerts: <b className="text-amber-400">{status?.active_alerts ?? 0}</b></span>
            <span>Total: <b className="text-slate-300">{status?.total_alerts ?? 0}</b></span>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <LiveSensorChart
        readings={readings}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        intrusionThreshold={35}
        suspiciousThreshold={60}
      />

      {/* Latest GenAI Security Advisory Banner */}
      {latestEvent && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase">
                LATEST GENAI SECURITY DISPATCH
              </span>
              <span className="text-xs font-mono text-slate-400">
                {new Date(latestEvent.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAlertDetails(latestEvent)}
                className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>View Full Telemetry Trace</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            {latestEvent.genai_message}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span>Classification: <b className="text-white">{latestEvent.event_type}</b></span>
              <span>DNN Confidence: <b className="text-cyan-400">{(latestEvent.confidence * 100).toFixed(1)}%</b></span>
              <span>Breach Point: <b className="text-amber-400">{latestEvent.distance_cm} cm</b></span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuickDispatch(latestEvent)}
                className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/40 text-[11px] transition-all"
              >
                Send Message to Client (SMS)
              </button>
              <button
                onClick={onNavigateToAssistant}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Ask AI Assistant →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Ingestion & Timestamp Records Dashboard */}
      {alerts && alerts.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>Alert Ingestion Records & Timestamp Log</span>
              </h3>
              <p className="text-xs text-slate-400">
                Chronological record of every ultrasonic anomaly, arrival time, and GenAI client dispatch
              </p>
            </div>

            {onNavigateToClientMessages && (
              <button
                onClick={onNavigateToClientMessages}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Open Full Client Dispatch Center →
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Arrival Timestamp</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Distance & Delta</th>
                  <th className="py-2.5 px-3">GenAI Alert Message</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.slice(0, 5).map((a) => {
                  const isIntrusion = a.event_type === 'INTRUSION';
                  const arrivalTime = new Date(a.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const arrivalDate = new Date(a.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-cyan-300">{arrivalTime}</div>
                        <div className="text-[10px] text-slate-500">{arrivalDate}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            isIntrusion
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {a.event_type} ({(a.confidence * 100).toFixed(0)}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-white font-bold">{a.distance_cm.toFixed(1)} cm</div>
                        <div className="text-[10px] text-slate-400">Δ {Math.abs(a.previous_distance_cm - a.distance_cm).toFixed(1)} cm</div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-300 font-sans max-w-md truncate">
                        {a.genai_message}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleQuickDispatch(a)}
                          className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] transition-all"
                          title="Send as message to client"
                        >
                          Send to Client
                        </button>
                        <button
                          onClick={() => onOpenAlertDetails(a)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
