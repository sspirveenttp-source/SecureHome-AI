import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Volume2,
  VolumeX,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Server,
  Bell,
  Cpu,
} from 'lucide-react';
import { SystemStatusResponse } from '../types/index.ts';

interface SettingsViewProps {
  status: SystemStatusResponse | null;
  onToggleArm: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetDemo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  status,
  onToggleArm,
  soundEnabled,
  onToggleSound,
  onResetDemo,
}) => {
  const [intrusionThreshold, setIntrusionThreshold] = useState<number>(35);
  const [suspiciousThreshold, setSuspiciousThreshold] = useState<number>(60);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const endpointUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/sensor-data` : 'http://192.168.1.100:3000/api/sensor-data';

  const copyEndpoint = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            System Configuration & Calibration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate ultrasonic proximity boundaries, defense arming states, and REST endpoints
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Parameters Saved!</span>
          </div>
        )}
      </div>

      {/* Security State & Alarm Control */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Perimeter Defense Mode & Audio Dispatch
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono">System Arm Status</div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                When armed, DNN intrusions trigger GenAI alerts and sirens.
              </p>
            </div>
            <button
              onClick={onToggleArm}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                status?.system_armed
                  ? 'bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {status?.system_armed ? 'DISARM SYSTEM' : 'ARM SYSTEM'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono">Acoustic Siren Audio</div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Web Audio synthesizer sweeps frequencies on intrusions.
              </p>
            </div>
            <button
              onClick={onToggleSound}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                soundEnabled
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ultrasonic Distance Calibration */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          HC-SR04 Proximity Threshold Calibration
        </h3>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Intrusion Critical Threshold (Trigger Alarm):</span>
              <span className="text-red-400 font-bold text-sm">{intrusionThreshold} cm</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={intrusionThreshold}
              onChange={(e) => setIntrusionThreshold(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">
              Any distance below this line triggers high-priority intrusion dispatch.
            </span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Suspicious Proximity Warning Limit:</span>
              <span className="text-amber-400 font-bold text-sm">{suspiciousThreshold} cm</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              value={suspiciousThreshold}
              onChange={(e) => setSuspiciousThreshold(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">
              Erratic oscillations below this threshold generate suspicious activity advisories.
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              SAVE CALIBRATION THRESHOLDS
            </button>
          </div>
        </div>
      </div>

      {/* REST API Ingestion URL */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Hardware Ingestion Endpoint
        </h3>
        <p className="text-xs text-slate-400 font-sans">
          Use this URL in your ESP8266 Arduino C++ firmware sketch. Sends POST JSON payloads.
        </p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
          <code className="flex-1 text-cyan-300 truncate">{endpointUrl}</code>
          <button
            onClick={copyEndpoint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>

      {/* Presentation Demo Data Reset */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Reset Presentation Demo State
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Restores initial nominal baseline data, clears alerts, and resets simulator to 82 cm.
          </p>
        </div>

        <button
          onClick={onResetDemo}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-all border border-slate-700"
        >
          RESET TO BASELINE
        </button>
      </div>
    </div>
  );
};
