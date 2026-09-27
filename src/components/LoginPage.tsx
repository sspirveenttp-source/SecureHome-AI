import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Radio,
  Cpu,
  Wifi,
  Activity,
  Layers,
} from 'lucide-react';
import { User } from '../types/index.ts';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('kit28.24bcs115@gmail.com');
  const [password, setPassword] = useState<string>('password123');
  const [name, setName] = useState<string>('Project Lead Engineer');
  const [role, setRole] = useState<string>('Security Administrator');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background animated cyber sonar & neural IoT particle network effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes representing IoT sensors & neural vertices
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulseSpeed: number;
      color: string;
    }

    const nodeCount = Math.floor((width * height) / 18000) + 35;
    const nodes: Node[] = [];
    const colors = ['#06b6d4', '#3b82f6', '#6366f1', '#10b981'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Concentric ultrasonic sonar wave rings expanding from center
    interface SonarRing {
      radius: number;
      maxRadius: number;
      alpha: number;
      speed: number;
    }

    const sonarRings: SonarRing[] = [
      { radius: 20, maxRadius: Math.max(width, height) * 0.8, alpha: 0.4, speed: 0.9 },
      { radius: 180, maxRadius: Math.max(width, height) * 0.8, alpha: 0.3, speed: 0.9 },
      { radius: 340, maxRadius: Math.max(width, height) * 0.8, alpha: 0.2, speed: 0.9 },
      { radius: 500, maxRadius: Math.max(width, height) * 0.8, alpha: 0.15, speed: 0.9 },
    ];

    let angleSweep = 0;

    const render = () => {
      // Clear with dark cyber gradient trail
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw expanding ultrasonic sonar wave circles
      for (const ring of sonarRings) {
        ring.radius += ring.speed;
        if (ring.radius > ring.maxRadius) {
          ring.radius = 10;
        }

        const currentAlpha = (1 - ring.radius / ring.maxRadius) * 0.18;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${currentAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 2. Draw sweeping radar beam
      angleSweep += 0.007;
      const sweepLength = Math.max(width, height) * 0.65;
      const sweepGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        sweepLength
      );
      sweepGradient.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      sweepGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, sweepLength, angleSweep - 0.25, angleSweep);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();

      // 3. Update and draw nodes & interconnecting network lines
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        n.alpha += n.pulseSpeed;
        const currentAlpha = 0.3 + Math.sin(n.alpha) * 0.3;

        // Draw node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            const lineAlpha = (1 - dist / 110) * 0.15;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { email, password, name, role }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      localStorage.setItem('securehome_token', data.token);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden select-none">
      {/* Dynamic Animated Cyber Sonar & Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Futuristic Grid Overlay with Radial Vignette */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(2, 6, 23, 0.85) 90%)',
        }}
      />

      {/* Ambient glowing energy orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Main Luxury Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/80 border border-slate-800/90 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden z-10 transition-all duration-300 hover:border-cyan-500/40 glow-cyan">
        {/* Top Header with Luxury Emblem Logo */}
        <div className="pt-8 pb-6 px-6 md:px-8 border-b border-slate-800/70 bg-gradient-to-b from-slate-900/90 to-slate-950/70 text-center relative">
          {/* Glowing Aura behind Logo */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 rounded-full blur-2xl pointer-events-none" />

          {/* Premium Architectural Shield Logo */}
          <div className="relative mx-auto w-20 h-20 mb-3 flex items-center justify-center">
            {/* Outer Rotating Segmented Holographic Halo */}
            <div className="absolute inset-0 rounded-2xl border border-cyan-500/40 animate-pulse pointer-events-none" />
            <div className="absolute -inset-1 rounded-2xl border-2 border-dashed border-cyan-400/20 pointer-events-none animate-spin" style={{ animationDuration: '28s' }} />

            {/* Inner Metallic Beveled Crest */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-[1.5px] shadow-2xl shadow-cyan-500/30 border border-cyan-400/50 flex items-center justify-center overflow-hidden">
              {/* Glass Specular Glint */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-white/10 rounded-full blur-md" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-transparent to-blue-600/20" />

              {/* Central Custom Ultrasonic & Neural Shield Emblem */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Custom SVG Defense Shield Icon with Ultrasonic Acoustic Rings */}
                <svg
                  viewBox="0 0 48 48"
                  className="w-9 h-9 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Shield Outline */}
                  <path
                    d="M24 4L7 11V22C7 33.2 14.3 43.1 24 46C33.7 43.1 41 33.2 41 22V11L24 4Z"
                    stroke="url(#shieldGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Inner Acoustic Ultrasonic Wave Arc 1 */}
                  <path
                    d="M17 21C17 17.134 20.134 14 24 14C27.866 14 31 17.134 31 21"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Inner Acoustic Ultrasonic Wave Arc 2 */}
                  <path
                    d="M20 23C20 20.7909 21.7909 19 24 19C26.2091 19 28 20.7909 28 23"
                    stroke="#22d3ee"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* Central AI Micro-Core (Transducer Eye) */}
                  <circle cx="24" cy="26" r="3" fill="#06b6d4" />
                  <circle cx="24" cy="26" r="5" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                  {/* Baseline Target Line */}
                  <path d="M16 33L24 35L32 33" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />

                  <defs>
                    <linearGradient id="shieldGrad" x1="7" y1="4" x2="41" y2="46" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#38bdf8" />
                      <stop offset="0.5" stopColor="#06b6d4" />
                      <stop offset="1" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Luxury Brand Title Typography */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <h1 className="text-2xl font-extrabold text-white tracking-wider font-mono">
              SECUREHOME
            </h1>
            <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/30">
              AI
            </span>
          </div>

          <p className="text-[11px] font-mono text-cyan-400/90 tracking-widest uppercase mt-1">
            IoT Perimeter Defense • DNN Intrusion Engine
          </p>

          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>ENCRYPTED OPERATOR PORTAL</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Operator Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Operator Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@securehome.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Access Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>{loading ? 'AUTHENTICATING ENCLAVE...' : isRegister ? 'REGISTER NEW OPERATOR' : 'AUTHORIZE & ENTER'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {isRegister
                ? 'Already have credentials? Sign in to Command Center'
                : 'Need to register a new operator account? Click here'}
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span>HC-SR04 & ESP8266 REST INGESTION</span>
          </div>
          <span>TLS 1.3 / AES-256</span>
        </div>
      </div>
    </div>
  );
};
