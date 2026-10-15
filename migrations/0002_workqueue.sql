-- WorkQueue and related tables (MySQL compatible)
-- Applied by scripts/migrate.mjs or src/lib/db.ts

CREATE TABLE IF NOT EXISTS work_items (
  id VARCHAR(36) PRIMARY KEY,
  kind VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  owner_id VARCHAR(36),
  owner_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(10) DEFAULT 'normal',
  due_at DATETIME,
  claimed_by VARCHAR(36),
  claimed_at DATETIME,
  escalated_to VARCHAR(36),
  escalated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_work_status (status),
  INDEX idx_work_kind (kind),
  INDEX idx_work_due (due_at)
);

CREATE TABLE IF NOT EXISTS work_history (
  id VARCHAR(36) PRIMARY KEY,
  item_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor_id VARCHAR(36),
  actor_role VARCHAR(50),
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hist_item (item_id),
  INDEX idx_hist_actor (actor_id)
);

CREATE TABLE IF NOT EXISTS appeals (
  id VARCHAR(36) PRIMARY KEY,
  target_id VARCHAR(36) NOT NULL,
  target_kind VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  ack_at DATETIME,
  final_response_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_appeal_target (target_id)
);

CREATE TABLE IF NOT EXISTS verification_evidence (
  id VARCHAR(36) PRIMARY KEY,
  business_id VARCHAR(36) NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  evidence_url TEXT,
  notes TEXT,
  INDEX idx_verif_biz (business_id)
);
