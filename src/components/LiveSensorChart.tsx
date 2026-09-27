import React, { useMemo } from 'react';
import { SensorReading } from '../types/index.ts';

interface LiveSensorChartProps {
  readings: SensorReading[];
  timeRange: string;
  setTimeRange: (range: string) => void;
  intrusionThreshold?: number; // e.g. 35 cm
  suspiciousThreshold?: number; // e.g. 60 cm
  height?: number;
}

export const LiveSensorChart: React.FC<LiveSensorChartProps> = ({
  readings,
  timeRange,
  setTimeRange,
  intrusionThreshold = 35,
  suspiciousThreshold = 60,
  height = 240,
}) => {
  const ranges = [
    { id: '1m', label: '1 Min' },
    { id: '5m', label: '5 Min' },
    { id: '30m', label: '30 Min' },
    { id: 'today', label: 'Today' },
    { id: 'all', label: 'Live' },
  ];

  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return [];
    // Take at most last 50 points for optimal rendering clarity
    return readings.slice(-50);
  }, [readings]);

  // Compute SVG dimensions and paths
  const width = 800;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Scale Y: 0cm to 160cm (standard hallway / doorway ultrasonic coverage)
  const maxY = 140;
  const minY = 0;

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padding.top + graphHeight - ((clamped - minY) / (maxY - minY)) * graphHeight;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (total - 1)) * graphWidth;
  };

  const linePath = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, curr, idx) => {
      const x = getX(idx, chartData.length);
      const y = getY(curr.distance_cm);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [chartData]);

  const areaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    const firstX = getX(0, chartData.length);
    const lastX = getX(chartData.length - 1, chartData.length);
    const bottomY = getY(0);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, chartData]);

  const latestReading = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  return (
    <div className="flex flex-col p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white">Distance vs Time</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 rounded">
              HC-SR04 Echo
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time ultrasonic proximity waveform (centimeters)
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeRange === r.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Area gradient */}
            <linearGradient id="distGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Threshold zones */}
            <linearGradient id="dangerZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines and labels */}
          {[120, 90, 60, 35, 0].map((yVal) => {
            const yPos = getY(yVal);
            return (
              <g key={yVal}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={width - padding.right}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray={yVal === 35 || yVal === 60 ? '4 4' : undefined}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 4}
                  fill={yVal === 35 ? '#f87171' : yVal === 60 ? '#fbbf24' : '#64748b'}
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {yVal}cm
                </text>
              </g>
            );
          })}

          {/* Danger zone threshold label */}
          <text
            x={width - padding.right}
            y={getY(intrusionThreshold) - 5}
            fill="#ef4444"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            Intrusion Threshold ({intrusionThreshold}cm)
          </text>

          {/* Suspicious warning threshold */}
          <text
            x={width - padding.right}
            y={getY(suspiciousThreshold) - 5}
            fill="#f59e0b"
            fontSize="9"
            fontFamily="JetBrains Mono"
            textAnchor="end"
          >
            Warning Limit ({suspiciousThreshold}cm)
          </text>

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#distGradient)" />}

          {/* Line waveform */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {chartData.map((d, idx) => {
            const x = getX(idx, chartData.length);
            const y = getY(d.distance_cm);
            const isDanger = d.distance_cm <= intrusionThreshold;
            const isWarning = !isDanger && d.distance_cm <= suspiciousThreshold;

            return (
              <circle
                key={d.id || idx}
                cx={x}
                cy={y}
                r={idx === chartData.length - 1 ? 5 : isDanger ? 3.5 : 2}
                fill={isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#06b6d4'}
                stroke="#030712"
                strokeWidth="1.5"
                className={idx === chartData.length - 1 ? 'animate-pulse' : ''}
              />
            );
          })}

          {/* Time axis ticks */}
          {chartData.length > 0 && (
            <>
              <text
                x={padding.left}
                y={height - 10}
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono"
              >
                {new Date(chartData[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </text>
              <text
                x={width - padding.right}
                y={height - 10}
                fill="#06b6d4"
                fontSize="10"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {new Date(chartData[chartData.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (NOW)
              </text>
            </>
          )}
        </svg>

        {/* Live reading overlay pill */}
        {latestReading && (
          <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 font-mono text-xs">
            <span className="text-slate-400">Current:</span>
            <span
              className={`font-bold text-sm ${
                latestReading.distance_cm <= intrusionThreshold
                  ? 'text-red-400 animate-pulse'
                  : latestReading.distance_cm <= suspiciousThreshold
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              {latestReading.distance_cm.toFixed(1)} cm
            </span>
          </div>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400 rounded" />
            <span>Echo Reading</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400 rounded" />
            <span>Suspicious Zone (&lt;{suspiciousThreshold}cm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-red-400 rounded" />
            <span>Intrusion Zone (&lt;{intrusionThreshold}cm)</span>
          </div>
        </div>
        <div className="text-slate-500">
          Showing {chartData.length} samples
        </div>
      </div>
    </div>
  );
};
