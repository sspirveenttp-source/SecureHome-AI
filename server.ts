import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseStore } from './server/db.ts';
import { DnnEngine } from './server/dnnEngine.ts';
import { GenAiService } from './server/genAiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const db = DatabaseStore.getInstance();
const dnn = DnnEngine.getInstance();
const genAi = GenAiService.getInstance();

// CORS & Preflight headers for external ESP8266 devices on local Wi-Fi
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- REST API ENDPOINTS ---

// Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = db.authenticate(email, password);
  if (!result) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    status: 'success',
    user: result.user,
    token: result.token,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = db.register(email, password, name || 'Operator', role || 'Security Administrator');
    res.status(201).json({
      status: 'success',
      user: result.user,
      token: result.token,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);

  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  res.json({ user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.body.token;
  if (token) {
    db.logout(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Client Message Dispatch Endpoints
app.get('/api/client-messages', (req: Request, res: Response) => {
  res.json({
    count: db.getClientMessages().length,
    messages: db.getClientMessages(),
  });
});

app.post('/api/client-messages/send', async (req: Request, res: Response) => {
  try {
    const { client_name, client_email, client_phone, channel, subject, message, alert_id, severity, event_type } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const dispatched = db.sendManualClientMessage({
      client_name,
      client_email,
      client_phone,
      channel,
      subject,
      message,
      alert_id,
      severity,
      event_type,
    });

    res.status(201).json({ status: 'success', message: dispatched });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dispatch message' });
  }
});

app.get('/api/client-settings', (req: Request, res: Response) => {
  res.json(db.getClientSettings());
});

app.post('/api/client-settings', (req: Request, res: Response) => {
  const updated = db.updateClientSettings(req.body);
  res.json(updated);
});


/**
 * ESP8266 REST API Integration Endpoint
 * The physical or simulated ESP8266 sends ultrasonic distance data here.
 * Expected JSON:
 * {
 *   "device_id": "ESP8266-HOME-01",
 *   "sensor": "HC-SR04",
 *   "distance_cm": 82.4,
 *   "timestamp": "2026-09-27T20:30:00Z"
 * }
 */
app.post('/api/sensor-data', async (req: Request, res: Response) => {
  try {
    const { device_id, sensor = 'HC-SR04', distance_cm, timestamp } = req.body;

    // Strict hardware validation
    if (!device_id || typeof device_id !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'device_id is required and must be a valid string identifier (e.g. ESP8266-HOME-01).',
      });
    }

    if (distance_cm === undefined || typeof distance_cm !== 'number' || isNaN(distance_cm)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'distance_cm is required and must be a valid float/integer reading in centimeters.',
      });
    }

    if (distance_cm < 2.0 || distance_cm > 400.0) {
      return res.status(422).json({
        error: 'Unprocessable Entity',
        message: `Sensor reading ${distance_cm} cm is outside HC-SR04 operational specifications (2cm to 400cm). Possible sensor occlusion or echo timeout.`,
      });
    }

    const clientIp = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '192.168.1.100';

    const result = await db.processSensorData({
      device_id,
      sensor,
      distance_cm,
      timestamp: timestamp || new Date().toISOString(),
      client_ip: clientIp,
    });

    return res.status(201).json({
      status: 'success',
      data: {
        reading_id: result.reading.id,
        classification: result.prediction.classification,
        confidence: result.prediction.confidence,
        alert_triggered: !!result.alert,
        alert_id: result.alert?.id,
        received_distance: result.reading.distance_cm,
        timestamp: result.reading.timestamp,
      },
    });
  } catch (err: any) {
    console.error('Error handling /api/sensor-data:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'Error processing sensor telemetry in AI pipeline.',
    });
  }
});

// System Status Overview
app.get('/api/status', (req: Request, res: Response) => {
  const status = db.getSystemStatus();
  res.json(status);
});

// Sensor Readings with Range Filters
app.get('/api/readings', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 60;
  const range = (req.query.range as string) || 'all';
  const readings = db.getReadings({ limit, range });
  res.json({ count: readings.length, readings });
});

// Security Alerts
app.get('/api/alerts', (req: Request, res: Response) => {
  const type = req.query.type as string;
  const status = req.query.status as string;
  const alerts = db.getAlerts({ type, status });
  res.json({ count: alerts.length, alerts });
});

app.get('/api/alerts/:id', (req: Request, res: Response) => {
  const alert = db.getAlertById(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  res.json(alert);
});

app.post('/api/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const success = db.updateAlertStatus(req.params.id, 'ACKNOWLEDGED');
  if (!success) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  res.json({ success: true, message: 'Alert acknowledged' });
});

app.post('/api/alerts/:id/resolve', (req: Request, res: Response) => {
  const success = db.updateAlertStatus(req.params.id, 'RESOLVED');
  if (!success) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  res.json({ success: true, message: 'Alert resolved' });
});

// Devices Management
app.get('/api/devices', (req: Request, res: Response) => {
  res.json(db.getDevices());
});

app.post('/api/devices', (req: Request, res: Response) => {
  const { device_id, device_name, location } = req.body;
  if (!device_id) {
    return res.status(400).json({ error: 'device_id is required' });
  }
  const updated = db.updateDevice(device_id, {
    device_name: device_name || device_id,
    location: location || 'Perimeter Zone',
  });
  res.json({ success: true, device: updated });
});

// DNN Stats & Evaluation
app.get('/api/dnn/stats', (req: Request, res: Response) => {
  res.json(db.getDnnStats());
});

app.post('/api/dnn/evaluate', (req: Request, res: Response) => {
  const { distance_cm, previous_distance, rapid_changes, velocity } = req.body;
  const curDist = Number(distance_cm || 50);
  const prevDist = Number(previous_distance || curDist);
  const delta = Math.abs(curDist - prevDist);
  const vel = Number(velocity || (prevDist - curDist));
  const rapid = Number(rapid_changes || 0);

  const features = {
    current_distance: curDist,
    previous_distance: prevDist,
    distance_delta: delta,
    rate_of_change: delta * 2,
    recent_min: Math.min(curDist, prevDist),
    recent_max: Math.max(curDist, prevDist),
    recent_avg: (curDist + prevDist) / 2,
    rapid_changes_count: rapid,
    approach_velocity: vel,
    window_size: 10,
  };

  const prediction = dnn.classify('EVAL-TESTBED', 'eval-' + Date.now(), features);
  res.json({ features, prediction });
});

// GenAI Security Assistant Chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    const readings = db.getReadings({ limit: 10 });
    const alerts = db.getAlerts();
    const status = db.getSystemStatus();

    const responseText = await genAi.handleAssistantChat(message, {
      recentReadings: readings,
      recentAlerts: alerts,
      systemStatus: status.security_status,
      activeMode: status.active_mode,
      latestDistance: status.live_sensor.current_distance,
    });

    res.json({
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// IoT Simulator Controls
app.get('/api/simulator', (req: Request, res: Response) => {
  res.json(db.getSimulatorState());
});

app.post('/api/simulator/config', (req: Request, res: Response) => {
  db.setSimulatorConfig(req.body);
  res.json(db.getSimulatorState());
});

app.post('/api/simulator/start', (req: Request, res: Response) => {
  db.startSimulator();
  res.json({ success: true, state: db.getSimulatorState() });
});

app.post('/api/simulator/stop', (req: Request, res: Response) => {
  db.stopSimulator();
  res.json({ success: true, state: db.getSimulatorState() });
});

// Demo Mode Sequence Step
app.post('/api/demo/step', async (req: Request, res: Response) => {
  const step = Number(req.body.step || 1);
  const result = await db.executeDemoStep(step);
  res.json(result);
});

// System Arm / Disarm
app.post('/api/system/arm', (req: Request, res: Response) => {
  const { armed } = req.body;
  db.setArmed(Boolean(armed));
  res.json({ armed: Boolean(armed) });
});

// Server-Sent Events (SSE) for Real-Time Live Feed
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial state immediately
  res.write(`data: ${JSON.stringify({ type: 'INIT', status: db.getSystemStatus() })}\n\n`);

  const sender = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  db.subscribeSSE(sender);

  req.on('close', () => {
    db.unsubscribeSSE(sender);
  });
});

// --- VITE MIDDLEWARE / STATIC ASSETS SETUP ---
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`SecureHome AI Server running on http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
