import React, { useState } from 'react';
import {
  History,
  Download,
  Filter,
  Search,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Layers,
  Activity,
} from 'lucide-react';
import { SensorReading } from '../types/index.ts';

interface SensorHistoryViewProps {
  readings: SensorReading[];
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const SensorHistoryView: React.FC<SensorHistoryViewProps> = ({
  readings,
  timeRange,
  setTimeRange,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'NORMAL'>('ALL');

  const filtered = readings.filter((r) => {
    if (searchTerm && !r.device_id.toLowerCase().includes(searchTerm.toLowerCase()) && !r.distance_cm.toString().includes(searchTerm)) {
      return false;
    }
    if (filterMode === 'CRITICAL' && r.distance_cm > 35) return false;
    if (filterMode === 'NORMAL' && r.distance_cm <= 35) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Device', 'Sensor', 'Distance_CM', 'Delta_CM', 'Velocity_CMS', 'Timestamp', 'Is_Simulated'];
    const rows = filtered.map(r => [
      r.id,
      r.device_id,
      r.sensor,
      r.distance_cm,
      r.delta_cm,
      r.velocity_cms,
      r.timestamp,
      r.is_simulated ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SecureHome_Sensor_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `SecureHome_Sensor_History_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Sensor Telemetry History
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Archival log of all HC-SR04 ultrasonic echo pulses recorded by the system
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by device ID or distance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            {['all', '1m', '5m', '30m', 'today'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-1 rounded capitalize ${
                  timeRange === r ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            {(['ALL', 'CRITICAL', 'NORMAL'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-2 py-1 rounded ${
                  filterMode === m ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry Table */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Device ID</th>
              <th className="py-3 px-4">Distance (cm)</th>
              <th className="py-3 px-4">Delta (Δ)</th>
              <th className="py-3 px-4">Velocity (cm/s)</th>
              <th className="py-3 px-4">Data Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.slice(-80).reverse().map((r) => {
              const isBreach = r.distance_cm <= 35;
              const isWarning = !isBreach && r.distance_cm <= 60;

              return (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-slate-400">
                    {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-white">
                    {r.device_id}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        isBreach
                          ? 'bg-red-950 text-red-300 border border-red-500/40'
                          : isWarning
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'text-cyan-300'
                      }`}
                    >
                      {r.distance_cm.toFixed(1)} cm
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">
                    {r.delta_cm.toFixed(1)} cm
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">
                    {r.velocity_cms > 0 ? `+${r.velocity_cms.toFixed(1)}` : r.velocity_cms.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        r.is_simulated
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {r.is_simulated ? 'SIMULATOR' : 'HARDWARE ESP8266'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No sensor records found for selected query.
          </div>
        )}
      </div>
    </div>
  );
};
