import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  BotMessageSquare,
  Sparkles,
  ArrowRight,
  Shield,
  Radio,
} from 'lucide-react';
import { soundEffects } from '../utils/audioAlert.ts';

interface LiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunStep: (step: number) => Promise<any>;
}

export const LiveDemoModal: React.FC<LiveDemoModalProps> = ({
  isOpen,
  onClose,
  onRunStep,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepLogs, setStepLogs] = useState<string[]>([]);

  const demoSteps = [
    {
      step: 1,
      title: 'Baseline Calibration (Ambient Space)',
      statusLabel: 'NORMAL (82.5 cm)',
      desc: 'HC-SR04 measures the empty doorway corridor baseline. Ultrasonic echo returns at 40kHz, time-of-flight confirms nominal 82.5 cm distance.',
      color: 'emerald',
    },
    {
      step: 2,
      title: 'Movement Detected (Approach)',
      statusLabel: 'APPROACH (65.0 cm)',
      desc: 'An object enters the 15° ultrasonic detection cone. Distance smoothly decrements from 82.5 cm to 65.0 cm. System transitions from idle to active tracking.',
      color: 'blue',
    },
    {
      step: 3,
      title: 'Suspicious Activity (Loitering & Erratic Jumps)',
      statusLabel: 'SUSPICIOUS (46.0 cm)',
      desc: 'The obstacle oscillates erratically between 40-60 cm with 3 rapid delta changes. DNN feature extractor computes high variance, triggering SUSPICIOUS advisory.',
      color: 'amber',
    },
    {
      step: 4,
      title: 'Intrusion Classification (Critical Breach)',
      statusLabel: 'INTRUSION (18.2 cm)',
      desc: 'Rapid boundary penetration below 25 cm threshold. High approach velocity flags critical intrusion with 95.8% DNN confidence score.',
      color: 'red',
    },
    {
      step: 5,
      title: 'GenAI Dispatch & Security Alert',
      statusLabel: 'GENAI ACTIVE',
      desc: 'Gemini AI digests the raw telemetry and DNN classification to synthesize a professional natural-language security alert with suggested countermeasures.',
      color: 'purple',
    },
    {
      step: 6,
      title: 'Real-Time Dashboard & Alarm Trigger',
      statusLabel: 'DEFENSE ENGAGED',
      desc: 'System broadcasts high-priority dispatch, activates perimeter siren chime, and pins incident to the sensor history ledger.',
      color: 'cyan',
    },
  ];

  const handleStepClick = async (stepNum: number) => {
    setCurrentStep(stepNum);
    if (stepNum === 1) soundEffects.playNormalPing();
    if (stepNum === 3) soundEffects.playSuspiciousPing();
    if (stepNum === 4 || stepNum === 6) soundEffects.playIntrusionAlarm();

    const res = await onRunStep(stepNum);
    if (res?.message) {
      setStepLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Step ${stepNum}: ${res.message}`,
        ...prev.slice(0, 5),
      ]);
    }
  };

  const handleAutoPlay = async () => {
    setIsRunning(true);
    for (let s = 1; s <= 6; s++) {
      await handleStepClick(s);
      await new Promise((r) => setTimeout(r, 2600));
    }
    setIsRunning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  LIVE DEMONSTRATION MODE
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  College Expo / Viva Runner
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step walkthrough of the HC-SR04 → ESP8266 → DNN → GenAI security pipeline
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

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-mono text-slate-300">
                Current Demonstration Stage:
              </div>
              <div className="text-sm font-bold text-cyan-300 font-mono">
                Stage {currentStep} of 6 — {demoSteps[currentStep - 1].title}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={isRunning}
                onClick={handleAutoPlay}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isRunning ? 'RUNNING AUTOMATION...' : 'PLAY FULL SEQUENCE'}</span>
              </button>

              <button
                onClick={() => handleStepClick(1)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
              </button>
            </div>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {demoSteps.map((item) => {
              const isActive = currentStep === item.step;
              const isPast = currentStep > item.step;

              return (
                <div
                  key={item.step}
                  onClick={() => !isRunning && handleStepClick(item.step)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/10'
                      : isPast
                      ? 'bg-slate-950/60 border-slate-800 opacity-80 hover:opacity-100'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-xs font-mono font-bold text-slate-200">
                      {isPast ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : item.step}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        item.color === 'red'
                          ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                          : item.color === 'amber'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : item.color === 'purple'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white font-mono mb-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Recent execution feedback */}
          {stepLogs.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                Telemetry Log Output:
              </div>
              {stepLogs.map((log, i) => (
                <div key={i} className="text-cyan-300 truncate">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/70 text-xs font-mono">
          <span className="text-slate-400">
            ESP8266 REST API Integration: <code className="text-cyan-400">POST /api/sensor-data</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Presentation
          </button>
        </div>
      </div>
    </div>
  );
};
