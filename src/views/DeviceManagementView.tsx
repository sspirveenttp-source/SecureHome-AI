import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Wifi,
  Radio,
  Clock,
  CheckCircle2,
  XCircle,
  FileCode,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { Device } from '../types/index.ts';
import { HardwareCodeModal } from '../components/HardwareCodeModal.tsx';

export const DeviceManagementView: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            IoT Device Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical ESP8266 hardware nodes & virtual emulator peripherals registry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <FileCode className="w-4 h-4" />
            <span>GET ESP8266 ARDUINO CODE</span>
          </button>
        </div>
      </div>

      {/* Device List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((dev) => {
          const isConnected = dev.status === 'ONLINE';

          return (
            <div
              key={dev.device_id}
              className={`p-6 rounded-2xl border transition-all ${
                isConnected
                  ? 'bg-slate-900 border-slate-800 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800/80 opacity-80'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl border ${
                      dev.is_simulator
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">
                      {dev.device_id}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">{dev.device_name}</p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    isConnected
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}
                  />
                  <span>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </div>
              </div>

              {/* Specs Table */}
              <div className="space-y-2 text-xs font-mono pt-3 border-t border-slate-800/80">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Device Architecture:</span>
                  <span className="text-slate-200">{dev.device_type}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Local IP Address:</span>
                  <span className="text-cyan-400">{dev.ip_address}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Wi-Fi Signal (RSSI):</span>
                  <span className="text-slate-200">{dev.wifi_rssi} dBm</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Firmware Build:</span>
                  <span className="text-slate-300">{dev.firmware_version}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Node Location:</span>
                  <span className="text-slate-200">{dev.location}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Last Telemetry Ping:</span>
                  <span className="text-slate-300">
                    {new Date(dev.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">System Uptime:</span>
                  <span className="text-slate-300">
                    {Math.floor(dev.uptime_seconds / 60)} min {dev.uptime_seconds % 60} sec
                  </span>
                </div>
              </div>

              {/* Hardware Quick Action */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-slate-500">
                  {dev.is_simulator ? 'Virtual loopback instance' : 'Physical breadboard node'}
                </span>

                {!dev.is_simulator && (
                  <button
                    onClick={() => setShowCodeModal(true)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Flash Firmware Instructions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hardware Sketch Modal */}
      <HardwareCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </div>
  );
};
