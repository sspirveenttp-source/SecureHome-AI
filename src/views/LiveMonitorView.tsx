import React from 'react';
import {
  Radar,
  Activity,
  Cpu,
  Wifi,
  Terminal,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';
import { SystemStatusResponse, SensorReading } from '../types/index.ts';
import { SonarRadar } from '../components/SonarRadar.tsx';

interface LiveMonitorViewProps {
  status: SystemStatusResponse | null;
  readings: SensorReading[];
}

export const LiveMonitorView: React.FC<LiveMonitorViewProps> = ({
  status,
  readings,
}) => {
  const currentDist = status?.live_sensor.current_distance ?? 82.0;
  const isSimulated = status?.active_mode === 'SIMULATION MODE';
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  // HC-SR04 Physics calculations:
  // Speed of sound c = 343 m/s = 0.0343 cm/µs
  // duration (µs) = (distance_cm * 2) / 0.0343
  const echoDurationUs = Math.round((currentDist * 2) / 0.0343);
  const echoDutyPercent = Math.min(90, Math.max(10, (echoDurationUs / 23320) * 100));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Radar className="w-5 h-5 text-cyan-400" />
            Live IoT Sonar & Hardware Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ultrasonic acoustic time-of-flight measurements and raw ESP8266 telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-semibold">40kHz TRANSDUCER ACTIVE</span>
        </div>
      </div>

      {/* Grid: Sonar Radar on Left, Waveform & Physics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sonar Radar Card (5 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-5">
          <SonarRadar
            currentDistance={currentDist}
            securityStatus={status?.security_status || 'NORMAL'}
            deviceId={status?.active_device?.device_id || 'ESP8266-HOME-01'}
            isSimulated={isSimulated}
          />
        </div>

        {/* Oscilloscope Pulse & Hardware Details (7 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4">
          {/* Virtual Oscilloscope: HC-SR04 Trigger & Echo Pulse */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                HC-SR04 Ultrasonic Timing Oscilloscope
              </span>
              <span className="text-slate-400">Scale: 500µs / div</span>
            </div>

            {/* Scope Screen */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-4">
              {/* Channel 1: TRIG Pin */}
              <div>
                <div className="flex justify-between text-[11px] text-cyan-400 mb-1">
                  <span>CH1: TRIG Pin (GPIO 5)</span>
                  <span className="text-slate-500">10µs Burst Trigger</span>
                </div>
                <div className="h-9 w-full flex items-end bg-slate-900/80 rounded border border-slate-800 px-2 py-1">
                  <div className="flex items-end w-full h-full">
                    <div className="w-8 border-b-2 border-cyan-400" />
                    <div className="w-3 h-full border-t-2 border-l-2 border-r-2 border-cyan-400 bg-cyan-500/20" />
                    <div className="flex-1 border-b-2 border-cyan-400" />
                  </div>
                </div>
              </div>

              {/* Channel 2: ECHO Pin */}
              <div>
                <div className="flex justify-between text-[11px] text-amber-400 mb-1">
                  <span>CH2: ECHO Pin (GPIO 4)</span>
                  <span className="text-amber-300 font-bold">{echoDurationUs} µs Pulse Width</span>
                </div>
                <div className="h-10 w-full flex items-end bg-slate-900/80 rounded border border-slate-800 px-2 py-1">
                  <div className="flex items-end w-full h-full">
                    <div className="w-12 border-b-2 border-amber-400" />
                    <div
                      className="h-full border-t-2 border-l-2 border-r-2 border-amber-400 bg-amber-500/20 transition-all duration-300"
                      style={{ width: `${echoDutyPercent}%` }}
                    />
                    <div className="flex-1 border-b-2 border-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Physics Formula Breakdown */}
            <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="text-slate-400 font-bold">Acoustic Time-of-Flight Equation:</div>
              <div className="text-cyan-300">
                Distance (cm) = (Echo Time [µs] × 0.0343 cm/µs) / 2
              </div>
              <div className="text-slate-400">
                Calculation: ({echoDurationUs} µs × 0.0343) / 2 = <b className="text-white">{currentDist.toFixed(1)} cm</b>
              </div>
            </div>
          </div>

          {/* Raw JSON Ingestion Payload Viewer */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2 text-xs font-mono">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Raw ESP8266 REST API Payload (POST /api/sensor-data)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                HTTP 201 OK
              </span>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
{JSON.stringify(
  {
    device_id: status?.active_device?.device_id || 'ESP8266-HOME-01',
    sensor: 'HC-SR04',
    distance_cm: currentDist,
    delta_cm: latestReading?.delta_cm ?? 0.2,
    velocity_cms: latestReading?.velocity_cms ?? 0.0,
    timestamp: latestReading?.timestamp || new Date().toISOString(),
    protocol: 'HTTP/1.1 REST',
    wifi_rssi_dbm: status?.active_device?.wifi_rssi ?? -58,
  },
  null,
  2
)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
