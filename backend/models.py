import asyncio
import json
import random
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass, asdict
from enum import Enum


class ChurnRiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class User:
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
    risk_factors: list


@dataclass
class ChurnEvent:
    event_id: str
    user_id: str
    event_type: str
    timestamp: str
    data: dict


@dataclass
class AIDecision:
    decision_id: str
    user_id: str
    risk_score: float
    reasoning: str
    action_type: str
    action_details: dict
    confidence: float
    timestamp: str


def generate_mock_users(count: int = 1000) -> list:
    users = []
    first_names = [
        "James",
        "Emma",
        "Liam",
        "Olivia",
        "Noah",
        "Ava",
        "William",
        "Sophia",
        "Benjamin",
        "Isabella",
        "Lucas",
        "Mia",
        "Henry",
        "Charlotte",
        "Alexander",
        "Amelia",
        "Mason",
        "Harper",
        "Ethan",
        "Evelyn",
    ]
    last_names = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
        "Hernandez",
        "Lopez",
        "Gonzalez",
        "Wilson",
        "Anderson",
        "Thomas",
        "Taylor",
        "Moore",
        "Jackson",
        "Martin",
    ]
    plans = ["free", "basic", "premium", "enterprise"]
    risk_levels = ["low", "medium", "high", "critical"]

    for i in range(count):
        user_id = f"USR_{str(i + 1).zfill(5)}"
        first = random.choice(first_names)
        last = random.choice(last_names)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{random.randint(1, 999)}@example.com"
        phone = f"+1{random.randint(2000000000, 9999999999)}"
        plan = random.choice(plans)

        join_days_ago = random.randint(30, 730)
        join_date = (datetime.now() - timedelta(days=join_days_ago)).isoformat()

        last_login_days_ago = random.randint(0, 30)
        last_login = (datetime.now() - timedelta(days=last_login_days_ago)).isoformat()

        login_frequency = random.randint(0, 60)
        total_purchases = random.randint(0, 50)

        purchase_days_ago = random.randint(0, 60) if total_purchases > 0 else 999
        last_purchase_date = (
            datetime.now() - timedelta(days=purchase_days_ago)
        ).isoformat()

        avg_session = round(random.uniform(1, 120), 1)
        support_tickets = random.randint(0, 10)
        email_opens = random.randint(0, 100)
        push_enabled = random.choice([True, False])

        engagement_score = round(random.uniform(20, 100), 1)

        if login_frequency < 5 and support_tickets > 3:
            churn_risk = round(random.uniform(0.75, 0.99), 2)
            risk_level = "critical"
        elif login_frequency < 15 or total_purchases == 0:
            churn_risk = round(random.uniform(0.5, 0.75), 2)
            risk_level = "high"
        elif login_frequency < 30:
            churn_risk = round(random.uniform(0.25, 0.5), 2)
            risk_level = "medium"
        else:
            churn_risk = round(random.uniform(0.01, 0.25), 2)
            risk_level = "low"

        risk_factors = []
        if login_frequency < 15:
            risk_factors.append(f"Low login frequency ({login_frequency} days)")
        if purchase_days_ago > 30:
            risk_factors.append(f"No purchases in {purchase_days_ago} days")
        if support_tickets > 3:
            risk_factors.append(f"High support tickets ({support_tickets})")
        if email_opens < 20:
            risk_factors.append(f"Low email engagement ({email_opens}%)")
        if avg_session < 10:
            risk_factors.append(f"Short session duration ({avg_session} min)")

        user = User(
            user_id=user_id,
            name=name,
            email=email,
            phone=phone,
            plan_type=plan,
            join_date=join_date,
            last_login=last_login,
            login_frequency=login_frequency,
            total_purchases=total_purchases,
            last_purchase_date=last_purchase_date,
            avg_session_duration=avg_session,
            support_tickets=support_tickets,
            email_opens=email_opens,
            push_enabled=push_enabled,
            engagement_score=engagement_score,
            churn_risk=churn_risk,
            risk_level=risk_level,
            risk_factors=risk_factors,
        )
        users.append(asdict(user))

    return users


MOCK_USERS = generate_mock_users(1000)


def get_user_by_id(user_id: str) -> Optional[dict]:
    for user in MOCK_USERS:
        if user["user_id"] == user_id:
            return user
    return None


def get_users_by_risk(risk_level: str = None, limit: int = 50) -> list:
    users = MOCK_USERS
    if risk_level:
        users = [u for u in users if u["risk_level"] == risk_level]
    return sorted(users, key=lambda x: x["churn_risk"], reverse=True)[:limit]


def get_high_risk_users(limit: int = 100) -> list:
    return sorted(MOCK_USERS, key=lambda x: x["churn_risk"], reverse=True)[:limit]


def generate_event_stream():
    event_types = [
        ("user_login", "User logged in"),
        ("user_logout", "User logged out"),
        ("purchase", "Purchase completed"),
        ("cart_abandoned", "Cart abandoned"),
        ("support_ticket", "Support ticket opened"),
        ("email_open", "Email opened"),
        ("feature_used", "Feature used"),
        ("churn_risk_increase", "Churn risk increased"),
        ("churn_risk_decrease", "Churn risk decreased"),
    ]

    while True:
        user = random.choice(MOCK_USERS[:100])
        event_type, description = random.choice(event_types)

        event = ChurnEvent(
            event_id=f"EVT_{datetime.now().timestamp()}_{random.randint(1000, 9999)}",
            user_id=user["user_id"],
            event_type=event_type,
            timestamp=datetime.now().isoformat(),
            data={
                "user_name": user["name"],
                "churn_risk": user["churn_risk"],
                "risk_level": user["risk_level"],
                "description": description,
            },
        )
        yield asdict(event)


class EventBus:
    def __init__(self):
        self.subscribers = []
        self.events = []
        self.max_events = 1000

    async def subscribe(self, websocket):
        self.subscribers.append(websocket)

    async def unsubscribe(self, websocket):
        if websocket in self.subscribers:
            self.subscribers.remove(websocket)

    async def publish(self, event: dict):
        self.events.append(event)
        if len(self.events) > self.max_events:
            self.events.pop(0)

        for subscriber in self.subscribers:
            try:
                await subscriber.send_json(event)
            except:
                pass

    def get_recent_events(self, limit: int = 100) -> list:
        return self.events[-limit:]


event_bus = EventBus()


class ABMemory:
    def __init__(self):
        self.experiments = {}
        self.conversions = {}
        self.rewards = {}

    def create_experiment(self, experiment_id: str, variants: list):
        self.experiments[experiment_id] = {
            "variants": variants,
            "starts": {v: 0 for v in variants},
            "conversions": {v: 0 for v in variants},
            "created_at": datetime.now().isoformat(),
        }
        for v in variants:
            self.conversions[f"{experiment_id}_{v}"] = 0
            self.rewards[f"{experiment_id}_{v}"] = []

    def record_start(self, experiment_id: str, variant: str):
        if experiment_id in self.experiments:
            self.experiments[experiment_id]["starts"][variant] += 1

    def record_conversion(self, experiment_id: str, variant: str, reward: float = 1.0):
        if experiment_id in self.experiments:
            self.experiments[experiment_id]["conversions"][variant] += 1
            key = f"{experiment_id}_{variant}"
            self.conversions[key] = self.conversions.get(key, 0) + 1
            self.rewards[key].append(reward)

    def get_winner(self, experiment_id: str) -> str:
        if experiment_id not in self.experiments:
            return None
        exp = self.experiments[experiment_id]
        best_variant = None
        best_rate = -1
        for v in exp["variants"]:
            starts = exp["starts"][v] or 1
            conversions = exp["conversions"][v]
            rate = conversions / starts
            if rate > best_rate:
                best_rate = rate
                best_variant = v
        return best_variant

    def get_experiment_stats(self, experiment_id: str) -> dict:
        if experiment_id not in self.experiments:
            return {}
        exp = self.experiments[experiment_id]
        stats = {}
        for v in exp["variants"]:
            starts = exp["starts"][v] or 1
            conversions = exp["conversions"][v]
            stats[v] = {
                "starts": starts,
                "conversions": conversions,
                "conversion_rate": round(conversions / starts * 100, 2),
            }
        return stats


ab_memory = ABMemory()

ab_memory.create_experiment(
    "offer_test", ["discount_10", "discount_20", "discount_30", "no_offer"]
)
ab_memory.create_experiment("channel_test", ["email", "sms", "push", "no_contact"])
ab_memory.create_experiment(
    "message_test", ["urgent", "friendly", "discount", "no_message"]
)

DRIFT_HISTORY = []
MODEL_METRICS = {
    "accuracy": 0.87,
    "precision": 0.89,
    "recall": 0.85,
    "f1": 0.87,
    "auc_roc": 0.92,
    "last_trained": (datetime.now() - timedelta(days=2)).isoformat(),
}

DIGITAL_TWINS = {}


def create_digital_twin(user_id: str) -> dict:
    user = get_user_by_id(user_id)
    if not user:
        return None

    twin = {
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "current_state": user.copy(),
        "simulations": [],
    }
    DIGITAL_TWINS[user_id] = twin
    return twin


def simulate_action(user_id: str, action: str, params: dict) -> dict:
    user = get_user_by_id(user_id)
    if not user:
        return {"error": "User not found"}

    base_retention = user["engagement_score"] / 100

    outcomes = {
        "send_discount": {
            "retention_change": 0.25,
            "revenue_impact": -50,
            "success_prob": 0.78,
        },
        "send_loyalty_offer": {
            "retention_change": 0.20,
            "revenue_impact": -30,
            "success_prob": 0.72,
        },
        "personalized_email": {
            "retention_change": 0.15,
            "revenue_impact": 0,
            "success_prob": 0.65,
        },
        "push_notification": {
            "retention_change": 0.10,
            "revenue_impact": 0,
            "success_prob": 0.55,
        },
        "no_action": {"retention_change": 0, "revenue_impact": 0, "success_prob": 0},
        "premium_feature_trial": {
            "retention_change": 0.30,
            "revenue_impact": 0,
            "success_prob": 0.70,
        },
        "win_back_call": {
            "retention_change": 0.35,
            "revenue_impact": -20,
            "success_prob": 0.60,
        },
    }

    outcome = outcomes.get(action, outcomes["no_action"])

    predicted_retention = min(1.0, base_retention + outcome["retention_change"])
    predicted_churn = max(0, user["churn_risk"] - outcome["retention_change"] * 0.5)

    simulation = {
        "simulation_id": f"SIM_{datetime.now().timestamp()}",
        "action": action,
        "params": params,
        "predicted_retention": round(predicted_retention * 100, 1),
        "predicted_churn_risk": round(predicted_churn, 2),
        "revenue_impact": outcome["revenue_impact"],
        "success_probability": outcome["success_prob"] * 100,
        "timestamp": datetime.now().isoformat(),
    }

    if user_id in DIGITAL_TWINS:
        DIGITAL_TWINS[user_id]["simulations"].append(simulation)

    return simulation
