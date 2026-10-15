CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id VARCHAR(36) PRIMARY KEY,
  actor_id VARCHAR(36) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(20) NOT NULL,
  resource_id VARCHAR(36) NOT NULL,
  ip_address VARCHAR(45),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs (resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action_time ON audit_logs (action_type, created_at DESC);
