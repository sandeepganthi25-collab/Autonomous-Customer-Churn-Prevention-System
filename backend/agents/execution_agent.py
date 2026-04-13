import random
from typing import Dict, Any, List
from datetime import datetime


class ExecutionAgent:
    def __init__(self):
        self.message_templates = {
            "send_discount": {
                "email": "We miss you! Here's 25% off your next purchase. Valid for 48 hours.",
                "sms": "Hey {name}! Exclusive 25% off code: COMEBACK25. Limited time offer!",
                "push": "We noticed you've been away. Claim your special discount!",
                "subject": "We Want You Back - Special Offer Inside!",
            },
            "send_loyalty_offer": {
                "email": "As a valued member, enjoy exclusive loyalty rewards just for you!",
                "sms": "Hi {name}! Your loyalty points are waiting. Redeem now for a special treat!",
                "push": "You have new loyalty rewards to claim!",
                "subject": "Loyalty Rewards - Exclusive for You!",
            },
            "personalized_email": {
                "email": "Hey {name}, we noticed you haven't been around. Here's what's new...",
                "sms": "Hey {name}! Check out the new features we've added.",
                "push": "New features available! Tap to explore.",
                "subject": "Something New Just for You, {name}!",
            },
            "push_notification": {
                "email": "",
                "sms": "",
                "push": "We have exciting updates waiting for you!",
                "subject": "",
            },
            "premium_feature_trial": {
                "email": "Try our Premium features free for 14 days - no credit card needed!",
                "sms": "Hi {name}! Free 14-day premium trial unlocked for you!",
                "push": "Your free premium trial is active!",
                "subject": "Unlock Premium - Free Trial Inside!",
            },
            "win_back_call": {"email": "", "sms": "", "push": "", "subject": ""},
        }

        self.channel_configs = {
            "email": {"enabled": True, "delay_minutes": 0, "priority": 1},
            "sms": {"enabled": True, "delay_minutes": 15, "priority": 2},
            "push": {"enabled": True, "delay_minutes": 5, "priority": 3},
            "phone": {"enabled": False, "delay_minutes": 60, "priority": 4},
        }

    async def plan(self, user: Dict[str, Any], decision: Dict) -> Dict[str, Any]:
        actions = decision.get("selected_actions", [])
        if not actions:
            return {
                "action_type": "no_action",
                "action_details": {},
                "alternatives": [],
            }

        primary_action = actions[0]
        action_type = primary_action["action"]

        templates = self.message_templates.get(
            action_type, self.message_templates["personalized_email"]
        )

        message = self._personalize_message(templates, user)

        channel = primary_action.get("channel", "email")
        channel_config = self.channel_configs.get(
            channel, self.channel_configs["email"]
        )

        action_details = {
            "action_type": action_type,
            "channel": channel,
            "message": message,
            "subject": templates.get("subject", "").format(
                name=user.get("name", "there")
            ),
            "send_at": self._calculate_send_time(channel_config["delay_minutes"]),
            "follow_up_required": len(actions) > 1,
            "follow_up_actions": [self._format_follow_up(a, user) for a in actions[1:]],
        }

        alternatives = self._generate_alternatives(user, action_type)

        return {
            "action_type": action_type,
            "action_details": action_details,
            "alternatives": alternatives,
            "execution_readiness": "ready"
            if channel_config["enabled"]
            else "channel_disabled",
        }

    def _personalize_message(self, templates: Dict, user: Dict) -> str:
        name = user.get("name", "there").split()[0]

        if "email" in templates and templates["email"]:
            message = templates["email"].format(name=name)
        elif "sms" in templates and templates["sms"]:
            message = templates["sms"].format(name=name)
        elif "push" in templates and templates["push"]:
            message = templates["push"].format(name=name)
        else:
            message = f"Hi {name}! We have something special for you."

        return message

    def _calculate_send_time(self, delay_minutes: int) -> str:
        send_time = datetime.now().timestamp() + (delay_minutes * 60)
        return datetime.fromtimestamp(send_time).isoformat()

    def _format_follow_up(self, action: Dict, user: Dict) -> Dict:
        templates = self.message_templates.get(action["action"], {})

        return {
            "action": action["action"],
            "channel": action.get("channel", "email"),
            "delay_hours": action.get("sequence_order", 2) * 24,
            "message_preview": templates.get("sms", templates.get("email", ""))[:50]
            + "..."
            if templates.get("sms") or templates.get("email")
            else "",
        }

    def _generate_alternatives(self, user: Dict, rejected_action: str) -> List[Dict]:
        alternatives = []

        all_actions = list(self.message_templates.keys())
        other_actions = [
            a for a in all_actions if a != rejected_action and a != "no_action"
        ]

        for action in random.sample(other_actions, min(2, len(other_actions))):
            templates = self.message_templates[action]
            effectiveness = {
                "send_discount": 0.78,
                "send_loyalty_offer": 0.72,
                "personalized_email": 0.65,
                "push_notification": 0.55,
                "premium_feature_trial": 0.70,
                "win_back_call": 0.60,
            }

            alternatives.append(
                {
                    "action": action,
                    "confidence": effectiveness.get(action, 0.5),
                    "reasoning": f"Alternative: {action.replace('_', ' ')} could work if primary fails",
                }
            )

        return alternatives

    async def execute(self, user: Dict, action_details: Dict) -> Dict[str, Any]:
        action_type = action_details.get("action_type", "unknown")
        channel = action_details.get("channel", "email")

        execution_result = {
            "execution_id": f"EXEC_{datetime.now().timestamp()}",
            "user_id": user["user_id"],
            "action_type": action_type,
            "channel": channel,
            "status": "simulated",
            "sent_at": datetime.now().isoformat(),
            "message_preview": action_details.get("message", "")[:100],
            "note": "Action logged (Twilio/SendGrid/Firebase integration ready)",
        }

        return execution_result


execution_agent_instance = ExecutionAgent()
