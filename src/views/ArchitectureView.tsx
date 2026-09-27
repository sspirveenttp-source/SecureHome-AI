import React, { useState } from 'react';
import {
  Network,
  Cpu,
  Wifi,
  Server,
  Database,
  BrainCircuit,
  BotMessageSquare,
  LayoutDashboard,
  ArrowRight,
  ArrowDown,
  HelpCircle,
  FileCode,
  CheckCircle,
} from 'lucide-react';
import { HardwareCodeModal } from '../components/HardwareCodeModal.tsx';

export const ArchitectureView: React.FC = () => {
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const pipeline = [
    {
      step: 1,
      title: 'HC-SR04 Sensor',
      icon: Cpu,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      role: 'Hardware Data Collection',
      tech: 'Ultrasonic Piezoelectric Transducers (40 kHz)',
      desc: 'Transmits 10µs ultrasonic sonic pulse. Echo pin returns high for the duration of time-of-flight. Distance = (time × 0.0343) / 2.',
    },
    {
      step: 2,
      title: 'ESP8266 NodeMCU',
      icon: Cpu,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      role: 'Embedded Microcontroller & Wi-Fi',
      tech: 'Tensilica Xtensa L106 32-bit CPU (80/160MHz)',
      desc: 'Reads digital GPIO pin timings, computes metric distance, packages JSON payload, and handles 802.11 b/g/n Wi-Fi transmission.',
    },
    {
      step: 3,
      title: 'Wi-Fi 802.11 b/g/n',
      icon: Wifi,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      role: 'Wireless Transport Layer',
      tech: 'WPA2-PSK TCP/IP Network Stack',
      desc: 'Transmits JSON telemetry over local 2.4 GHz wireless network to the backend server with minimal round-trip latency (<15ms).',
    },
    {
      step: 4,
      title: 'REST API & Express',
      icon: Server,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      role: 'Ingestion & Validation Gateway',
      tech: 'Node.js Express / TSX Runtime',
      desc: 'Exposes POST /api/sensor-data. Enforces 2-400cm range validation, handles device heartbeats, and maintains in-memory time-series queue.',
    },
    {
      step: 5,
      title: 'Database Ring Buffer',
      icon: Database,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
      role: 'Data Persistence & Windows',
      tech: 'Time-Series Store & Rolling Ring Buffer',
      desc: 'Stores high-frequency sensor readings, enables sliding-window feature extraction, and logs classified security events for auditing.',
    },
    {
      step: 6,
      title: 'DNN AI Model',
      icon: BrainCircuit,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
      role: 'Intrusion Pattern Classification',
      tech: 'Dense(16) → Dense(8) → Softmax(3) Neural Network',
      desc: 'Extracts 9-dimensional spatial vector (distance, delta, velocity, jitter, min/max). Classifies activity into NORMAL, SUSPICIOUS, or INTRUSION.',
    },
    {
      step: 7,
      title: 'GenAI Security Engine',
      icon: BotMessageSquare,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10 border-pink-500/30',
      role: 'Context-Aware Alert Synthesis',
      tech: 'Gemini API (gemini-3.8-flash)',
      desc: 'Converts raw mathematical telemetry and neural classifications into grounded, professional natural-language security advisories.',
    },
    {
      step: 8,
      title: 'Real-Time Dashboard',
      icon: LayoutDashboard,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      role: 'Command Center & Visualization',
      tech: 'React 19, Tailwind CSS, Server-Sent Events',
      desc: 'Pushes zero-latency telemetry to client. Renders ultrasonic sonar radar, distance graphs, alert timelines, and emergency controls.',
    },
  ];

  const vivaFaqs = [
    {
      q: 'Why use an HC-SR04 ultrasonic sensor instead of a PIR passive infrared motion sensor?',
      a: 'A standard PIR sensor only detects binary binary thermal movement (1 or 0) and cannot report distance, velocity, or direction of approach. The HC-SR04 provides continuous metric distance measurements (2cm - 400cm), allowing the DNN to track velocity vectors, acceleration, and rapid distance collapse for high-accuracy intrusion classification.',
    },
    {
      q: 'How does the system ensure seamless transition between the IoT Simulator and the real physical ESP8266?',
      a: 'Both the simulator and the physical ESP8266 send identical JSON payloads to the exact same REST endpoint: `POST /api/sensor-data`. The backend validates and processes both using the exact same sliding-window feature extractor, neural network, and GenAI pipeline. Simply powering on the physical ESP8266 will immediately take over the dashboard.',
    },
    {
      q: 'What features are extracted from the ultrasonic sliding window before DNN inference?',
      a: 'The system computes a 9-dimensional feature vector: (1) Current distance, (2) Previous distance, (3) Absolute distance delta (Δ), (4) Rate of change, (5) Window minimum, (6) Window maximum, (7) Window average, (8) Rapid oscillation count (>15cm jumps), and (9) Approach velocity vector.',
    },
    {
      q: 'What is the role of GenAI (Gemini) versus the DNN?',
      a: 'The DNN acts as the high-speed quantitative classifier (running in <5ms to evaluate whether a sensor pattern represents an intrusion). GenAI acts as the qualitative cognitive dispatch engine, translating complex numerical anomalies and historical context into clear, concise, actionable natural-language advisories without hallucination.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-400" />
            System Architecture & Technical Specifications
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end data pipeline from physical transducer physics to GenAI natural-language alerts
          </p>
        </div>

        <button
          onClick={() => setShowCodeModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 transition-colors"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>View ESP8266 C++ Sketch</span>
        </button>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
          <span>End-to-End IoT & AI Security Pipeline:</span>
          <span className="text-cyan-400">8 Integrated Pipeline Stages</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipeline.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={p.step}
                className="relative p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${p.bgColor} ${p.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-bold">
                      STAGE 0{p.step}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white font-mono mb-1">{p.title}</h3>
                  <div className="text-[11px] font-mono text-cyan-400 mb-2">{p.role}</div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">{p.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                  Tech: <span className="text-slate-300">{p.tech}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Triad Core Technology Roles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold">
            <Cpu className="w-5 h-5" />
            <span>1. IoT Layer</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            <b>Collects and transmits sensor data.</b> The HC-SR04 emits 40kHz ultrasonic pulses and calculates echo time-of-flight. The ESP8266 handles Wi-Fi transport and delivers structured JSON payloads to the backend API.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-mono text-sm font-bold">
            <BrainCircuit className="w-5 h-5" />
            <span>2. DNN AI Layer</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            <b>Analyzes sensor patterns and classifies security events.</b> Extracts 9 temporal features from a sliding window and infers whether the movement is NORMAL, SUSPICIOUS, or an INTRUSION with high confidence scores.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-pink-500/30 space-y-2">
          <div className="flex items-center gap-2 text-pink-400 font-mono text-sm font-bold">
            <BotMessageSquare className="w-5 h-5" />
            <span>3. GenAI Alert Layer</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            <b>Converts detected events into natural-language advisories.</b> Gemini API parses distance drops, velocities, and model confidence to generate clear, actionable, professional alerts for the homeowner.
          </p>
        </div>
      </div>

      {/* College Project Viva / Presentation Q&A Defense */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Engineering Project Viva / Defense Preparation Guide
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
            VIVA READY
          </span>
        </div>

        <div className="space-y-3">
          {vivaFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-200 font-bold">
                <span className="text-cyan-300">Q{idx + 1}: {faq.q}</span>
                <span className="text-slate-500 text-sm ml-2">
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </div>

              {(activeFaq === idx || true) && (
                <p className="text-xs text-slate-400 font-sans mt-2 pt-2 border-t border-slate-800/60 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <HardwareCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </div>
  );
};
