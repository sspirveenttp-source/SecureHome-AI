import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Clock,
  RefreshCw,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import { ChatMessage, SystemStatusResponse } from '../types/index.ts';

interface GenAiAssistantViewProps {
  status: SystemStatusResponse | null;
}

export const GenAiAssistantView: React.FC<GenAiAssistantViewProps> = ({ status }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content:
        `Hello! I am **SecureHome AI Assistant**, grounded in your IoT perimeter sensor telemetry.\n\nI monitor distance readings from your **HC-SR04 ultrasonic sensor** and analyze classifications from the **Deep Neural Network (DNN)**.\n\nYou can ask me to summarize incidents, explain why a reading was classified as suspicious, or review telemetry logs.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'What happened recently?',
    'Why was this event classified as suspicious?',
    'Show today\'s security events.',
    'Summarize the last hour.',
    'What was the highest-risk event?',
    'Explain the latest alert.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: data.content,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content:
          '⚠️ Could not retrieve security context dispatch. Please ensure backend server is reachable.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <BotMessageSquare className="w-5 h-5 text-cyan-400" />
            GenAI Security Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Context-grounded natural-language reasoning powered by Gemini API (gemini-3.8-flash)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>ZERO HALLUCINATION TELEMETRY PROMPTING</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Chat Header Status */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">Grounded in Live Hardware Telemetry</span>
          </div>

          <div className="text-slate-500">
            Current Sensor: <b className="text-cyan-400">{status?.live_sensor.current_distance.toFixed(1)} cm</b>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

                  <div
                    className={`text-[10px] font-mono mt-1 ${
                      isUser ? 'text-cyan-200 text-right' : 'text-slate-500'
                    }`}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 text-slate-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 rounded-tl-none text-xs font-mono text-cyan-400 flex items-center gap-2">
                <span>Gemini analyzing ultrasonic time-series context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask SecureHome AI about sensor trends, alerts, or viva architecture..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
