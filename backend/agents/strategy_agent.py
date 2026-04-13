import random
from typing import Dict, Any, List


class StrategyAgent:
    def __init__(self):
        self.strategy_templates = {
            "critical": {
                "primary_action": "urgent_intervention",
                "channels": ["sms", "email", "push", "phone"],
                "urgency": "immediate",
                "offer_type": "significant_discount",
                "retention_goal": 0.7,
            },
            "high": {
                "primary_action": "aggressive_retention",
                "channels": ["email", "push", "sms"],
                "urgency": "within_24h",
                "offer_type": "discount_or_trial",
                "retention_goal": 0.6,
            },
            "medium": {
                "primary_action": "engagement_boost",
                "channels": ["email", "push"],
                "urgency": "within_week",
                "offer_type": "feature_highlight",
                "retention_goal": 0.5,
            },
            "low": {
                "primary_action": "monitor_and_nurture",
                "channels": ["email"],
                "urgency": "when_needed",
                "offer_type": "loyalty_benefit",
                "retention_goal": 0.3,
            },
        }

        self.action_effectiveness = {
            "send_discount": {"base_retention": 0.25, "cost": 50, "success_rate": 0.78},
            "send_loyalty_offer": {
                "base_retention": 0.20,
                "cost": 30,
                "success_rate": 0.72,
            },
            "personalized_email": {
                "base_retention": 0.15,
                "cost": 5,
                "success_rate": 0.65,
            },
            "push_notification": {
                "base_retention": 0.10,
                "cost": 2,
                "success_rate": 0.55,
            },
            "premium_feature_trial": {
                "base_retention": 0.30,
                "cost": 0,
                "success_rate": 0.70,
            },
            "win_back_call": {
                "base_retention": 0.35,
                "cost": 100,
                "success_rate": 0.60,
            },
            "no_action": {"base_retention": 0, "cost": 0, "success_rate": 0},
        }

    async def decide(
        self, user: Dict[str, Any], risk_result: Dict, behavior_result: Dict
    ) -> Dict[str, Any]:
        risk_level = risk_result.get("risk_level", "medium")
        segment = behavior_result.get("segment", {}).get("segment", "general")
        value_tier = behavior_result.get("segment", {}).get(
            "value_tier", "medium_value"
        )

        strategy = self.strategy_templates.get(
            risk_level, self.strategy_templates["medium"]
        )

        if value_tier == "high_value" and risk_level in ["critical", "high"]:
            priority = "critical"
            max_budget = 200
        elif value_tier == "medium_value" and risk_level in ["critical", "high"]:
            priority = "high"
            max_budget = 100
        else:
            priority = risk_level
            max_budget = 50

        selected_actions = self._select_optimal_actions(user, strategy, max_budget)

        reasoning = self._generate_reasoning(
            user, risk_result, behavior_result, strategy
        )

        return {
            "strategy": strategy,
            "priority": priority,
            "selected_actions": selected_actions,
            "reasoning": reasoning,
            "confidence": random.uniform(0.75, 0.95),
            "estimated_retention_lift": sum(
                a["expected_retention"] for a in selected_actions
            ),
            "estimated_cost": sum(a["estimated_cost"] for a in selected_actions),
        }

    def _select_optimal_actions(
        self, user: Dict[str, Any], strategy: Dict, max_budget: float
    ) -> List[Dict[str, Any]]:
        available_actions = list(self.action_effectiveness.keys())
        selected = []
        remaining_budget = max_budget

        plan = user.get("plan_type", "free")
        engagement = user.get("engagement_score", 50)
        days_inactive = user.get("login_frequency", 0)

        if plan == "enterprise":
            primary_action = "win_back_call"
        elif plan == "premium":
            primary_action = (
                "premium_feature_trial"
                if random.random() > 0.3
                else "send_loyalty_offer"
            )
        elif days_inactive > 30:
            primary_action = (
                "send_discount" if remaining_budget >= 50 else "personalized_email"
            )
        elif engagement < 30:
            primary_action = "premium_feature_trial"
        else:
            primary_action = random.choice(
                ["send_loyalty_offer", "personalized_email", "push_notification"]
            )

        action_data = self.action_effectiveness.get(
            primary_action, self.action_effectiveness["no_action"]
        )

        selected.append(
            {
                "action": primary_action,
                "expected_retention": action_data["base_retention"],
                "estimated_cost": action_data["cost"],
                "success_probability": action_data["success_rate"],
                "channel": strategy["channels"][0],
                "sequence_order": 1,
            }
        )
        remaining_budget -= action_data["cost"]

        if remaining_budget > 20 and strategy["primary_action"] in [
            "urgent_intervention",
            "aggressive_retention",
        ]:
            secondary = random.choice(["push_notification", "personalized_email"])
            secondary_data = self.action_effectiveness[secondary]
            selected.append(
                {
                    "action": secondary,
                    "expected_retention": secondary_data["base_retention"] * 0.5,
                    "estimated_cost": secondary_data["cost"],
                    "success_probability": secondary_data["success_rate"],
                    "channel": strategy["channels"][1]
                    if len(strategy["channels"]) > 1
                    else "email",
                    "sequence_order": 2,
                }
            )

        return selected

    def _generate_reasoning(
        self, user: Dict, risk_result: Dict, behavior_result: Dict, strategy: Dict
    ) -> str:
        risk_level = risk_result.get("risk_level", "medium")
        segment = behavior_result.get("segment", {}).get("segment", "unknown")
        top_patterns = [p["type"] for p in behavior_result.get("patterns", [])[:2]]

        reasoning_parts = [
            f"User {user['user_id']} classified as {risk_level.upper()} churn risk.",
            f"Behavior segment: {segment}.",
            f"Primary concern: {', '.join(top_patterns) if top_patterns else 'general disengagement'}.",
            f"Recommended action: {strategy['primary_action'].replace('_', ' ')}.",
            f"Target engagement through {strategy['channels'][0]} with {strategy['offer_type']}.",
        ]

        return " ".join(reasoning_parts)


strategy_agent_instance = StrategyAgent()
