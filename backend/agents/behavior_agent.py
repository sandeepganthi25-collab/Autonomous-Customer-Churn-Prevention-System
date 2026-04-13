import random
from typing import Dict, Any, List
from datetime import datetime, timedelta


class BehaviorAgent:
    def __init__(self):
        self.pattern_cache = {}

    async def analyze(self, user: Dict[str, Any]) -> Dict[str, Any]:
        patterns = self._identify_patterns(user)
        trends = self._analyze_trends(user)
        segments = self._classify_segment(user)

        return {
            "patterns": patterns,
            "trends": trends,
            "segment": segments,
            "behavior_score": self._calculate_behavior_score(user, patterns, trends),
            "next_expected_action": self._predict_next_action(user),
        }

    def _identify_patterns(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        patterns = []

        if user.get("login_frequency", 0) < 7:
            patterns.append(
                {
                    "type": "declining_engagement",
                    "severity": "high",
                    "description": "User showing significant decline in login frequency",
                }
            )

        if user.get("total_purchases", 0) > 0:
            purchase_gap = (
                datetime.now()
                - datetime.fromisoformat(
                    user.get("last_purchase_date", datetime.now().isoformat())
                )
            ).days
            if purchase_gap > 30:
                patterns.append(
                    {
                        "type": "purchase_dry_spell",
                        "severity": "medium",
                        "description": f"No purchase activity for {purchase_gap} days",
                    }
                )

        if user.get("support_tickets", 0) > 5:
            patterns.append(
                {
                    "type": "high_support_need",
                    "severity": "high",
                    "description": "User frequently opens support tickets - potential friction points",
                }
            )

        if user.get("email_opens", 0) < 20:
            patterns.append(
                {
                    "type": "low_email_engagement",
                    "severity": "medium",
                    "description": "User rarely opens marketing/emails",
                }
            )

        session = user.get("avg_session_duration", 0)
        if session < 5:
            patterns.append(
                {
                    "type": "short_sessions",
                    "severity": "medium",
                    "description": "User sessions are very short - quick visits only",
                }
            )
        elif session > 60:
            patterns.append(
                {
                    "type": "power_user",
                    "severity": "low",
                    "description": "High engagement with long sessions",
                }
            )

        return patterns

    def _analyze_trends(self, user: Dict[str, Any]) -> Dict[str, str]:
        engagement = user.get("engagement_score", 50)

        if engagement > 70:
            trend = "improving"
            trend_score = engagement + random.uniform(5, 15)
        elif engagement > 40:
            trend = "stable"
            trend_score = engagement + random.uniform(-5, 5)
        else:
            trend = "declining"
            trend_score = engagement - random.uniform(5, 15)

        return {
            "direction": trend,
            "score": round(trend_score, 1),
            "momentum": "accelerating" if random.random() > 0.5 else "slowing",
        }

    def _classify_segment(self, user: Dict[str, Any]) -> Dict[str, Any]:
        engagement = user.get("engagement_score", 50)
        purchases = user.get("total_purchases", 0)
        plan = user.get("plan_type", "free")

        if plan == "enterprise" and engagement > 60:
            segment = "enterprise_power_user"
            value_tier = "high_value"
        elif plan == "premium" and purchases > 10:
            segment = "loyal_premium"
            value_tier = "high_value"
        elif plan == "basic" and engagement > 50:
            segment = "satisfied_basic"
            value_tier = "medium_value"
        elif engagement < 30 and purchases < 3:
            segment = "at_risk_inactive"
            value_tier = "low_value"
        elif purchases == 0:
            segment = "trial_at_risk"
            value_tier = "needs_activation"
        else:
            segment = "general_at_risk"
            value_tier = "medium_value"

        return {
            "segment": segment,
            "value_tier": value_tier,
            "retention_priority": "critical"
            if value_tier == "high_value"
            else "standard",
        }

    def _calculate_behavior_score(
        self, user: Dict[str, Any], patterns: List, trends: Dict
    ) -> float:
        base_score = user.get("engagement_score", 50)

        pattern_penalty = sum(
            p.get("severity") == "high"
            and 15
            or p.get("severity") == "medium"
            and 8
            or 2
            for p in patterns
        )

        if trends["direction"] == "improving":
            adjustment = 10
        elif trends["direction"] == "declining":
            adjustment = -10
        else:
            adjustment = 0

        final_score = max(0, min(100, base_score - pattern_penalty + adjustment))
        return round(final_score, 1)

    def _predict_next_action(self, user: Dict[str, Any]) -> Dict[str, Any]:
        risk = user.get("churn_risk", 0.5)
        engagement = user.get("engagement_score", 50)

        if risk > 0.7:
            predicted = "churn"
            confidence = 0.85
        elif risk > 0.5:
            predicted = "reduce_usage" if engagement < 40 else "explore_features"
            confidence = 0.70
        elif engagement > 70:
            predicted = "upgrade_plan"
            confidence = 0.65
        else:
            predicted = "maintain_status"
            confidence = 0.60

        return {
            "action": predicted,
            "confidence": confidence,
            "reasoning": f"Based on {user.get('risk_level', 'medium')} risk level and {engagement}% engagement",
        }


behavior_agent_instance = BehaviorAgent()
