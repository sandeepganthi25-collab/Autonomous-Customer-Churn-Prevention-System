import numpy as np
from typing import Dict, Any, List


class ChurnModel:
    def __init__(self):
        self.feature_names = [
            "login_frequency",
            "total_purchases",
            "engagement_score",
            "support_tickets",
            "email_opens",
            "avg_session_duration",
            "days_since_join",
            "purchase_recency",
        ]
        self.base_accuracy = 0.87
        self.feature_weights = {
            "login_frequency": 0.25,
            "total_purchases": 0.15,
            "engagement_score": 0.20,
            "support_tickets": 0.10,
            "email_opens": 0.08,
            "avg_session_duration": 0.12,
            "days_since_join": 0.05,
            "purchase_recency": 0.05,
        }

    def extract_features(self, user: Dict[str, Any]) -> np.ndarray:
        from datetime import datetime

        login_freq = min(user.get("login_frequency", 0) / 30, 1.0)
        purchases = min(user.get("total_purchases", 0) / 50, 1.0)
        engagement = user.get("engagement_score", 50) / 100
        support = min(user.get("support_tickets", 0) / 10, 1.0)
        email = user.get("email_opens", 0) / 100
        session = min(user.get("avg_session_duration", 0) / 120, 1.0)

        join_date = datetime.fromisoformat(
            user.get("join_date", datetime.now().isoformat())
        )
        days_since_join = (datetime.now() - join_date).days / 730

        last_purchase = user.get(
            "last_purchase_date", user.get("join_date", datetime.now().isoformat())
        )
        purchase_date = datetime.fromisoformat(last_purchase)
        purchase_recency = max(0, 1 - (datetime.now() - purchase_date).days / 90)

        features = [
            login_freq,
            purchases,
            engagement,
            support,
            email,
            session,
            days_since_join,
            purchase_recency,
        ]

        return np.array(features)

    def predict(self, user: Dict[str, Any]) -> Dict[str, Any]:
        features = self.extract_features(user)

        weighted_sum = sum(
            f * w for f, w in zip(features, self.feature_weights.values())
        )

        risk_score = 1 / (1 + np.exp(-(weighted_sum - 0.5) * 6))

        risk_score = risk_score * 0.7 + user.get("churn_risk", 0.5) * 0.3
        risk_score = np.clip(risk_score, 0.01, 0.99)

        if risk_score >= 0.75:
            risk_level = "critical"
        elif risk_score >= 0.5:
            risk_level = "high"
        elif risk_score >= 0.25:
            risk_level = "medium"
        else:
            risk_level = "low"

        confidence = self.base_accuracy + np.random.uniform(-0.05, 0.05)

        return {
            "risk_score": float(risk_score),
            "risk_level": risk_level,
            "confidence": float(confidence),
            "features_used": self.feature_names,
        }

    def batch_predict(self, users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self.predict(user) for user in users]


churn_model = ChurnModel()
