import React from 'react';

interface SonarRadarProps {
  currentDistance: number;
  securityStatus: string;
  deviceId: string;
  isSimulated: boolean;
}

export const SonarRadar: React.FC<SonarRadarProps> = ({
  currentDistance,
  securityStatus,
  deviceId,
  isSimulated,
}) => {
  // Ultrasonic HC-SR04 cone representation
  const maxRange = 120; // 120 cm display boundary
  const normalizedDist = Math.min(maxRange, Math.max(5, currentDistance));
  const distPercent = (normalizedDist / maxRange) * 100;

  const isIntrusion = securityStatus === 'INTRUSION';
  const isSuspicious = securityStatus === 'SUSPICIOUS';

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Header telemetry info */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-4 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-white font-semibold">HC-SR04 Ultrasonic Sonar</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Angle: ±15° | 40kHz</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300">
            {isSimulated ? 'VIRTUAL SENSOR' : 'HARDWARE SENSOR'}
          </span>
        </div>
      </div>

      {/* Radar screen container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Radar Rings */}
        <div className="absolute w-full h-full rounded-full border border-cyan-500/20" />
        <div className="absolute w-3/4 h-3/4 rounded-full border border-cyan-500/15" />
        <div className="absolute w-1/2 h-1/2 rounded-full border border-cyan-500/25" />
        <div className="absolute w-1/4 h-1/4 rounded-full border border-cyan-500/35" />

        {/* Distance markers on rings */}
        <span className="absolute top-2 text-[10px] font-mono text-cyan-500/60">120cm</span>
        <span className="absolute top-10 text-[10px] font-mono text-cyan-500/50">90cm</span>
        <span className="absolute top-20 text-[10px] font-mono text-cyan-500/50">60cm</span>
        <span className="absolute top-28 text-[10px] font-mono text-cyan-500/70">30cm</span>

        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-cyan-500/15" />
        <div className="absolute h-full w-[1px] bg-cyan-500/15" />

        {/* Diagonal sector lines (15° ultrasonic aperture) */}
        <div className="absolute w-full h-[1px] bg-cyan-500/20 rotate-45" />
        <div className="absolute w-full h-[1px] bg-cyan-500/20 -rotate-45" />

        {/* Radar beam sweep */}
        <div className="absolute inset-0 rounded-full overflow-hidden animate-radar pointer-events-none">
          <div className="w-1/2 h-1/2 origin-bottom-right bg-gradient-to-tr from-transparent via-cyan-500/10 to-cyan-400/30" />
        </div>

        {/* Center Transducer Node (ESP8266 + HC-SR04 transmitter & receiver) */}
        <div className="relative z-10 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" title="Trig" />
            <span className="w-2 h-2 rounded-full bg-cyan-200" title="Echo" />
          </div>
          <span className="text-[8px] font-mono text-cyan-300 font-bold mt-0.5">ESP8266</span>
        </div>

        {/* Detected Obstacle / Echo Target Ping */}
        <div
          className="absolute z-20 transition-all duration-300 pointer-events-none"
          style={{
            transform: `translateY(-${(distPercent * 1.35) - 10}px)`,
          }}
        >
          {/* Target pulse ring */}
          <div
            className={`w-7 h-7 -ml-3.5 -mt-3.5 rounded-full flex items-center justify-center ${
              isIntrusion
                ? 'bg-red-500/30 border border-red-500 animate-ping'
                : isSuspicious
                ? 'bg-amber-500/30 border border-amber-500 animate-ping'
                : 'bg-cyan-500/30 border border-cyan-500 animate-pulse'
            }`}
          />

          {/* Solid target point */}
          <div
            className={`absolute top-0 left-0 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full shadow-lg ${
              isIntrusion
                ? 'bg-red-500 shadow-red-500/80 glow-red'
                : isSuspicious
                ? 'bg-amber-400 shadow-amber-500/80 glow-amber'
                : 'bg-cyan-400 shadow-cyan-400/80 glow-cyan'
            }`}
          />

          {/* Obstacle distance tag */}
          <div className="absolute left-4 -top-3.5 whitespace-nowrap px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 font-mono text-[10px] text-white font-bold shadow-md">
            {currentDistance.toFixed(1)} cm
          </div>
        </div>
      </div>

      {/* Footer distance readout */}
      <div className="w-full mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-slate-500">Target Range: </span>
          <span
            className={`font-bold text-sm ${
              isIntrusion ? 'text-red-400' : isSuspicious ? 'text-amber-400' : 'text-cyan-400'
            }`}
          >
            {currentDistance.toFixed(1)} cm
          </span>
        </div>

        <div className="text-right">
          <span className="text-slate-500">Calculated Time-of-Flight: </span>
          <span className="text-slate-300 font-bold">
            {((currentDistance * 2) / 0.0343).toFixed(0)} µs
          </span>
        </div>
      </div>
    </div>
  );
};
