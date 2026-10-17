-- Analytics and subscription tables

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions (created_at);

CREATE TABLE IF NOT EXISTS export_log (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  export_type VARCHAR(50) NOT NULL,
  filters TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_export_user ON export_log (user_id);
CREATE INDEX IF NOT EXISTS idx_export_created ON export_log (created_at);

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  stripe_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'trial',
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sub_user ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_sub_status ON subscriptions (status);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value) VALUES
  ('subscription_price', '10'),
  ('subscription_trial_days', '90'),
  ('ticket_fee_percent', '10'),
  ('retention_days', '2190')
ON CONFLICT (key) DO NOTHING;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_sessions_created_user ON sessions (created_at, user_id);
CREATE INDEX IF NOT EXISTS idx_work_history_created ON work_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events (created_at);
CREATE INDEX IF NOT EXISTS idx_work_status_partial ON work_items (status) WHERE status IN ('new', 'claimed', 'in_review');

-- Seed sessions for demo
INSERT INTO sessions (id, user_id, created_at) VALUES
  ('sess_1', 'user_1', NOW() - INTERVAL '1 hour'),
  ('sess_2', 'user_2', NOW() - INTERVAL '2 hours'),
  ('sess_3', 'user_3', NOW() - INTERVAL '1 day'),
  ('sess_4', 'user_1', NOW() - INTERVAL '5 days'),
  ('sess_5', 'user_4', NOW() - INTERVAL '10 days'),
  ('sess_6', 'user_5', NOW() - INTERVAL '20 days'),
  ('sess_7', 'user_2', NOW() - INTERVAL '25 days'),
  ('sess_8', 'user_6', NOW() - INTERVAL '35 days')
ON CONFLICT (id) DO NOTHING;
