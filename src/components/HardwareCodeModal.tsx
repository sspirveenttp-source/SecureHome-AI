import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Cpu, Zap, Download } from 'lucide-react';

interface HardwareCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverUrl?: string;
}

export const HardwareCodeModal: React.FC<HardwareCodeModalProps> = ({
  isOpen,
  onClose,
  serverUrl = 'http://192.168.1.100:3000',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [ssid, setSsid] = useState<string>('Home-WiFi');
  const [password, setPassword] = useState<string>('MySecretPass123');
  const [endpointUrl, setEndpointUrl] = useState<string>(
    typeof window !== 'undefined' ? `${window.location.origin}/api/sensor-data` : 'http://192.168.1.100:3000/api/sensor-data'
  );

  const arduinoCode = `/*
  ==============================================================
  SecureHome AI - ESP8266 & HC-SR04 Firmware Sketch
  Hardware: ESP8266 NodeMCU v2 / ESP-12E + HC-SR04 Ultrasonic
  Target API: POST /api/sensor-data
  ==============================================================
*/

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// Wi-Fi Configuration
const char* WIFI_SSID     = "${ssid}";
const char* WIFI_PASSWORD = "${password}";

// Backend REST API Endpoint
const char* SERVER_URL    = "${endpointUrl}";
const char* DEVICE_ID     = "ESP8266-HOME-01";

// Pin Configuration (NodeMCU)
const int TRIG_PIN = D1; // GPIO 5 -> HC-SR04 TRIG
const int ECHO_PIN = D2; // GPIO 4 -> HC-SR04 ECHO (via 1k/2k resistor voltage divider)

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\\n[SecureHome AI] Initializing ESP8266...");

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  // Connect to Local Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }

  Serial.println("\\n[SecureHome AI] Wi-Fi Connected!");
  Serial.print("ESP8266 IP Address: ");
  Serial.println(WiFi.localIP());
}

float measureDistanceCm() {
  // Clear trigger pin
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  // Send 10µs ultrasonic burst
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read echo time-of-flight in microseconds
  // Timeout: 30000 µs (~5 meters max)
  long durationUs = pulseIn(ECHO_PIN, HIGH, 30000);

  if (durationUs <= 0) {
    return -1.0; // Out of range or echo timeout
  }

  // Speed of sound = 343 m/s = 0.0343 cm/µs
  // Distance = (Time * Speed) / 2
  float distanceCm = (durationUs * 0.0343) / 2.0;
  return distanceCm;
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float distance = measureDistanceCm();

    if (distance >= 2.0 && distance <= 400.0) {
      Serial.printf("[HC-SR04] Distance: %.1f cm\\n", distance);

      WiFiClient client;
      HTTPClient http;

      http.begin(client, SERVER_URL);
      http.addHeader("Content-Type", "application/json");

      // Construct JSON payload
      String jsonPayload = "{\\"device_id\\":\\"" + String(DEVICE_ID) +
                           "\\",\\"sensor\\":\\"HC-SR04\\",\\"distance_cm\\":" +
                           String(distance, 1) + "}";

      int httpResponseCode = http.POST(jsonPayload);

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("[API Success] Code: %d -> %s\\n", httpResponseCode, response.c_str());
      } else {
        Serial.printf("[API Error] Failed to send: %s\\n", http.errorToString(httpResponseCode).c_str());
      }

      http.end();
    } else {
      Serial.println("[HC-SR04] Reading out of bounds or echo timeout.");
    }
  } else {
    Serial.println("[Wi-Fi] Disconnected, reconnecting...");
    WiFi.reconnect();
  }

  // Sample interval (adjust between 500ms to 1500ms)
  delay(1200);
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                ESP8266 + HC-SR04 ARDUINO FIRMWARE
              </h3>
              <p className="text-xs text-slate-400">
                Ready-to-flash C++ sketch for physical hardware integration with SecureHome AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration inputs */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">
            Customize Parameters:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Wi-Fi SSID</label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Wi-Fi Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Backend API Endpoint</label>
              <input
                type="text"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Code viewer */}
        <div className="relative p-4 bg-slate-950 max-h-96 overflow-y-auto font-mono text-xs text-slate-300">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIED!' : 'COPY CODE'}</span>
            </button>
          </div>

          <pre className="pr-20 overflow-x-auto leading-relaxed">{arduinoCode}</pre>
        </div>

        {/* Hardware Breadboard Wiring Pinout */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs font-mono space-y-2">
          <div className="text-slate-400 font-bold uppercase text-[11px]">
            ⚡ Breadboard Wiring Reference:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-red-400 font-bold">VCC:</span> Connect to ESP8266 <b>VIN (5V)</b>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-bold">GND:</span> Connect to ESP8266 <b>GND</b>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold">TRIG:</span> Connect to ESP8266 <b>D1 (GPIO 5)</b>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-amber-400 font-bold">ECHO:</span> Connect to ESP8266 <b>D2 (GPIO 4)</b>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/80 text-xs font-mono">
          <span className="text-slate-400">Works with ESP8266 NodeMCU, WeMos D1 Mini, and ESP-01</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
