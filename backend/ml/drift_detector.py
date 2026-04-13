import numpy as np
import random
from typing import Dict, Any, List
from datetime import datetime, timedelta


class DriftDetector:
    def __init__(self):
        self.baseline_metrics = {
            "feature_drift_threshold": 0.05,
            "prediction_drift_threshold": 0.10,
            "volume_drift_threshold": 0.25,
        }
        self.history = []
        self.alert_count = 0

    def detect_drift(self, current_metrics: Dict[str, Any] = None) -> Dict[str, Any]:
        if current_metrics is None:
            current_metrics = self._generate_mock_metrics()

        feature_drift = current_metrics.get("feature_drift", random.uniform(0, 0.15))
        prediction_drift = current_metrics.get(
            "prediction_drift", random.uniform(0, 0.20)
        )
        volume_change = current_metrics.get("volume_change", random.uniform(-0.3, 0.3))

        alerts = []

        if feature_drift > self.baseline_metrics["feature_drift_threshold"]:
            alerts.append(
                {
                    "type": "feature_drift",
                    "severity": "high" if feature_drift > 0.10 else "medium",
                    "message": f"Feature distribution shifted by {feature_drift:.2%}",
                    "recommendation": "Consider retraining model with recent data",
                }
            )

        if prediction_drift > self.baseline_metrics["prediction_drift_threshold"]:
            alerts.append(
                {
                    "type": "prediction_drift",
                    "severity": "high" if prediction_drift > 0.15 else "medium",
                    "message": f"Prediction patterns changed by {prediction_drift:.2%}",
                    "recommendation": "Monitor model accuracy closely",
                }
            )

        if abs(volume_change) > self.baseline_metrics["volume_drift_threshold"]:
            alerts.append(
                {
                    "type": "volume_drift",
                    "severity": "medium",
                    "message": f"Event volume changed by {volume_change:.2%}",
                    "recommendation": "Check for data pipeline issues",
                }
            )

        self.history.append(
            {
                "timestamp": datetime.now().isoformat(),
                "metrics": current_metrics,
                "alerts": alerts,
            }
        )

        if len(self.history) > 1000:
            self.history.pop(0)

        self.alert_count = sum(1 for h in self.history[-10:] if h["alerts"])

        return {
            "timestamp": datetime.now().isoformat(),
            "has_drift": len(alerts) > 0,
            "drift_severity": self._calculate_severity(alerts),
            "alerts": alerts,
            "recommendations": self._get_recommendations(alerts),
            "history_length": len(self.history),
            "recent_alert_rate": self.alert_count / 10,
        }

    def _generate_mock_metrics(self) -> Dict[str, float]:
        return {
            "feature_drift": random.uniform(0, 0.12),
            "prediction_drift": random.uniform(0, 0.18),
            "volume_change": random.uniform(-0.4, 0.4),
            "data_freshness": random.uniform(0.8, 1.0),
        }

    def _calculate_severity(self, alerts: List[Dict]) -> str:
        if not alerts:
            return "none"
        if any(a["severity"] == "high" for a in alerts):
            return "high"
        if any(a["severity"] == "medium" for a in alerts):
            return "medium"
        return "low"

    def _get_recommendations(self, alerts: List[Dict]) -> List[str]:
        recommendations = []

        for alert in alerts:
            if alert["type"] == "feature_drift":
                recommendations.append("Retrain model with latest data samples")
            if alert["type"] == "prediction_drift":
                recommendations.append("Review and update feature engineering pipeline")
            if alert["type"] == "volume_drift":
                recommendations.append("Audit data collection and ingestion systems")

        if not recommendations:
            recommendations.append("Continue monitoring - no action required")

        return recommendations

    def get_model_health(self) -> Dict[str, Any]:
        recent_alerts = sum(1 for h in self.history[-10:] if h["alerts"])
        drift_trend = (
            "increasing"
            if recent_alerts > 3
            else "stable"
            if recent_alerts > 1
            else "decreasing"
        )

        return {
            "overall_health": "healthy"
            if recent_alerts < 2
            else "degraded"
            if recent_alerts < 5
            else "critical",
            "drift_trend": drift_trend,
            "days_since_retraining": random.randint(1, 14),
            "model_version": "v2.1.4",
            "last_retraining": (
                datetime.now() - timedelta(days=random.randint(1, 14))
            ).isoformat(),
            "recommended_action": "retrain"
            if recent_alerts > 4
            else "monitor"
            if recent_alerts > 2
            else "none",
        }


drift_detector = DriftDetector()
