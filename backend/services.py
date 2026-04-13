import asyncio
import json
import random
from datetime import datetime
from typing import List, Optional
from models import (
    get_user_by_id,
    get_users_by_risk,
    get_high_risk_users,
    generate_event_stream,
    event_bus,
    ab_memory,
    get_user_by_id,
    DRIFT_HISTORY,
    MODEL_METRICS,
    simulate_action,
    create_digital_twin,
)
from agents.risk_agent import RiskAgent
from agents.behavior_agent import BehaviorAgent
from agents.strategy_agent import StrategyAgent
from agents.execution_agent import ExecutionAgent

risk_agent = RiskAgent()
behavior_agent = BehaviorAgent()
strategy_agent = StrategyAgent()
execution_agent = ExecutionAgent()


class AIService:
    def __init__(self):
        self.decision_cache = {}
        self.processing_queue = asyncio.Queue()

    async def analyze_user(self, user_id: str, force_refresh: bool = False) -> dict:
        if user_id in self.decision_cache and not force_refresh:
            cached = self.decision_cache[user_id]
            age = (
                datetime.now() - datetime.fromisoformat(cached["timestamp"])
            ).total_seconds()
            if age < 300:
                return cached

        user = get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}

        risk_result = await risk_agent.predict(user)
        behavior_result = await behavior_agent.analyze(user)

        strategy_decision = await strategy_agent.decide(
            user=user, risk_result=risk_result, behavior_result=behavior_result
        )

        execution_plan = await execution_agent.plan(
            user=user, decision=strategy_decision
        )

        full_decision = {
            **strategy_decision,
            **execution_plan,
            "timestamp": datetime.now().isoformat(),
        }

        self.decision_cache[user_id] = full_decision
        return full_decision

    async def process_batch(self, user_ids: List[str]) -> List[dict]:
        tasks = [self.analyze_user(uid) for uid in user_ids]
        return await asyncio.gather(*tasks)


ai_service = AIService()


async def event_generator():
    event_stream = generate_event_stream()
    while True:
        try:
            event = next(event_stream)
            await event_bus.publish(event)

            if event["event_type"] in ["churn_risk_increase", "user_login", "purchase"]:
                user_id = event["user_id"]
                decision = await ai_service.analyze_user(user_id, force_refresh=True)
                if decision and "error" not in decision:
                    await event_bus.publish(
                        {
                            "event_id": f"AI_{datetime.now().timestamp()}",
                            "user_id": user_id,
                            "event_type": "ai_decision",
                            "timestamp": datetime.now().isoformat(),
                            "data": {
                                "decision": decision,
                                "action_taken": decision.get("action_type"),
                                "confidence": decision.get("confidence"),
                            },
                        }
                    )

            ab_memory.record_start(
                "offer_test",
                random.choice(
                    ["discount_10", "discount_20", "discount_30", "no_offer"]
                ),
            )
            if random.random() < 0.3:
                ab_memory.record_conversion("offer_test", "discount_20", 1.0)

            await asyncio.sleep(random.uniform(2, 5))
        except Exception as e:
            await asyncio.sleep(1)


async def drift_monitor():
    while True:
        drift_score = random.uniform(0, 0.1)
        if drift_score > 0.05:
            DRIFT_HISTORY.append(
                {
                    "timestamp": datetime.now().isoformat(),
                    "drift_score": drift_score,
                    "severity": "high" if drift_score > 0.08 else "medium",
                }
            )
        MODEL_METRICS["drift_score"] = drift_score
        await asyncio.sleep(30)


async def start_background_tasks():
    asyncio.create_task(event_generator())
    asyncio.create_task(drift_monitor())
