-- ============================================================
-- 001 INITIAL SCHEMA
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            VARCHAR(255) UNIQUE NOT NULL,
  password_hash    VARCHAR(255) NOT NULL,
  full_name        VARCHAR(255) NOT NULL,
  role             VARCHAR(20)  NOT NULL CHECK (role IN ('STUDENT', 'LECTURER', 'ADMIN')),
  student_number   VARCHAR(50)  UNIQUE,
  staff_number     VARCHAR(50)  UNIQUE,
  active           BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEVICES
-- ============================================================
CREATE TABLE devices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint  VARCHAR(255) NOT NULL,
  device_model        VARCHAR(255),
  os                  VARCHAR(50),
  os_version          VARCHAR(50),
  app_version         VARCHAR(50),
  registered_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_seen_at        TIMESTAMPTZ
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  issued_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ  NOT NULL,
  revoked     BOOLEAN      NOT NULL DEFAULT FALSE
);

-- ============================================================
-- CLASSES
-- ============================================================
CREATE TABLE classes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_code         VARCHAR(100) NOT NULL,
  subject_name       VARCHAR(255) NOT NULL,
  venue              VARCHAR(255),
  scheduled_at       TIMESTAMPTZ  NOT NULL,
  challenge_code     VARCHAR(100),
  challenge_required BOOLEAN      NOT NULL DEFAULT FALSE,
  qr_token           TEXT         NOT NULL,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE RECORDS
-- ============================================================
CREATE TABLE attendance_records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id           UUID         NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint VARCHAR(255) NOT NULL,
  device_model       VARCHAR(255),
  os                 VARCHAR(50),
  os_version         VARCHAR(50),
  app_version        VARCHAR(50),
  latitude           NUMERIC(10, 8) NOT NULL,
  longitude          NUMERIC(11, 8) NOT NULL,
  captured_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  flagged            BOOLEAN        NOT NULL DEFAULT FALSE,
  flag_reason        VARCHAR(100),
  CONSTRAINT uq_class_student UNIQUE (class_id, student_id)
);

-- ============================================================
-- ADMIN PUSH LOGS
-- ============================================================
CREATE TABLE admin_push_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID        NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  pushed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status        VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
  http_status   INTEGER,
  response_body TEXT
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_classes_lecturer        ON classes(lecturer_id);
CREATE INDEX idx_attendance_class        ON attendance_records(class_id);
CREATE INDEX idx_attendance_student      ON attendance_records(student_id);
CREATE INDEX idx_attendance_device       ON attendance_records(device_fingerprint);
CREATE INDEX idx_attendance_flagged      ON attendance_records(class_id, flagged) WHERE flagged = TRUE;
CREATE INDEX idx_devices_user            ON devices(user_id);
CREATE INDEX idx_devices_fingerprint     ON devices(device_fingerprint);
CREATE INDEX idx_refresh_tokens_user     ON refresh_tokens(user_id);
