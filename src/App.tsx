import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { EventDetailModal } from './components/EventDetailModal.tsx';
import { LiveDemoModal } from './components/LiveDemoModal.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { soundEffects } from './utils/audioAlert.ts';

import { DashboardView } from './views/DashboardView.tsx';
import { LiveMonitorView } from './views/LiveMonitorView.tsx';
import { DnnDetectionView } from './views/DnnDetectionView.tsx';
import { GenAiAssistantView } from './views/GenAiAssistantView.tsx';
import { SensorHistoryView } from './views/SensorHistoryView.tsx';
import { AlertsView } from './views/AlertsView.tsx';
import { SimulatorView } from './views/SimulatorView.tsx';
import { DeviceManagementView } from './views/DeviceManagementView.tsx';
import { AnalyticsView } from './views/AnalyticsView.tsx';
import { ArchitectureView } from './views/ArchitectureView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { ClientMessagesView } from './views/ClientMessagesView.tsx';

import {
  SystemStatusResponse,
  SensorReading,
  SecurityEvent,
  User,
  ClientMessage,
} from './types/index.ts';
import { Smartphone, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<SecurityEvent[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SecurityEvent | null>(null);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('all');

  // Authentication State
  const [user, setUser] = useState<User | null>(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('securehome_token');
    const savedUser = localStorage.getItem('securehome_user');
    if (savedToken && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Client Alert Dispatch Toast Banner
  const [clientToast, setClientToast] = useState<{
    subject: string;
    message: string;
    channel: string;
    time: string;
  } | null>(null);

  // Check auth session
  useEffect(() => {
    const token = localStorage.getItem('securehome_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('securehome_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          localStorage.removeItem('securehome_token');
          localStorage.removeItem('securehome_user');
          setUser(null);
        });
    }
  }, []);

  // Fetch initial telemetry state
  const fetchData = useCallback(async () => {
    try {
      const [resStatus, resReadings, resAlerts] = await Promise.all([
        fetch('/api/status').then((r) => r.json()),
        fetch(`/api/readings?range=${timeRange}&limit=100`).then((r) => r.json()),
        fetch('/api/alerts').then((r) => r.json()),
      ]);

      setStatus(resStatus);
      setReadings(resReadings.readings || []);
      setAlerts(resAlerts.alerts || []);
    } catch (e) {
      console.error('Initial data fetch error:', e);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Connect to SSE stream for zero-latency live telemetry push
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      eventSource = new EventSource('/api/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'INIT' && data.status) {
            setStatus(data.status);
          } else if (data.type === 'SENSOR_UPDATE') {
            if (data.reading) {
              setReadings((prev) => {
                const next = [...prev.slice(-99), data.reading];
                return next;
              });
            }

            if (data.system_status) {
              setStatus(data.system_status);
            }

            if (data.alert) {
              setAlerts((prev) => [data.alert, ...prev]);

              // Audio alarm trigger
              if (data.alert.event_type === 'INTRUSION') {
                soundEffects.playIntrusionAlarm();
              } else if (data.alert.event_type === 'SUSPICIOUS') {
                soundEffects.playSuspiciousPing();
              }

              // Show Client Dispatch Toast
              setClientToast({
                subject: `${data.alert.event_type === 'INTRUSION' ? '🚨 INTRUSION' : '⚠️ ADVISORY'} Dispatch to Client`,
                message: data.alert.genai_message,
                channel: data.alert.severity === 'CRITICAL' ? 'SMS' : 'EMAIL',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              });
              setTimeout(() => setClientToast(null), 7000);
            }
          } else if (data.type === 'CLIENT_MESSAGE_SENT' && data.message) {
            setClientToast({
              subject: data.message.subject,
              message: data.message.message,
              channel: data.message.channel,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            });
            setTimeout(() => setClientToast(null), 7000);
          } else if (data.type === 'ALERT_UPDATED' && data.alert) {
            setAlerts((prev) =>
              prev.map((a) => (a.id === data.alert.id ? data.alert : a))
            );
          }
        } catch (err) {
          console.error('SSE message parse error:', err);
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        if (!fallbackInterval) {
          fallbackInterval = setInterval(fetchData, 2000);
        }
        setTimeout(connectSSE, 4000);
      };
    };

    connectSSE();

    return () => {
      eventSource?.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [fetchData]);

  // Actions
  const handleLoginSuccess = (authenticatedUser: User, token: string) => {
    setUser(authenticatedUser);
    localStorage.setItem('securehome_token', token);
    localStorage.setItem('securehome_user', JSON.stringify(authenticatedUser));
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('securehome_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    }
    localStorage.removeItem('securehome_token');
    localStorage.removeItem('securehome_user');
    setUser(null);
  };

  const handleToggleArm = async () => {
    const nextState = !status?.system_armed;
    try {
      await fetch('/api/system/arm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ armed: nextState }),
      });
      setStatus((prev) => (prev ? { ...prev, system_armed: nextState } : null));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.enabled = next;
  };

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
      if (selectedAlert?.id === id) {
        setSelectedAlert((prev) => (prev ? { ...prev, status: 'ACKNOWLEDGED' } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/resolve`, { method: 'POST' });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
      );
      if (selectedAlert?.id === id) {
        setSelectedAlert((prev) => (prev ? { ...prev, status: 'RESOLVED' } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunDemoStep = async (step: number) => {
    try {
      const res = await fetch('/api/demo/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step }),
      });
      const data = await res.json();
      await fetchData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await handleRunDemoStep(1);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // If user is not authenticated, render Login Page
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadAlertCount={activeAlertsCount}
        simulatorActive={status?.simulator_active ?? true}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Navigation Bar */}
        <Navbar
          status={status}
          onOpenDemo={() => setShowDemoModal(true)}
          onToggleArm={handleToggleArm}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          activeTab={activeTab}
          user={user}
          onLogout={handleLogout}
          onOpenClientMessages={() => setActiveTab('client-messages')}
        />

        {/* Viewport Router */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-grid-pattern">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                status={status}
                readings={readings}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                onOpenAlertDetails={(alert) => setSelectedAlert(alert)}
                onOpenDemo={() => setShowDemoModal(true)}
                onNavigateToSimulator={() => setActiveTab('simulator')}
                onNavigateToAssistant={() => setActiveTab('genai-assistant')}
                onNavigateToClientMessages={() => setActiveTab('client-messages')}
                alerts={alerts}
              />
            )}

            {activeTab === 'live-monitor' && (
              <LiveMonitorView status={status} readings={readings} />
            )}

            {activeTab === 'dnn-detection' && (
              <DnnDetectionView status={status} />
            )}

            {activeTab === 'genai-assistant' && (
              <GenAiAssistantView status={status} />
            )}

            {activeTab === 'sensor-history' && (
              <SensorHistoryView
                readings={readings}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView
                alerts={alerts}
                onOpenDetails={(alert) => setSelectedAlert(alert)}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
              />
            )}

            {activeTab === 'client-messages' && (
              <ClientMessagesView
                alerts={alerts}
                onOpenAlertDetails={(alert) => setSelectedAlert(alert)}
              />
            )}

            {activeTab === 'simulator' && (
              <SimulatorView onRefreshStatus={fetchData} />
            )}

            {activeTab === 'devices' && <DeviceManagementView />}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'architecture' && <ArchitectureView />}

            {activeTab === 'settings' && (
              <SettingsView
                status={status}
                onToggleArm={handleToggleArm}
                soundEnabled={soundEnabled}
                onToggleSound={handleToggleSound}
                onResetDemo={handleResetDemo}
              />
            )}
          </div>
        </main>

        {/* Real-Time Floating Client Dispatch Toast */}
        {clientToast && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-2xl bg-slate-900 border border-cyan-500 shadow-2xl animate-bounce-subtle backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                <Smartphone className="w-4 h-4 animate-pulse" />
                <span>GENAI MESSAGE DISPATCHED TO CLIENT ({clientToast.channel})</span>
              </div>
              <button
                onClick={() => setClientToast(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-bold text-white mt-1">
              {clientToast.subject}
            </div>

            <p className="text-[11px] text-slate-300 font-sans mt-1 leading-relaxed line-clamp-2">
              {clientToast.message}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Timestamp: {clientToast.time}</span>
              <button
                onClick={() => {
                  setActiveTab('client-messages');
                  setClientToast(null);
                }}
                className="text-cyan-400 font-bold hover:underline"
              >
                View in Dispatch Center →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
      />

      {/* Guided Live Demo Walkthrough Modal */}
      <LiveDemoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onRunStep={handleRunDemoStep}
      />
    </div>
  );
}
