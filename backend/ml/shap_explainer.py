import numpy as np
from typing import Dict, Any, List


class SHAPExplainer:
    def __init__(self):
        self.background_data = self._generate_background()
        self.expected_value = 0.25

    def _generate_background(self, n_samples: int = 100) -> np.ndarray:
        return np.random.rand(n_samples, 8)

    def explain_prediction(
        self, user: Dict[str, Any], base_risk: float = None
    ) -> Dict[str, Any]:
        if base_risk is None:
            base_risk = user.get("churn_risk", 0.5)

        shap_values = self._calculate_shap_values(user)

        positive_factors = [(k, v) for k, v in shap_values.items() if v > 0]
        negative_factors = [(k, v) for k, v in shap_values.items() if v < 0]

        positive_factors.sort(key=lambda x: x[1], reverse=True)
        negative_factors.sort(key=lambda x: x[1])

        return {
            "base_value": base_risk,
            "shap_values": shap_values,
            "prediction": base_risk,
            "top_positive_contributors": [
                {"feature": k, "impact": round(v, 4)} for k, v in positive_factors[:3]
            ],
            "top_negative_contributors": [
                {"feature": k, "impact": round(v, 4)} for k, v in negative_factors[:3]
            ],
            "explanation": self._generate_explanation(shap_values, user),
        }

    def _calculate_shap_values(self, user: Dict[str, Any]) -> Dict[str, float]:
        from datetime import datetime

        feature_impacts = {
            "login_frequency": 0,
            "total_purchases": 0,
            "engagement_score": 0,
            "support_tickets": 0,
            "email_opens": 0,
            "avg_session_duration": 0,
            "days_since_join": 0,
            "purchase_recency": 0,
        }

        login_freq = user.get("login_frequency", 0)
        if login_freq < 7:
            feature_impacts["login_frequency"] = 0.20
        elif login_freq < 14:
            feature_impacts["login_frequency"] = 0.12
        elif login_freq < 30:
            feature_impacts["login_frequency"] = 0.05
        else:
            feature_impacts["login_frequency"] = -0.08

        purchases = user.get("total_purchases", 0)
        if purchases == 0:
            feature_impacts["total_purchases"] = 0.15
        elif purchases < 5:
            feature_impacts["total_purchases"] = 0.08
        else:
            feature_impacts["total_purchases"] = -0.10

        engagement = user.get("engagement_score", 50)
        if engagement < 30:
            feature_impacts["engagement_score"] = 0.18
        elif engagement < 50:
            feature_impacts["engagement_score"] = 0.08
        elif engagement < 70:
            feature_impacts["engagement_score"] = -0.05
        else:
            feature_impacts["engagement_score"] = -0.12

        support = user.get("support_tickets", 0)
        if support > 5:
            feature_impacts["support_tickets"] = 0.12
        elif support > 3:
            feature_impacts["support_tickets"] = 0.06
        else:
            feature_impacts["support_tickets"] = -0.03

        email = user.get("email_opens", 50)
        if email < 20:
            feature_impacts["email_opens"] = 0.07
        elif email < 50:
            feature_impacts["email_opens"] = 0.02
        else:
            feature_impacts["email_opens"] = -0.05

        session = user.get("avg_session_duration", 30)
        if session < 5:
            feature_impacts["avg_session_duration"] = 0.10
        elif session < 15:
            feature_impacts["avg_session_duration"] = 0.04
        else:
            feature_impacts["avg_session_duration"] = -0.06

        join_date = datetime.fromisoformat(
            user.get("join_date", datetime.now().isoformat())
        )
        days_since = (datetime.now() - join_date).days
        if days_since < 30:
            feature_impacts["days_since_join"] = 0.05
        elif days_since < 180:
            feature_impacts["days_since_join"] = -0.02
        else:
            feature_impacts["days_since_join"] = -0.05

        last_purchase = user.get(
            "last_purchase_date", user.get("join_date", datetime.now().isoformat())
        )
        purchase_days = (datetime.now() - datetime.fromisoformat(last_purchase)).days
        if purchase_days > 60:
            feature_impacts["purchase_recency"] = 0.15
        elif purchase_days > 30:
            feature_impacts["purchase_recency"] = 0.08
        elif purchase_days > 14:
            feature_impacts["purchase_recency"] = 0.02
        else:
            feature_impacts["purchase_recency"] = -0.08

        return {k: round(v, 4) for k, v in feature_impacts.items()}

    def _generate_explanation(
        self, shap_values: Dict[str, float], user: Dict[str, Any]
    ) -> str:
        top_positive = sorted(
            [(k, v) for k, v in shap_values.items() if v > 0],
            key=lambda x: x[1],
            reverse=True,
        )[:2]
        top_negative = sorted(
            [(k, v) for k, v in shap_values.items() if v < 0], key=lambda x: x[1]
        )[:1]

        reasons = []

        if top_positive:
            for feature, impact in top_positive:
                if feature == "login_frequency":
                    reasons.append(
                        f"Low activity ({user.get('login_frequency', 0)} days since last login)"
                    )
                elif feature == "engagement_score":
                    reasons.append(
                        f"Low engagement score ({user.get('engagement_score', 0)}%)"
                    )
                elif feature == "total_purchases":
                    reasons.append(f"Limited purchase history")
                elif feature == "support_tickets":
                    reasons.append(f"High support ticket volume")
                elif feature == "purchase_recency":
                    reasons.append("No recent purchases")

        if top_negative:
            for feature, impact in top_negative:
                if feature == "engagement_score":
                    reasons.append("Strong engagement history")

        if not reasons:
            reasons.append("Mixed behavioral signals")

        return "; ".join(reasons)


shap_explainer = SHAPExplainer()
