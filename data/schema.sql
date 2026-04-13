-- Autonomous Churn Prevention System Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    plan_type VARCHAR(50) DEFAULT 'free',
    join_date TIMESTAMP NOT NULL,
    last_login TIMESTAMP,
    login_frequency INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    last_purchase_date TIMESTAMP,
    avg_session_duration DECIMAL(10, 2) DEFAULT 0,
    support_tickets INTEGER DEFAULT 0,
    email_opens INTEGER DEFAULT 0,
    push_enabled BOOLEAN DEFAULT TRUE,
    engagement_score DECIMAL(5, 2) DEFAULT 50.0,
    churn_risk DECIMAL(5, 4) DEFAULT 0.5,
    risk_level VARCHAR(20) DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Churn Events Table
CREATE TABLE IF NOT EXISTS churn_events (
    event_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Churn Predictions Table
CREATE TABLE IF NOT EXISTS churn_predictions (
    prediction_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    churn_risk DECIMAL(5, 4) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    confidence DECIMAL(5, 4),
    top_factors JSONB,
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- AI Decisions Table
CREATE TABLE IF NOT EXISTS ai_decisions (
    decision_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    risk_score DECIMAL(5, 4),
    reasoning TEXT,
    action_type VARCHAR(50),
    action_details JSONB,
    confidence DECIMAL(5, 4),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Actions Log Table
CREATE TABLE IF NOT EXISTS actions_log (
    action_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP,
    message_preview TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- A/B Experiments Table
CREATE TABLE IF NOT EXISTS ab_experiments (
    experiment_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    variants JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    winner VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A/B Results Table
CREATE TABLE IF NOT EXISTS ab_results (
    result_id VARCHAR(100) PRIMARY KEY,
    experiment_id VARCHAR(100) NOT NULL,
    variant VARCHAR(50) NOT NULL,
    starts INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    rewards JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES ab_experiments(experiment_id)
);

-- Model Metrics Table
CREATE TABLE IF NOT EXISTS model_metrics (
    metric_id VARCHAR(100) PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10, 4),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drift Alerts Table
CREATE TABLE IF NOT EXISTS drift_alerts (
    alert_id VARCHAR(100) PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT,
    recommendations JSONB,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Digital Twins Table
CREATE TABLE IF NOT EXISTS digital_twins (
    twin_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    twin_state JSONB NOT NULL,
    simulations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_risk_level ON users(risk_level);
CREATE INDEX idx_users_churn_risk ON users(churn_risk DESC);
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_events_user_id ON churn_events(user_id);
CREATE INDEX idx_events_timestamp ON churn_events(timestamp DESC);
CREATE INDEX idx_predictions_user_id ON churn_predictions(user_id);
CREATE INDEX idx_decisions_user_id ON ai_decisions(user_id);
CREATE INDEX idx_ab_experiment_id ON ab_results(experiment_id);

-- Insert default A/B experiments
INSERT INTO ab_experiments (experiment_id, name, description, variants, status) VALUES
('offer_test', 'Discount Offer Test', 'Test different discount levels for at-risk users', 
 '["discount_10", "discount_20", "discount_30", "no_offer"]', 'active'),
('channel_test', 'Channel Effectiveness Test', 'Test different communication channels', 
 '["email", "sms", "push", "no_contact"]', 'active'),
('message_test', 'Message Tone Test', 'Test different message tones', 
 '["urgent", "friendly", "discount", "no_message"]', 'active');

-- Insert default model metrics
INSERT INTO model_metrics (metric_id, metric_name, metric_value) VALUES
('acc_001', 'accuracy', 0.87),
('prec_001', 'precision', 0.89),
('rec_001', 'recall', 0.85),
('f1_001', 'f1_score', 0.87),
('auc_001', 'auc_roc', 0.92);
