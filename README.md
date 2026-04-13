# Autonomous Customer Churn Prevention System

A FAANG-level, production-ready autonomous customer churn prevention system powered by Multi-Agent AI, Real-Time Event Processing, and Predictive Analytics.

## Features

### 10 Advanced Features

1. **Multi-Agent AI Decision System** - 4 specialized AI agents working in orchestration:
   - Risk Agent - Predicts churn probability
   - Behavior Agent - Analyzes engagement patterns
   - Strategy Agent - Decides intervention type
   - Execution Agent - Triggers omnichannel actions

2. **Real-Time Event-Driven Intelligence** - Millisecond-level predictions using simulated Kafka/Flink pipeline

3. **Predictive + Prescriptive AI** - Combines ML predictions with LLM reasoning

4. **Hyper-Personalized Retention Engine** - Dynamic offers per user based on context

5. **User Digital Twin Modeling** - Virtual user replicas for counterfactual simulation

6. **Built-in A/B Testing Engine** - Self-optimizing campaigns with automatic winner selection

7. **Reinforcement Learning Loop** - Continuous strategy improvement

8. **Churn Explainability Engine** - SHAP-powered causal reasoning

9. **Omnichannel Action Engine** - Email, SMS, Push (Twilio/SendGrid/Firebase ready)

10. **Drift Detection + Auto Retraining** - MLflow/Evidently-style monitoring

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Backend | Python, FastAPI, LangChain, OpenAI GPT-4, WebSockets |
| AI Agents | LangChain, OpenAI GPT-4 |
| Real-Time | WebSocket event bus (Kafka/Flink ready) |
| ML | Mock XGBoost, SHAP Explainers |
| Database | SQLite (MVP), PostgreSQL-ready schema |

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set your OpenAI API key
export OPENAI_API_KEY=your-key  # On Windows: set OPENAI_API_KEY=your-key

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 to see the dashboard.

## Dashboard Panels

1. **Control Panel** - Main KPIs, live graphs, AI decision feed
2. **User Intelligence** - Risk cards for all users
3. **AI Decision Feed** - Real-time AI brain activity
4. **Churn Analytics** - Heatmaps, cohort analysis, retention curves
5. **A/B Testing Dashboard** - Campaign comparison with winners
6. **Explainability Panel** - SHAP values + LLM explanations
7. **Event Stream** - Live stock-ticker style event feed
8. **Digital Twin Simulator** - What-if scenario engine
9. **System Health** - Model metrics, drift alerts, latency

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users with optional risk filter |
| GET | `/api/users/{id}` | Get single user details |
| GET | `/api/users/high-risk` | Get high-risk users |
| POST | `/api/predict` | Get churn prediction with SHAP |
| POST | `/api/ai-decide` | Get multi-agent decision |
| POST | `/api/actions` | Execute retention action |
| GET | `/api/analytics/overview` | Dashboard analytics |
| GET | `/api/analytics/trends` | Historical trends |
| GET | `/api/ab-tests` | List A/B experiments |
| GET | `/api/system/health` | System health metrics |
| WS | `/ws/events` | Real-time event stream |
| WS | `/ws/ai-decisions` | AI decision stream |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│   Dark UI • Glassmorphism • Real-time WebSocket feed            │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (FastAPI)                       │
│   REST + WebSocket endpoints • Auth • Rate limiting             │
└─────────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│  MULTI-AGENT    │  │   REAL-TIME     │  │   DATA & ML         │
│  AI BRAIN       │  │   EVENT PIPE    │  │   PIPELINE          │
│  (LangChain)    │  │   (WebSocket)   │  │   (SHAP)            │
└─────────────────┘  └─────────────────┘  └─────────────────────┘
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
OPENAI_API_KEY=your-openai-key
```

## Future Enhancements

- [ ] Real Kafka/Flink integration
- [ ] PostgreSQL database
- [ ] Redis caching
- [ ] Twilio SMS integration
- [ ] SendGrid email integration
- [ ] Firebase push notifications
- [ ] MLflow model tracking
- [ ] Kubernetes deployment
- [ ] Real XGBoost/RandomForest models

## License

MIT
