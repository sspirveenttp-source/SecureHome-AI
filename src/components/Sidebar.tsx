import React from 'react';
import {
  LayoutDashboard,
  Radar,
  BrainCircuit,
  BotMessageSquare,
  History,
  BellRing,
  Cpu,
  Server,
  BarChart3,
  Network,
  Settings,
  X,
  Radio,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  unreadAlertCount: number;
  simulatorActive: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  unreadAlertCount,
  simulatorActive,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'System overview & security status',
    },
    {
      id: 'live-monitor',
      label: 'Live IoT Monitor',
      icon: Radar,
      badge: 'LIVE',
      description: 'Ultrasonic sonar & signal scope',
    },
    {
      id: 'dnn-detection',
      label: 'DNN AI Detection',
      icon: BrainCircuit,
      badge: 'AI',
      description: 'Neural classifier & feature vector',
    },
    {
      id: 'genai-assistant',
      label: 'GenAI Assistant',
      icon: BotMessageSquare,
      badge: 'LLM',
      description: 'Context-aware intelligence & chat',
    },
    {
      id: 'sensor-history',
      label: 'Sensor History',
      icon: History,
      badge: null,
      description: 'Telemetry logs & time-series',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: BellRing,
      badge: unreadAlertCount > 0 ? `${unreadAlertCount}` : null,
      badgeColor: 'bg-red-500 text-white',
      description: 'Security incidents & dispatches',
    },
    {
      id: 'client-messages',
      label: 'Client Dispatch',
      icon: MessageSquare,
      badge: 'SMS/EMAIL',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      description: 'Alert records & client messaging',
    },
    {
      id: 'simulator',
      label: 'IoT Simulator',
      icon: Cpu,
      badge: simulatorActive ? 'ACTIVE' : 'OFF',
      badgeColor: simulatorActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400',
      description: 'Virtual ESP8266 testbed generator',
    },
    {
      id: 'devices',
      label: 'Device Management',
      icon: Server,
      badge: null,
      description: 'ESP8266 nodes & firmware sketch',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      description: 'Accuracy metrics & trends',
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      icon: Network,
      badge: 'DOCS',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
      description: 'Hardware pipeline & viva guide',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
      description: 'Thresholds & calibration',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header in sidebar */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="font-bold text-white font-mono">SecureHome AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Command Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold tracking-wide truncate">
                      {item.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        item.badgeColor || (isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-400')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Hardware Spec Footer */}
        <div className="p-3 m-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>ESP8266 + HC-SR04</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-[10px] text-slate-500 leading-relaxed">
            REST API: <code className="text-cyan-400">/api/sensor-data</code>
          </div>
          <div className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
            Range: 2 - 400 cm | 40 kHz Sound
          </div>
        </div>
      </aside>
    </>
  );
};
