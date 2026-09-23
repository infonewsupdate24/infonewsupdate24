CREATE TABLE IF NOT EXISTS card_admins (
  uid TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('OWNER','ISSUER')),
  active INTEGER NOT NULL CHECK(active IN (0,1)), updatedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS card_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS press_cards (
  token TEXT PRIMARY KEY CHECK(length(token)=32), employeeId TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 150),
  designation TEXT NOT NULL CHECK(length(designation) BETWEEN 1 AND 120),
  photo TEXT NOT NULL DEFAULT '', status TEXT NOT NULL CHECK(status IN ('ACTIVE','REVOKED')),
  issuedAt INTEGER NOT NULL, expiresAt INTEGER NOT NULL CHECK(expiresAt > issuedAt),
  createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL,
  issuedBy TEXT NOT NULL, updatedBy TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS card_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT NOT NULL, action TEXT NOT NULL,
  actor TEXT NOT NULL, at INTEGER NOT NULL, oldExpiry INTEGER, newExpiry INTEGER
);
CREATE TRIGGER IF NOT EXISTS card_identity_immutable BEFORE UPDATE ON press_cards
WHEN NEW.token != OLD.token OR NEW.employeeId != OLD.employeeId OR NEW.name != OLD.name
 OR NEW.designation != OLD.designation OR NEW.photo != OLD.photo OR NEW.issuedAt != OLD.issuedAt
 OR NEW.createdAt != OLD.createdAt OR NEW.issuedBy != OLD.issuedBy
BEGIN SELECT RAISE(ABORT, 'Card identity is immutable'); END;
CREATE TRIGGER IF NOT EXISTS card_transition BEFORE UPDATE ON press_cards
WHEN OLD.status = 'REVOKED' OR NOT (
 (NEW.status = 'REVOKED' AND NEW.expiresAt = OLD.expiresAt) OR
 (NEW.status = 'ACTIVE' AND NEW.expiresAt > OLD.expiresAt))
BEGIN SELECT RAISE(ABORT, 'Invalid card transition'); END;
CREATE TRIGGER IF NOT EXISTS card_no_delete BEFORE DELETE ON press_cards
BEGIN SELECT RAISE(ABORT, 'Revoke instead of deleting'); END;
CREATE TRIGGER IF NOT EXISTS card_issued AFTER INSERT ON press_cards
BEGIN INSERT INTO card_audit(token,action,actor,at,newExpiry) VALUES(NEW.token,'ISSUE',NEW.issuedBy,NEW.createdAt,NEW.expiresAt); END;
CREATE TRIGGER IF NOT EXISTS card_changed AFTER UPDATE ON press_cards
BEGIN INSERT INTO card_audit(token,action,actor,at,oldExpiry,newExpiry) VALUES(NEW.token,CASE WHEN NEW.status='REVOKED' THEN 'REVOKE' ELSE 'RENEW' END,NEW.updatedBy,NEW.updatedAt,OLD.expiresAt,NEW.expiresAt); END;
CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON card_audit
BEGIN SELECT RAISE(ABORT, 'Audit is immutable'); END;
CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON card_audit
BEGIN SELECT RAISE(ABORT, 'Audit is immutable'); END;
