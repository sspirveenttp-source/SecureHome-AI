import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Smartphone,
  Mail,
  BellRing,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  BotMessageSquare,
  ExternalLink,
  Sliders,
  Check,
  Phone,
  AlertTriangle,
  History,
} from 'lucide-react';
import { ClientMessage, ClientSettings, SecurityEvent } from '../types/index.ts';
import { soundEffects } from '../utils/audioAlert.ts';

interface ClientMessagesViewProps {
  alerts: SecurityEvent[];
  onOpenAlertDetails: (alert: SecurityEvent) => void;
}

export const ClientMessagesView: React.FC<ClientMessagesViewProps> = ({
  alerts,
  onOpenAlertDetails,
}) => {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [settings, setSettings] = useState<ClientSettings>({
    client_name: 'Property Owner / Client',
    client_email: 'kit28.24bcs115@gmail.com',
    client_phone: '+1 (555) 782-9012',
    auto_dispatch_sms: true,
    auto_dispatch_email: true,
    auto_dispatch_push: true,
    min_severity_to_dispatch: 'MEDIUM',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [customMsg, setCustomMsg] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('🚨 Emergency Security Dispatch: Immediate Verification Needed');
  const [selectedChannel, setSelectedChannel] = useState<'SMS' | 'EMAIL' | 'PUSH' | 'GATEWAY'>('SMS');
  const [sending, setSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const fetchClientData = async () => {
    try {
      const [resMsgs, resSettings] = await Promise.all([
        fetch('/api/client-messages').then((r) => r.json()),
        fetch('/api/client-settings').then((r) => r.json()),
      ]);
      setMessages(resMsgs.messages || []);
      if (resSettings && resSettings.client_email) {
        setSettings(resSettings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
    const interval = setInterval(fetchClientData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSendManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/client-messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: settings.client_name,
          client_email: settings.client_email,
          client_phone: settings.client_phone,
          channel: selectedChannel,
          subject: customSubject,
          message: customMsg,
          severity: 'HIGH',
          event_type: 'INTRUSION',
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        soundEffects.playSuspiciousPing();
        setSendSuccess(`Dispatched via ${selectedChannel} to ${settings.client_phone} & ${settings.client_email}!`);
        setCustomMsg('');
        await fetchClientData();
        setTimeout(() => setSendSuccess(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDispatchAlertRecord = async (alert: SecurityEvent, channel: 'SMS' | 'EMAIL') => {
    try {
      const res = await fetch('/api/client-messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: settings.client_name,
          client_email: settings.client_email,
          client_phone: settings.client_phone,
          channel: channel,
          subject: `${alert.event_type === 'INTRUSION' ? '🚨 INTRUSION ALERT' : '⚠️ ADVISORY NOTICE'}: ${alert.location}`,
          message: alert.genai_message,
          alert_id: alert.id,
          severity: alert.severity,
          event_type: alert.event_type,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        soundEffects.playSuspiciousPing();
        setSendSuccess(`Alert ${alert.id} dispatched to client via ${channel}!`);
        await fetchClientData();
        setTimeout(() => setSendSuccess(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/client-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSendSuccess('Client contact settings updated!');
      setTimeout(() => setSendSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const latestMessage = messages[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            DNN Alert Records & Client Message Dispatch Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit log of alert timestamps, GenAI record synthesis, and client SMS / Email notification gateway
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sendSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{sendSuccess}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Alert Records Table on Left, Smartphone & Dispatch Console on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recorded Alerts & Timestamps (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Detailed Timestamped Alert Records */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Recorded Alerts & Incident Timestamps</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {alerts.length} Total Incidents Logged
              </span>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 10).map((alt) => {
                const isIntrusion = alt.event_type === 'INTRUSION';
                const alertDate = new Date(alt.timestamp);
                const exactTime = alertDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                const exactDate = alertDate.toLocaleDateString([], {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={alt.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isIntrusion
                        ? 'bg-slate-950/80 border-red-500/40 hover:border-red-500/80'
                        : 'bg-slate-950/80 border-amber-500/40 hover:border-amber-500/80'
                    }`}
                  >
                    {/* Timestamp & Badges Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            isIntrusion
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {alt.event_type}
                        </span>
                        <span className="text-slate-400">
                          {alt.location}
                        </span>
                      </div>

                      {/* Precise Alert Arrival Time */}
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{exactDate} at {exactTime}</span>
                      </div>
                    </div>

                    {/* GenAI Message Record Preview */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed mb-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 mb-1 font-bold">
                        <BotMessageSquare className="w-3.5 h-3.5" />
                        <span>GENAI SYNTHESIZED RECORD MESSAGE:</span>
                      </div>
                      "{alt.genai_message}"
                    </div>

                    {/* Sensor Telemetry Stats & Quick Dispatch to Client */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>Distance: <b className="text-white">{alt.distance_cm.toFixed(1)} cm</b></span>
                        <span>Confidence: <b className="text-cyan-400">{(alt.confidence * 100).toFixed(1)}%</b></span>
                        <span>Status: <b className={alt.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}>{alt.status}</b></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDispatchAlertRecord(alt, 'SMS')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 border border-slate-700 transition-colors"
                          title="Dispatch GenAI alert message to client phone via SMS"
                        >
                          <Smartphone className="w-3 h-3 text-cyan-400" />
                          <span>Send SMS</span>
                        </button>

                        <button
                          onClick={() => handleDispatchAlertRecord(alt, 'EMAIL')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-purple-300 border border-slate-700 transition-colors"
                          title="Dispatch GenAI alert message to client email"
                        >
                          <Mail className="w-3 h-3 text-purple-400" />
                          <span>Send Email</span>
                        </button>

                        <button
                          onClick={() => onOpenAlertDetails(alt)}
                          className="text-slate-400 hover:text-white text-[11px] underline ml-1"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {alerts.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  No alerts recorded yet. Trigger the IoT simulator or live demo to generate incidents.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Dispatched Messages History */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                <History className="w-4 h-4 text-purple-400" />
                <span>Client Message Dispatch History</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {messages.length} Messages Delivered
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto font-mono text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 truncate flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{msg.subject}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        {msg.channel} • {msg.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate font-sans">
                      {msg.message}
                    </p>
                    <div className="text-[10px] text-slate-500">
                      To: {msg.client_phone} ({msg.client_email}) • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mobile Smartphone Lockscreen Simulation & Custom Dispatch Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Smartphone Lockscreen Preview */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                <Smartphone className="w-4 h-4" />
                <span>Client Mobile Device Preview</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                SMS / PUSH SIMULATOR
              </span>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="w-full max-w-sm mx-auto p-4 rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl relative">
              {/* Phone Speaker Notch */}
              <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto mb-3" />

              {/* Lockscreen Time */}
              <div className="text-center font-mono text-slate-400 mb-4">
                <div className="text-2xl font-bold text-white">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Notification Banner received by client */}
              {latestMessage ? (
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-red-500/50 shadow-lg text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>SecureHome AI Dispatch</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">Just now</span>
                  </div>

                  <div className="font-bold text-white text-xs">
                    {latestMessage.subject}
                  </div>

                  <p className="text-[11px] text-slate-200 font-sans leading-relaxed">
                    {latestMessage.message}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => alert(`Client dialed Emergency Services for incident: ${latestMessage.id}`)}
                      className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold transition-all text-center"
                    >
                      Call Police
                    </button>
                    <button
                      onClick={() => {
                        soundEffects.playIntrusionAlarm();
                        alert('Homeowner triggered remote 110dB perimeter siren!');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[10px] font-bold transition-all text-center"
                    >
                      Sound Siren
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 text-center text-slate-500 font-mono text-xs">
                  No active notifications on client handset.
                </div>
              )}

              {/* Client device status footer */}
              <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>SIM: 5G Ultra • Verizon</span>
                <span>Recipient: {settings.client_phone}</span>
              </div>
            </div>
          </div>

          {/* Manual GenAI Client Dispatch Form */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                Dispatch Custom Security Message to Client
              </h3>
            </div>

            <form onSubmit={handleSendManual} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Dispatch Channel:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SMS', 'EMAIL', 'GATEWAY'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSelectedChannel(ch)}
                      className={`py-1.5 rounded-lg border text-center font-bold transition-all ${
                        selectedChannel === ch
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subject Header:</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Message Content (GenAI Dispatch):</label>
                <textarea
                  rows={3}
                  required
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder="Enter custom advisory or dispatch notice to send to the homeowner..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={sending || !customMsg.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'DISPATCHING TO CLIENT...' : 'DISPATCH MESSAGE TO CLIENT'}</span>
              </button>
            </form>
          </div>

          {/* Client Contact Settings */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Client Dispatch Target Configuration
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Client Name</label>
                <input
                  type="text"
                  value={settings.client_name}
                  onChange={(e) => setSettings({ ...settings, client_name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Client Email (Default)</label>
                <input
                  type="email"
                  value={settings.client_email}
                  onChange={(e) => setSettings({ ...settings, client_email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Client Phone (SMS Gateway)</label>
                <input
                  type="text"
                  value={settings.client_phone}
                  onChange={(e) => setSettings({ ...settings, client_phone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors font-semibold"
                >
                  Save Client Contact Info
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
