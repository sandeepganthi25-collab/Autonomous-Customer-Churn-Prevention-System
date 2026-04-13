from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    phone: str
    plan_type: str
    join_date: str
    last_login: str
    login_frequency: int
    total_purchases: int
    last_purchase_date: str
    avg_session_duration: float
    support_tickets: int
    email_opens: int
    push_enabled: bool
    engagement_score: float
    churn_risk: float
    risk_level: str
    risk_factors: List[str]


class ChurnPredictionRequest(BaseModel):
    user_id: str


class ChurnPredictionResponse(BaseModel):
    user_id: str
    churn_risk: float
    risk_level: str
    confidence: float
    reasoning: str
    top_factors: List[Dict[str, Any]]
    recommended_actions: List[Dict[str, Any]]


class AIDecisionRequest(BaseModel):
    user_id: str
    force_refresh: bool = False


class AIDecisionResponse(BaseModel):
    decision_id: str
    user_id: str
    risk_score: float
    reasoning: str
    action_type: str
    action_details: Dict[str, Any]
    confidence: float
    alternatives: List[Dict[str, Any]]
    timestamp: str


class ActionRequest(BaseModel):
    user_id: str
    action_type: str
    channel: str = "auto"
    custom_message: Optional[str] = None


class ActionResponse(BaseModel):
    action_id: str
    user_id: str
    action_type: str
    channel: str
    status: str
    sent_at: str
    message_preview: str


class DigitalTwinSimulationRequest(BaseModel):
    user_id: str
    action: str
    params: Dict[str, Any] = Field(default_factory=dict)


class DigitalTwinSimulationResponse(BaseModel):
    simulation_id: str
    user_id: str
    action: str
    predicted_retention: float
    predicted_churn_risk: float
    revenue_impact: float
    success_probability: float
    recommendations: List[str]


class ABTestRequest(BaseModel):
    experiment_id: str


class ABTestResponse(BaseModel):
    experiment_id: str
    variants: List[str]
    stats: Dict[str, Dict[str, Any]]
    winner: Optional[str]
    total_samples: int


class SystemHealthResponse(BaseModel):
    status: str
    model_metrics: Dict[str, Any]
    drift_alerts: List[Dict[str, Any]]
    uptime_seconds: float
    active_connections: int


class EventResponse(BaseModel):
    event_id: str
    user_id: str
    event_type: str
    timestamp: str
    data: Dict[str, Any]
