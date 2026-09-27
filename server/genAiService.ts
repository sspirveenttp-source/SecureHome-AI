import { GoogleGenAI } from '@google/genai';
import { SecurityEvent, DnnPrediction, SensorReading } from '../src/types/index.ts';

export class GenAiService {
  private static instance: GenAiService;
  private ai: GoogleGenAI | null = null;
  private hasKey: boolean = false;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        this.ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        this.hasKey = true;
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err);
      }
    }
  }

  public static getInstance(): GenAiService {
    if (!GenAiService.instance) {
      GenAiService.instance = new GenAiService();
    }
    return GenAiService.instance;
  }

  public isAvailable(): boolean {
    return this.hasKey && this.ai !== null;
  }

  /**
   * Generates a context-grounded natural-language security alert message using Gemini API
   */
  public async generateAlertMessage(params: {
    event_type: 'NORMAL' | 'SUSPICIOUS' | 'INTRUSION';
    confidence: number;
    current_distance: number;
    previous_distance: number;
    delta: number;
    velocity: number;
    device_id: string;
    location: string;
    rapid_changes: number;
  }): Promise<string> {
    const {
      event_type,
      confidence,
      current_distance,
      previous_distance,
      delta,
      velocity,
      device_id,
      location,
      rapid_changes,
    } = params;

    const confidencePct = (confidence * 100).toFixed(1);

    if (this.ai) {
      try {
        const prompt = `Generate a concise, professional security alert dispatch message for our IoT Home Security System ("SecureHome AI").
Event Data:
- Classification: ${event_type}
- AI Model Confidence: ${confidencePct}%
- Current Ultrasonic Distance: ${current_distance} cm
- Previous Baseline Distance: ${previous_distance} cm
- Distance Delta: ${delta} cm
- Rate of Change / Velocity: ${velocity > 0 ? '+' : ''}${velocity} cm/s
- Rapid Changes Count: ${rapid_changes}
- Hardware Device: ${device_id}
- Monitored Location: ${location}

Formatting Rules:
1. Start with an appropriate status badge icon (🚨 for INTRUSION, ⚠️ for SUSPICIOUS).
2. Exactly state the distance drop/shift from ${previous_distance} cm to ${current_distance} cm.
3. State the DNN classification and confidence level (${confidencePct}%).
4. Provide a clear, calm, actionable recommendation for the homeowner.
5. Keep it under 3 sentences. Do NOT hallucinate cameras, faces, or unmeasured audio. Rely strictly on ultrasonic sensor telemetry.`;

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
        const callPromise = this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are the automated SecureHome AI security alert dispatcher. Produce grounded, professional, high-priority alerts based strictly on ultrasonic sensor telemetry.',
            temperature: 0.2,
          },
        });

        const response: any = await Promise.race([callPromise, timeoutPromise]);
        const text = response?.text?.trim();
        if (text) {
          return text;
        }
      } catch (error) {
        console.warn('Gemini alert generation fallback triggered:', error);
      }
    }

    // High-fidelity context-aware fallback (guaranteed to match specs perfectly)
    if (event_type === 'INTRUSION') {
      return `🚨 Security Alert: High-risk proximity breach detected at ${location} by ${device_id}. The HC-SR04 sensor recorded an abrupt distance collapse from ${previous_distance} cm to ${current_distance} cm (approach rate: ${Math.abs(velocity)} cm/s). The DNN model classified this event as an INTRUSION with ${confidencePct}% confidence. Please inspect the perimeter immediately.`;
    } else if (event_type === 'SUSPICIOUS') {
      return `⚠️ Advisory Notice: Anomalous movement pattern flagged at ${location}. Sensor telemetry registered erratic fluctuation between ${previous_distance} cm and ${current_distance} cm with ${rapid_changes} rapid shifts. The DNN model classified this event as SUSPICIOUS with ${confidencePct}% confidence. Standby monitoring advised.`;
    } else {
      return `✅ System Notice: Normal environment verified at ${location}. Ultrasonic distance stable at ${current_distance} cm with baseline variance. All security parameters within nominal tolerances.`;
    }
  }

  /**
   * GenAI Security Assistant chat with grounded context
   */
  public async handleAssistantChat(
    userMessage: string,
    context: {
      recentReadings: SensorReading[];
      recentAlerts: SecurityEvent[];
      systemStatus: string;
      activeMode: string;
      latestDistance: number;
    }
  ): Promise<string> {
    const { recentReadings, recentAlerts, systemStatus, activeMode, latestDistance } = context;

    const alertsSummary = recentAlerts.slice(0, 5).map(a => 
      `- [${a.timestamp.substring(11, 19)}] ${a.event_type} (${(a.confidence * 100).toFixed(1)}% conf) at ${a.location}: Distance ${a.distance_cm} cm. Summary: ${a.genai_message.substring(0, 90)}...`
    ).join('\n') || 'No critical events logged in current session.';

    const readingsSummary = recentReadings.slice(-6).map(r => 
      `${r.distance_cm}cm`
    ).join(' → ') || `${latestDistance}cm`;

    if (this.ai) {
      try {
        const prompt = `User question: "${userMessage}"

Current System State:
- System Status: ${systemStatus}
- Operation Mode: ${activeMode}
- Current Live Distance: ${latestDistance} cm
- Recent Distance History: ${readingsSummary}
- Recent Security Alerts:
${alertsSummary}

Instructions:
- You are "SecureHome AI Assistant", an expert AI security analyst built into an IoT Home Security command center.
- Answer the user clearly, politely, and technically accurately.
- Clearly distinguish AI-generated explanations from raw HC-SR04 sensor measurements.
- If asked about "why was this classified as suspicious", explain the DNN feature vector concepts: sudden distance collapse, rapid oscillating delta, and approach velocity.
- If asked about college viva, hardware, or architecture, explain: HC-SR04 (ultrasonic pulse time-of-flight) → ESP8266 (Wi-Fi HTTP REST POST /api/sensor-data) → Express Backend → Sliding Window Feature Extractor → DNN Classifier → GenAI Alert Generator → Real-time Dashboard.
- Format with clean markdown, bullet points where helpful.`;

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5500));
        const callPromise = this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are SecureHome AI Assistant, an authoritative cybersecurity and IoT sensor expert embedded in a smart home security platform.',
            temperature: 0.3,
          },
        });

        const response: any = await Promise.race([callPromise, timeoutPromise]);
        const text = response?.text?.trim();
        if (text) {
          return text;
        }
      } catch (err) {
        console.warn('Gemini chat error, using context assistant engine:', err);
      }
    }

    // Grounded rule-based intelligent fallback for offline or zero-key presentation environments
    const lower = userMessage.toLowerCase();
    if (lower.includes('what happened') || lower.includes('recent') || lower.includes('latest')) {
      const topAlert = recentAlerts[0];
      if (topAlert) {
        return `### 🛡️ Recent Security Summary\n\nThe most recent high-priority event was flagged at **${topAlert.timestamp.substring(11, 19)}** as **${topAlert.event_type}** (${(topAlert.confidence * 100).toFixed(1)}% DNN confidence).\n\n- **Device:** ${topAlert.device_id} (${topAlert.location})\n- **Distance Telemetry:** Distance dropped to **${topAlert.distance_cm} cm** (from ${topAlert.previous_distance_cm} cm).\n- **GenAI Advisory:** "${topAlert.genai_message}"\n\nCurrent sensor reading is holding at **${latestDistance} cm** in **${activeMode}**.`;
      } else {
        return `### 🛡️ System Status Nominal\n\nNo intrusions or suspicious activities detected. The HC-SR04 sensor is currently reporting **${latestDistance} cm** distance in **${activeMode}**. Ambient baseline is normal.`;
      }
    }

    if (lower.includes('why') && (lower.includes('suspicious') || lower.includes('intrusion') || lower.includes('classified'))) {
      return `### 🧠 DNN Feature Analysis Explanation\n\nThe DNN intrusion detection pipeline classifies events based on a multi-dimensional feature vector extracted from the HC-SR04 ultrasonic sliding window:\n\n1. **Distance Delta (Δ):** Significant variance from calibrated ambient baseline (> 20 cm sudden change).\n2. **Rate of Approach:** Velocity vector measuring how fast an obstacle approaches the transmitter/receiver cones.\n3. **Rapid Change Frequency:** More than 2 erratic fluctuations within a 5-second interval distinguish an actual entity from sensor electronic noise.\n4. **Critical Threshold Breach:** Absolute distance < 35 cm indicates direct boundary breach into the defended doorway or corridor.\n\nThese 9 normalized inputs pass through a 2-hidden-layer feedforward network with ReLU activation and Softmax output.`;
    }

    if (lower.includes('hardware') || lower.includes('esp8266') || lower.includes('sensor') || lower.includes('architecture')) {
      return `### ⚙️ Hardware & Transmission Pipeline\n\n- **Sensor:** HC-SR04 Ultrasonic Sensor (Trigger pin emits 40kHz sonic burst, Echo pin measures round-trip time-of-flight; \`distance = (duration * 0.0343) / 2\`).\n- **Microcontroller:** ESP8266 NodeMCU / D1 Mini with onboard 802.11 b/g/n Wi-Fi.\n- **Protocol:** HTTP REST \`POST /api/sensor-data\` with JSON payload containing device ID, timestamp, and distance in cm.\n- **Dual Operating Modes:** Operates seamlessly via the built-in **IoT Simulator** or directly with the physical breadboard hardware using the exact same backend API!`;
    }

    if (lower.includes('today') || lower.includes('summary') || lower.includes('hour') || lower.includes('events')) {
      const intrusionCount = recentAlerts.filter(a => a.event_type === 'INTRUSION').length;
      const suspiciousCount = recentAlerts.filter(a => a.event_type === 'SUSPICIOUS').length;
      return `### 📊 Activity Summary for Today\n\n- **Total Recorded Incidents:** ${recentAlerts.length}\n- **Intrusions Confirmed (High/Critical):** ${intrusionCount}\n- **Suspicious Anomalies (Advisory):** ${suspiciousCount}\n- **Current Distance Baseline:** ${latestDistance} cm\n- **Active Device:** ESP8266-HOME-01 (${activeMode})\n\nAll historical telemetry and DNN feature weights are retained in the Sensor History archive.`;
    }

    return `### 🤖 SecureHome AI Telemetry Response\n\nSecureHome AI is actively monitoring the perimeter. \n- **Current Sensor Reading:** ${latestDistance} cm\n- **Status:** ${systemStatus}\n- **Operational Mode:** ${activeMode}\n- **Logged Alerts:** ${recentAlerts.length} recorded events\n\nYou can ask about recent security events, request a DNN classification breakdown, test different movement simulations, or view hardware connection schematics.`;
  }
}
