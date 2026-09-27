export type SecurityStatus = 'NORMAL' | 'SUSPICIOUS' | 'INTRUSION';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertResolutionStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
export type SimulationMode = 'NORMAL' | 'RANDOM' | 'SUSPICIOUS' | 'INTRUSION' | 'CUSTOM';

export interface Device {
  device_id: string;
  device_name: string;
  device_type: string;
  status: 'ONLINE' | 'OFFLINE';
  ip_address: string;
  wifi_status: 'CONNECTED' | 'DISCONNECTED' | 'WEAK_SIGNAL';
  wifi_rssi: number; // in dBm, e.g. -58 dBm
  last_seen: string;
  firmware_version: string;
  uptime_seconds: number;
  is_simulator: boolean;
  location: string;
  created_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  sensor: 'HC-SR04';
  distance_cm: number;
  delta_cm: number;
  velocity_cms: number;
  timestamp: string;
  is_simulated: boolean;
}

export interface DnnFeatureVector {
  current_distance: number;
  previous_distance: number;
  distance_delta: number;
  rate_of_change: number;
  recent_min: number;
  recent_max: number;
  recent_avg: number;
  rapid_changes_count: number;
  approach_velocity: number;
  window_size: number;
}

export interface DnnPrediction {
  id: string;
  sensor_reading_id: string;
  device_id: string;
  classification: SecurityStatus;
  confidence: number; // 0.00 to 1.00
  scores: {
    normal: number;
    suspicious: number;
    intrusion: number;
  };
  features: DnnFeatureVector;
  explanation: string;
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  device_id: string;
  device_name: string;
  location: string;
  event_type: SecurityStatus;
  severity: AlertSeverity;
  distance_cm: number;
  previous_distance_cm: number;
  confidence: number;
  genai_message: string;
  status: AlertResolutionStatus;
  timestamp: string;
  history_trace: number[];
  features_snapshot?: DnnFeatureVector;
}

export interface DnnModelStats {
  total_records: number;
  normal_samples: number;
  suspicious_samples: number;
  intrusion_samples: number;
  training_samples: number;
  testing_samples: number;
  model_accuracy: number;
  f1_score: number;
  last_trained_time: string;
  architecture: {
    input_dim: number;
    hidden_layers: number[];
    output_dim: number;
    activation: string;
    optimizer: string;
    loss_function: string;
  };
  confusion_matrix: {
    tp_normal: number;
    tp_suspicious: number;
    tp_intrusion: number;
    false_positives: number;
    false_negatives: number;
  };
}

export interface SystemStatusResponse {
  system_online: boolean;
  system_armed: boolean;
  security_status: SecurityStatus;
  active_mode: 'SIMULATION MODE' | 'LIVE DEVICE MODE';
  active_device: Device;
  live_sensor: {
    current_distance: number;
    min_distance: number;
    max_distance: number;
    avg_distance: number;
    detected_movements_count: number;
    update_frequency_hz: number;
    last_updated: string;
  };
  latest_prediction?: DnnPrediction;
  latest_event?: SecurityEvent;
  total_alerts: number;
  active_alerts: number;
  simulator_active: boolean;
}

export interface SimulatorState {
  is_running: boolean;
  mode: SimulationMode;
  custom_distance: number;
  interval_ms: number;
  noise_amplitude: number;
  device_id: string;
  current_distance: number;
  step_count: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  referenced_events?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string;
  created_at: string;
}

export interface ClientMessage {
  id: string;
  alert_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  channel: 'SMS' | 'EMAIL' | 'PUSH' | 'GATEWAY';
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  subject: string;
  message: string;
  timestamp: string;
  severity: AlertSeverity;
  event_type: SecurityStatus;
  distance_cm?: number;
}

export interface ClientSettings {
  client_name: string;
  client_email: string;
  client_phone: string;
  auto_dispatch_sms: boolean;
  auto_dispatch_email: boolean;
  auto_dispatch_push: boolean;
  min_severity_to_dispatch: AlertSeverity;
}

