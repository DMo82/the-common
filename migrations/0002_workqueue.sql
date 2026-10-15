-- WorkQueue and related tables (PostgreSQL compatible)

CREATE TABLE IF NOT EXISTS work_items (
  id VARCHAR(36) PRIMARY KEY,
  kind VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  owner_id VARCHAR(36),
  owner_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(10) DEFAULT 'normal',
  due_at TIMESTAMP,
  claimed_by VARCHAR(36),
  claimed_at TIMESTAMP,
  escalated_to VARCHAR(36),
  escalated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_work_status ON work_items (status);
CREATE INDEX IF NOT EXISTS idx_work_kind ON work_items (kind);
CREATE INDEX IF NOT EXISTS idx_work_due ON work_items (due_at);

CREATE TABLE IF NOT EXISTS work_history (
  id VARCHAR(36) PRIMARY KEY,
  item_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor_id VARCHAR(36),
  actor_role VARCHAR(50),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hist_item ON work_history (item_id);
CREATE INDEX IF NOT EXISTS idx_hist_actor ON work_history (actor_id);

CREATE TABLE IF NOT EXISTS appeals (
  id VARCHAR(36) PRIMARY KEY,
  target_id VARCHAR(36) NOT NULL,
  target_kind VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  ack_at TIMESTAMP,
  final_response_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appeal_target ON appeals (target_id);

CREATE TABLE IF NOT EXISTS verification_evidence (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  evidence_url TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_verif_biz ON verification_evidence (business_id);
