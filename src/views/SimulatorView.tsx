import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  Square,
  Sliders,
  Radio,
  Zap,
  Activity,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SimulatorState, SimulationMode } from '../types/index.ts';

interface SimulatorViewProps {
  onRefreshStatus?: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ onRefreshStatus }) => {
  const [state, setState] = useState<SimulatorState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSimulatorState = async () => {
    try {
      const res = await fetch('/api/simulator');
      const data = await res.json();
      setState(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSimulatorState();
    const interval = setInterval(fetchSimulatorState, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const endpoint = state?.is_running ? '/api/simulator/stop' : '/api/simulator/start';
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      setState(data.state);
      onRefreshStatus?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setMode = async (mode: SimulationMode) => {
    try {
      const res = await fetch('/api/simulator/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      setState(data);
      onRefreshStatus?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomDistanceChange = async (val: number) => {
    try {
      const res = await fetch('/api/simulator/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'CUSTOM', custom_distance: val }),
      });
      const data = await res.json();
      setState(data);
      onRefreshStatus?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIntervalChange = async (ms: number) => {
    try {
      const res = await fetch('/api/simulator/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval_ms: ms }),
      });
      const data = await res.json();
      setState(data);
      onRefreshStatus?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Virtual IoT Hardware Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generates synthetic ESP8266 + HC-SR04 ultrasonic pulses and injects them directly into POST /api/sensor-data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
              state?.is_running
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${state?.is_running ? 'bg-cyan-400' : 'bg-slate-500'}`}
            />
            <span>{state?.is_running ? 'SIMULATOR RUNNING' : 'SIMULATOR PAUSED'}</span>
          </span>
        </div>
      </div>

      {/* Main Simulator Control Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        {/* Device & Start / Stop Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 gap-4">
          <div>
            <div className="text-xs font-mono text-slate-400">Emulated Hardware Node:</div>
            <div className="text-base font-bold text-white font-mono">
              Device: <span className="text-cyan-400">{state?.device_id || 'ESP8266-HOME-SIMULATOR'}</span>
            </div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              Target Ingestion API: <code className="text-slate-300">POST /api/sensor-data</code>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono mr-2">
              <div className="text-xs text-slate-500">Live Emitted Distance:</div>
              <div className="text-2xl font-extrabold text-white">
                {state?.current_distance?.toFixed(1) ?? '82.0'} <span className="text-cyan-400 text-sm">cm</span>
              </div>
            </div>

            <button
              disabled={loading}
              onClick={handleToggle}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-lg ${
                state?.is_running
                  ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white shadow-cyan-500/20'
              }`}
            >
              {state?.is_running ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>STOP SIMULATION</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>START SIMULATION</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
            Simulation Behavioral Modes:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* NORMAL */}
            <button
              onClick={() => setMode('NORMAL')}
              className={`p-4 rounded-xl border text-left font-mono transition-all ${
                state?.mode === 'NORMAL'
                  ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">NORMAL</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Baseline room depth (80-84cm) with atmospheric acoustic noise.
              </p>
            </button>

            {/* RANDOM */}
            <button
              onClick={() => setMode('RANDOM')}
              className={`p-4 rounded-xl border text-left font-mono transition-all ${
                state?.mode === 'RANDOM'
                  ? 'bg-blue-950/50 border-blue-400 text-blue-300 shadow-md shadow-blue-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">RANDOM WALK</span>
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Natural human motion wandering across the room (30cm to 120cm).
              </p>
            </button>

            {/* SUSPICIOUS */}
            <button
              onClick={() => setMode('SUSPICIOUS')}
              className={`p-4 rounded-xl border text-left font-mono transition-all ${
                state?.mode === 'SUSPICIOUS'
                  ? 'bg-amber-950/50 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">SUSPICIOUS</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Erratic oscillations hovering at boundary (40-60cm) with jitter.
              </p>
            </button>

            {/* INTRUSION */}
            <button
              onClick={() => setMode('INTRUSION')}
              className={`p-4 rounded-xl border text-left font-mono transition-all ${
                state?.mode === 'INTRUSION'
                  ? 'bg-red-950/50 border-red-400 text-red-300 shadow-md shadow-red-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">INTRUSION</span>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Rapid boundary collapse (80cm straight into 16cm critical breach).
              </p>
            </button>
          </div>
        </div>

        {/* Custom Distance Slider & Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-2">
              <span>Manual Custom Distance Slider:</span>
              <span className="text-cyan-400 font-bold text-sm">
                {state?.custom_distance?.toFixed(1) ?? '82.0'} cm
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="1"
              value={state?.custom_distance || 82}
              onChange={(e) => handleCustomDistanceChange(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>5 cm (Close)</span>
              <span>80 cm (Ambient)</span>
              <span>200 cm (Far)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-2">
              <span>Telemetry Ping Interval (Simulation Speed):</span>
              <span className="text-cyan-400 font-bold text-sm">
                {state?.interval_ms || 1200} ms ({(1000 / (state?.interval_ms || 1200)).toFixed(1)} Hz)
              </span>
            </div>
            <div className="flex gap-2">
              {[
                { ms: 500, label: 'Fast (0.5s)' },
                { ms: 1200, label: 'Normal (1.2s)' },
                { ms: 2500, label: 'Slow (2.5s)' },
              ].map((opt) => (
                <button
                  key={opt.ms}
                  onClick={() => handleIntervalChange(opt.ms)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    state?.interval_ms === opt.ms
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Transparency Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 flex items-start gap-3">
        <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-bold">Continuous Backend Loop Notice:</span> This simulator uses the exact same data pipeline as the real physical ESP8266. When your real NodeMCU is flashed and plugged into the wall, it sends readings to <code className="text-cyan-400">POST /api/sensor-data</code> and seamlessly takes over the dashboard without needing any modifications!
        </div>
      </div>
    </div>
  );
};
