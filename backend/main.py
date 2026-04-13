from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import asyncio
import json
from datetime import datetime

from models import (
    get_user_by_id,
    get_users_by_risk,
    get_high_risk_users,
    event_bus,
    ab_memory,
    create_digital_twin,
    simulate_action,
    MOCK_USERS,
    DRIFT_HISTORY,
    MODEL_METRICS,
)
from services import ai_service, start_background_tasks
from agents.risk_agent import risk_agent_instance
from agents.behavior_agent import behavior_agent_instance
from ml.shap_explainer import shap_explainer
from ml.drift_detector import drift_detector
from schemas import (
    UserResponse,
    ChurnPredictionRequest,
    ChurnPredictionResponse,
    AIDecisionRequest,
    AIDecisionResponse,
    ActionRequest,
    ActionResponse,
    DigitalTwinSimulationRequest,
    DigitalTwinSimulationResponse,
    ABTestRequest,
    ABTestResponse,
    SystemHealthResponse,
)

app = FastAPI(
    title="Autonomous Churn Prevention System",
    description="Multi-Agent AI System for Customer Retention",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

startup_complete = False


@app.on_event("startup")
async def startup_event():
    global startup_complete
    await start_background_tasks()
    startup_complete = True


@app.get("/")
async def root():
    return {
        "system": "Autonomous Churn Prevention System",
        "version": "1.0.0",
        "status": "operational",
        "agents": ["Risk Agent", "Behavior Agent", "Strategy Agent", "Execution Agent"],
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "uptime": "operational",
        "active_connections": len(event_bus.subscribers),
        "model_status": MODEL_METRICS,
    }


@app.get("/api/users", response_model=List[UserResponse])
async def list_users(
    risk_level: Optional[str] = None, limit: int = Query(default=50, le=500)
):
    users = get_users_by_risk(risk_level=risk_level, limit=limit)
    return users


@app.get("/api/users/high-risk")
async def get_at_risk_users(limit: int = Query(default=100, le=500)):
    import random

    all_users = MOCK_USERS.copy()

    critical_users = [u for u in all_users if u["risk_level"] == "critical"]
    high_users = [u for u in all_users if u["risk_level"] == "high"]
    medium_users = [u for u in all_users if u["risk_level"] == "medium"]
    low_users = [u for u in all_users if u["risk_level"] == "low"]

    quota = max(limit // 4, 10)

    selected = []
    selected.extend(
        random.sample(critical_users, min(quota, len(critical_users)))
        if critical_users
        else []
    )
    selected.extend(
        random.sample(high_users, min(quota, len(high_users))) if high_users else []
    )
    selected.extend(
        random.sample(medium_users, min(quota, len(medium_users)))
        if medium_users
        else []
    )
    selected.extend(
        random.sample(low_users, min(quota, len(low_users))) if low_users else []
    )

    while len(selected) < limit:
        remaining = [u for u in all_users if u not in selected]
        if not remaining:
            break
        selected.append(random.choice(remaining))

    random.shuffle(selected)
    return selected[:limit]


@app.get("/api/users/live")
async def get_live_users(limit: int = Query(default=100, le=500)):
    import random
    import time

    current_time = int(time.time())
    random.seed(current_time)

    all_users = MOCK_USERS.copy()

    for user in all_users:
        variance = random.uniform(-0.05, 0.05)
        user["churn_risk"] = round(
            max(0.01, min(0.99, user["churn_risk"] + variance)), 2
        )

        if user["churn_risk"] >= 0.55:
            user["risk_level"] = "critical"
        elif user["churn_risk"] >= 0.30:
            user["risk_level"] = "high"
        elif user["churn_risk"] >= 0.10:
            user["risk_level"] = "medium"
        else:
            user["risk_level"] = "low"

        user["engagement_score"] = round(
            max(10, min(100, user["engagement_score"] + random.uniform(-3, 3))), 1
        )

    critical_users = [u for u in all_users if u["risk_level"] == "critical"]
    high_users = [u for u in all_users if u["risk_level"] == "high"]
    medium_users = [u for u in all_users if u["risk_level"] == "medium"]
    low_users = [u for u in all_users if u["risk_level"] == "low"]

    quota = max(limit // 4, 10)

    selected = []
    selected.extend(
        random.sample(critical_users, min(quota, len(critical_users)))
        if critical_users
        else []
    )
    selected.extend(
        random.sample(high_users, min(quota, len(high_users))) if high_users else []
    )
    selected.extend(
        random.sample(medium_users, min(quota, len(medium_users)))
        if medium_users
        else []
    )
    selected.extend(
        random.sample(low_users, min(quota, len(low_users))) if low_users else []
    )

    while len(selected) < limit:
        remaining = [u for u in all_users if u not in selected]
        if not remaining:
            break
        selected.append(random.choice(remaining))

    random.shuffle(selected)
    return selected[:limit]


@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/predict", response_model=ChurnPredictionResponse)
async def predict_churn(request: ChurnPredictionRequest):
    user = get_user_by_id(request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    risk_result = await risk_agent_instance.predict(user)
    shap_result = shap_explainer.explain_prediction(
        user, risk_result.get("churn_risk", 0.5)
    )

    recommended_actions = []
    if risk_result["risk_level"] in ["critical", "high"]:
        recommended_actions = [
            {"action": "send_discount", "priority": "high"},
            {"action": "personalized_outreach", "priority": "medium"},
            {"action": "premium_trial", "priority": "low"},
        ]
    elif risk_result["risk_level"] == "medium":
        recommended_actions = [
            {"action": "engagement_campaign", "priority": "medium"},
            {"action": "feature_highlight", "priority": "low"},
        ]

    return ChurnPredictionResponse(
        user_id=user["user_id"],
        churn_risk=risk_result["risk_score"],
        risk_level=risk_result["risk_level"],
        confidence=risk_result["confidence"],
        reasoning=shap_result["explanation"],
        top_factors=shap_result["top_positive_contributors"],
        recommended_actions=recommended_actions,
    )


@app.post("/api/ai-decide", response_model=AIDecisionResponse)
async def ai_decide(request: AIDecisionRequest):
    decision = await ai_service.analyze_user(request.user_id, request.force_refresh)

    if "error" in decision:
        raise HTTPException(status_code=404, detail=decision["error"])

    return AIDecisionResponse(
        decision_id=f"DEC_{datetime.now().timestamp()}",
        user_id=request.user_id,
        risk_score=decision.get("risk_score", 0.5),
        reasoning=decision.get("reasoning", ""),
        action_type=decision.get("action_type", "monitor"),
        action_details=decision.get("action_details", {}),
        confidence=decision.get("confidence", 0.8),
        alternatives=decision.get("alternatives", []),
        timestamp=decision.get("timestamp", datetime.now().isoformat()),
    )


@app.post("/api/actions", response_model=ActionResponse)
async def execute_action(request: ActionRequest):
    user = get_user_by_id(request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return ActionResponse(
        action_id=f"ACT_{datetime.now().timestamp()}",
        user_id=request.user_id,
        action_type=request.action_type,
        channel=request.channel,
        status="simulated",
        sent_at=datetime.now().isoformat(),
        message_preview=f"Action logged: {request.action_type} via {request.channel}",
    )


@app.get("/api/analytics/overview")
async def get_analytics_overview():
    total_users = len(MOCK_USERS)
    critical = len([u for u in MOCK_USERS if u["risk_level"] == "critical"])
    high = len([u for u in MOCK_USERS if u["risk_level"] == "high"])
    medium = len([u for u in MOCK_USERS if u["risk_level"] == "medium"])
    low = len([u for u in MOCK_USERS if u["risk_level"] == "low"])

    avg_risk = sum(u["churn_risk"] for u in MOCK_USERS) / total_users
    avg_engagement = sum(u["engagement_score"] for u in MOCK_USERS) / total_users

    return {
        "total_users": total_users,
        "risk_distribution": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
        },
        "averages": {
            "churn_risk": round(avg_risk, 3),
            "engagement": round(avg_engagement, 1),
        },
        "revenue_at_risk": critical * 500 + high * 200,
        "potential_savings": round(critical * 0.3 * 500 + high * 0.2 * 200, 2),
    }


@app.get("/api/analytics/live")
async def get_live_analytics():
    import random
    import time

    current_time = int(time.time())
    random.seed(current_time)

    base_total = len(MOCK_USERS)
    base_critical = len([u for u in MOCK_USERS if u["risk_level"] == "critical"])
    base_high = len([u for u in MOCK_USERS if u["risk_level"] == "high"])
    base_medium = len([u for u in MOCK_USERS if u["risk_level"] == "medium"])
    base_low = len([u for u in MOCK_USERS if u["risk_level"] == "low"])

    variance = random.uniform(-0.02, 0.02)
    churn_rate = 0.328 + variance
    churn_rate = max(0.25, min(0.40, churn_rate))

    active_users = int(base_total * (1 - churn_rate) * random.uniform(0.98, 1.02))
    active_users = max(800, min(900, active_users))

    critical_users = base_critical + random.randint(-5, 5)
    critical_users = max(40, min(80, critical_users))

    revenue_at_risk = critical_users * 500 + (base_high + random.randint(-10, 10)) * 200
    revenue_at_risk = max(50000, min(90000, revenue_at_risk))

    retention_rate = 1 - churn_rate
    retention_rate = max(0.60, min(0.75, retention_rate))

    avg_risk = sum(u["churn_risk"] for u in MOCK_USERS) / base_total + variance * 0.5
    avg_engagement = sum(u["engagement_score"] for u in MOCK_USERS) / base_total

    return {
        "total_users": base_total,
        "active_users": active_users,
        "churn_rate": round(churn_rate * 100, 1),
        "retention_rate": round(retention_rate * 100, 1),
        "risk_distribution": {
            "critical": critical_users,
            "high": base_high + random.randint(-5, 5),
            "medium": base_medium + random.randint(-10, 10),
            "low": base_low + random.randint(-10, 10),
        },
        "averages": {
            "churn_risk": round(avg_risk, 3),
            "engagement": round(avg_engagement, 1),
        },
        "revenue_at_risk": revenue_at_risk,
        "potential_savings": round(
            critical_users * 0.3 * 500
            + (base_high + random.randint(-5, 5)) * 0.2 * 200,
            2,
        ),
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/analytics/trends")
async def get_trends(days: int = Query(default=30, le=90)):
    import random

    trends = []
    for i in range(days):
        date = datetime.now().replace(
            hour=0, minute=0, second=0, microsecond=0
        ) - datetime.timedelta(days=days - i - 1)
        trends.append(
            {
                "date": date.isoformat(),
                "churn_rate": round(random.uniform(0.08, 0.15), 3),
                "retention_rate": round(random.uniform(0.85, 0.92), 3),
                "active_users": random.randint(800, 950),
                "at_risk_count": random.randint(50, 150),
            }
        )
    return trends


@app.post("/api/digital-twin/create")
async def create_twin(user_id: str):
    twin = create_digital_twin(user_id)
    if not twin:
        raise HTTPException(status_code=404, detail="User not found")
    return twin


@app.post("/api/digital-twin/simulate")
async def simulate(request: DigitalTwinSimulationRequest):
    result = simulate_action(request.user_id, request.action, request.params)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.get("/api/ab-tests", response_model=List[ABTestResponse])
async def list_ab_tests():
    import random
    import time

    current_time = int(time.time())
    random.seed(current_time)

    experiments = [
        {
            "experiment_id": exp_id,
            "variants": exp["variants"],
            "stats": {
                v: {
                    "starts": exp["starts"][v] + random.randint(-5, 15),
                    "conversions": exp["conversions"][v] + random.randint(-2, 5),
                    "conversion_rate": round(
                        (exp["conversions"][v] + random.randint(-2, 5))
                        / max(exp["starts"][v] + random.randint(-5, 15), 1)
                        * 100,
                        2,
                    ),
                }
                for v in exp["variants"]
            },
            "winner": ab_memory.get_winner(exp_id),
            "total_samples": sum(exp["starts"].values()) + random.randint(0, 20),
        }
        for exp_id, exp in ab_memory.experiments.items()
    ]
    return experiments


@app.get("/api/ab-tests/{experiment_id}")
async def get_ab_test(experiment_id: str):
    if experiment_id not in ab_memory.experiments:
        raise HTTPException(status_code=404, detail="Experiment not found")

    exp = ab_memory.experiments[experiment_id]
    stats = {}
    for v in exp["variants"]:
        starts = exp["starts"][v] or 1
        stats[v] = {
            "starts": exp["starts"][v],
            "conversions": exp["conversions"][v],
            "conversion_rate": round(exp["conversions"][v] / starts * 100, 2),
        }

    return ABTestResponse(
        experiment_id=experiment_id,
        variants=exp["variants"],
        stats=stats,
        winner=ab_memory.get_winner(experiment_id),
        total_samples=sum(exp["starts"].values()),
    )


@app.get("/api/system/health", response_model=SystemHealthResponse)
async def system_health():
    import random
    import time

    current_time = int(time.time())
    random.seed(current_time)

    drift_result = drift_detector.detect_drift()

    live_metrics = {
        "accuracy": round(MODEL_METRICS["accuracy"] + random.uniform(-0.02, 0.02), 3),
        "precision": round(MODEL_METRICS["precision"] + random.uniform(-0.02, 0.02), 3),
        "recall": round(MODEL_METRICS["recall"] + random.uniform(-0.02, 0.02), 3),
        "f1": round(MODEL_METRICS["f1"] + random.uniform(-0.02, 0.02), 3),
        "auc_roc": round(MODEL_METRICS["auc_roc"] + random.uniform(-0.01, 0.01), 3),
        "last_trained": MODEL_METRICS["last_trained"],
        "drift_score": drift_result.get("has_drift", False) or random.random() > 0.9,
        "drift_severity": drift_result["drift_severity"],
    }

    return SystemHealthResponse(
        status="operational"
        if drift_result["drift_severity"] != "high"
        else "degraded",
        model_metrics=live_metrics,
        drift_alerts=drift_result["alerts"],
        uptime_seconds=3600 + random.randint(0, 100),
        active_connections=len(event_bus.subscribers) + random.randint(-2, 5),
    )


@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await event_bus.subscribe(websocket)

    try:
        await websocket.send_json(
            {
                "event_id": "connected",
                "event_type": "system",
                "timestamp": datetime.now().isoformat(),
                "data": {"message": "Connected to event stream"},
            }
        )

        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except:
                pass
    except WebSocketDisconnect:
        await event_bus.unsubscribe(websocket)


@app.websocket("/ws/ai-decisions")
async def ai_websocket(websocket: WebSocket):
    await websocket.accept()

    try:
        await event_bus.subscribe(websocket)

        while True:
            await asyncio.sleep(5)

            user = MOCK_USERS[int(datetime.now().timestamp()) % len(MOCK_USERS)]
            decision = await ai_service.analyze_user(user["user_id"])

            await websocket.send_json(
                {
                    "event_type": "ai_decision",
                    "timestamp": datetime.now().isoformat(),
                    "data": {
                        "user_id": user["user_id"],
                        "user_name": user["name"],
                        "risk_score": decision.get("risk_score", 0.5),
                        "risk_level": decision.get("risk_level", "medium"),
                        "action": decision.get("action_type", "monitor"),
                        "confidence": decision.get("confidence", 0.8),
                    },
                }
            )
    except WebSocketDisconnect:
        await event_bus.unsubscribe(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
