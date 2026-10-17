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
