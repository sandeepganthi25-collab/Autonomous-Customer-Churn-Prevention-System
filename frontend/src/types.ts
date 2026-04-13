export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  plan_type: string;
  join_date: string;
  last_login: string;
  login_frequency: number;
  total_purchases: number;
  last_purchase_date: string;
  avg_session_duration: number;
  support_tickets: number;
  email_opens: number;
  push_enabled: boolean;
  engagement_score: number;
  churn_risk: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: string[];
}

export interface ChurnEvent {
  event_id: string;
  user_id: string;
  event_type: string;
  timestamp: string;
  data: {
    user_name?: string;
    churn_risk?: number;
    risk_score?: number;
    risk_level?: string;
    description?: string;
    decision?: any;
    action_taken?: string;
    confidence?: number;
    live_mode?: boolean;
  };
}

export interface AIDecision {
  decision_id: string;
  user_id: string;
  risk_score: number;
  risk_level: string;
  reasoning: string;
  action_type: string;
  action_details: {
    action_type: string;
    channel: string;
    message: string;
    subject: string;
    send_at: string;
  };
  confidence: number;
  alternatives: Array<{
    action: string;
    confidence: number;
    reasoning: string;
  }>;
  timestamp: string;
}

export interface ABTest {
  experiment_id: string;
  variants: string[];
  stats: Record<string, {
    starts: number;
    conversions: number;
    conversion_rate: number;
  }>;
  winner: string | null;
  total_samples: number;
}

export interface SystemHealth {
  status: string;
  model_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    auc_roc: number;
    drift_score: boolean;
    drift_severity: string;
  };
  drift_alerts: Array<{
    type: string;
    severity: string;
    message: string;
    recommendation: string;
  }>;
  uptime_seconds: number;
  active_connections: number;
}

export interface AnalyticsOverview {
  total_users: number;
  active_users?: number;
  churn_rate?: number;
  retention_rate?: number;
  risk_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  averages: {
    churn_risk: number;
    engagement: number;
  };
  revenue_at_risk: number;
  potential_savings: number;
  timestamp?: string;
}

export interface Simulation {
  simulation_id: string;
  user_id: string;
  action: string;
  predicted_retention: number;
  predicted_churn_risk: number;
  revenue_impact: number;
  success_probability: number;
}
