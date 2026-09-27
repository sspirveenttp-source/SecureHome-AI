import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Volume2,
  VolumeX,
  Play,
  Radio,
  Menu,
  Activity,
  Cpu,
  Wifi,
  LogOut,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react';
import { SystemStatusResponse, User } from '../types/index.ts';

interface NavbarProps {
  status: SystemStatusResponse | null;
  onOpenDemo: () => void;
  onToggleArm: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleSidebar: () => void;
  activeTab: string;
  user: User | null;
  onLogout: () => void;
  onOpenClientMessages: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  onOpenDemo,
  onToggleArm,
  soundEnabled,
  onToggleSound,
  onToggleSidebar,
  user,
  onLogout,
  onOpenClientMessages,
}) => {
  const secStatus = status?.security_status || 'NORMAL';
  const isArmed = status?.system_armed ?? true;
  const isLiveDevice = status?.active_mode === 'LIVE DEVICE MODE';


  const getStatusBadge = () => {
    switch (secStatus) {
      case 'INTRUSION':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 font-semibold text-xs tracking-wider uppercase animate-pulse glow-red">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>INTRUSION DETECTED</span>
          </div>
        );
      case 'SUSPICIOUS':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-semibold text-xs tracking-wider uppercase glow-amber">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>SUSPICIOUS ACTIVITY</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold text-xs tracking-wider uppercase glow-emerald">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>NORMAL MONITORING</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-400 rounded-lg lg:hidden hover:text-white hover:bg-slate-800"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-[1.5px] border border-cyan-400/50 shadow-lg shadow-cyan-500/25">
            <svg
              viewBox="0 0 48 48"
              className="w-5 h-5 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 4L7 11V22C7 33.2 14.3 43.1 24 46C33.7 43.1 41 33.2 41 22V11L24 4Z"
                stroke="url(#navShieldGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 21C17 17.134 20.134 14 24 14C27.866 14 31 17.134 31 21"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.85"
              />
              <circle cx="24" cy="26" r="3" fill="#06b6d4" />
              <defs>
                <linearGradient id="navShieldGrad" x1="7" y1="4" x2="41" y2="46" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wide text-white font-mono">
                SECUREHOME
              </span>
              <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-sm shadow-cyan-500/20">
                AI
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 hidden sm:inline-block">
                ESP8266•DNN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs md:max-w-md">
              HC-SR04 & ESP8266 Intrusion Defense & GenAI Alerts
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Security Status Badge */}
        <div className="hidden sm:block">
          {getStatusBadge()}
        </div>

        {/* Operating Mode Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
            isLiveDevice
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
          }`}
          title={isLiveDevice ? 'Connected to physical ESP8266 + HC-SR04 hardware' : 'Running on virtual IoT Simulator'}
        >
          {isLiveDevice ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          ) : (
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          )}
          <span className="hidden md:inline font-semibold">
            {isLiveDevice ? 'LIVE DEVICE MODE' : 'SIMULATION MODE'}
          </span>
          <span className="md:hidden font-semibold">
            {isLiveDevice ? 'LIVE' : 'SIM'}
          </span>
        </div>

        {/* Live Presentation Demo Button */}
        <button
          onClick={onOpenDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-sm shadow-cyan-500/25 transition-all active:scale-95"
          title="Launch Guided Viva / Project Demonstration"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline font-mono">LIVE DEMO</span>
          <span className="sm:hidden font-mono">DEMO</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border text-xs transition-colors ${
            soundEnabled
              ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Security Alarm Audio Active' : 'Alarm Audio Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Arm / Disarm Toggle */}
        <button
          onClick={onToggleArm}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
            isArmed
              ? 'bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
          title={isArmed ? 'Click to Disarm System' : 'Click to Arm System'}
        >
          <span className={`w-2 h-2 rounded-full ${isArmed ? 'bg-red-400 animate-ping' : 'bg-slate-500'}`} />
          <span>{isArmed ? 'ARMED' : 'DISARMED'}</span>
        </button>

        {/* User Profile & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden lg:flex flex-col text-right font-mono text-[11px] leading-tight">
              <span className="font-bold text-white truncate max-w-[120px]">{user.name}</span>
              <span className="text-[9px] text-cyan-400 truncate">{user.role}</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 p-2 rounded-lg bg-slate-800/80 hover:bg-red-950/60 hover:text-red-400 text-slate-400 border border-slate-700/60 transition-colors text-xs font-mono"
              title={`Logged in as ${user.email} (${user.role}). Click to Logout.`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
