-- ============================================================
-- KSG STAFF RECOGNITION SYSTEM — PostgreSQL Schema
-- File: database/schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- USERS
-- KSG staff identified by firstname.lastname@ksg.ac.ke
-- ------------------------------------------------------------
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE
                    CHECK (email ~* '^[a-z]+\.[a-z]+@ksg\.ac\.ke$'),
    password    VARCHAR(255)    NOT NULL,
    department  VARCHAR(150),
    role        VARCHAR(20)     NOT NULL DEFAULT 'staff'
                    CHECK (role IN ('admin', 'staff')),
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- CYCLES  (one awards round, e.g. "Q2 2025 KSG Awards")
-- Only one cycle can be in nominating or voting at a time
-- ------------------------------------------------------------
CREATE TABLE cycles (
    id                   SERIAL PRIMARY KEY,
    title                VARCHAR(200)    NOT NULL,
    description          TEXT,
    phase                VARCHAR(20)     NOT NULL DEFAULT 'closed'
                             CHECK (phase IN ('closed','nominating','voting','results')),
    nominations_open_at  TIMESTAMP,
    voting_open_at       TIMESTAMP,
    results_at           TIMESTAMP,
    created_by           INT             NOT NULL REFERENCES users(id),
    created_at           TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Prevent two active cycles simultaneously
CREATE UNIQUE INDEX idx_one_active_cycle
    ON cycles (phase)
    WHERE phase IN ('nominating', 'voting');

-- ------------------------------------------------------------
-- CATEGORIES  (award types per cycle)
-- ------------------------------------------------------------
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    cycle_id    INT             NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    name        VARCHAR(150)    NOT NULL,
    description TEXT,
    criteria    TEXT,
    sort_order  SMALLINT        NOT NULL DEFAULT 0,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (cycle_id, name)
);

-- ------------------------------------------------------------
-- NOMINATIONS
-- Staff can nominate themselves or a colleague, once per
-- category per cycle per nominee.
-- ------------------------------------------------------------
CREATE TABLE nominations (
    id            SERIAL PRIMARY KEY,
    cycle_id      INT         NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    category_id   INT         NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    nominee_id    INT         NOT NULL REFERENCES users(id),
    nominated_by  INT         NOT NULL REFERENCES users(id),
    reason        TEXT,
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (cycle_id, category_id, nominee_id)
);

-- ------------------------------------------------------------
-- VOTES
-- Each staff member gets one vote per category per cycle.
-- The unique constraint enforces this at the database level.
-- ------------------------------------------------------------
CREATE TABLE votes (
    id             SERIAL PRIMARY KEY,
    cycle_id       INT         NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    category_id    INT         NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    nomination_id  INT         NOT NULL REFERENCES nominations(id) ON DELETE CASCADE,
    voter_id       INT         NOT NULL REFERENCES users(id),
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (cycle_id, category_id, voter_id)
);

-- ------------------------------------------------------------
-- AUDIT LOG  (every admin action is recorded)
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
    id           SERIAL PRIMARY KEY,
    user_id      INT             NOT NULL REFERENCES users(id),
    action       VARCHAR(100)    NOT NULL,
    target_type  VARCHAR(50),
    target_id    INT,
    notes        TEXT,
    created_at   TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
CREATE INDEX idx_nominations_cycle      ON nominations(cycle_id);
CREATE INDEX idx_nominations_category   ON nominations(category_id);
CREATE INDEX idx_nominations_nominee    ON nominations(nominee_id);
CREATE INDEX idx_votes_cycle            ON votes(cycle_id);
CREATE INDEX idx_votes_category         ON votes(category_id);
CREATE INDEX idx_votes_voter            ON votes(voter_id);
CREATE INDEX idx_categories_cycle       ON categories(cycle_id);
CREATE INDEX idx_audit_logs_user        ON audit_logs(user_id);

-- ------------------------------------------------------------
-- SEED: default admin  (update password immediately via /admin)
-- bcrypt of "KsgAdmin@2025" — regenerate before go-live
-- ------------------------------------------------------------
INSERT INTO users (name, email, password, role, department)
VALUES (
    'System Administrator',
    'system.admin@ksg.ac.ke',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'ICT'
);

-- ------------------------------------------------------------
-- SEED: sample categories for first cycle (run after creating
-- a cycle via the admin panel, then update cycle_id below)
-- ------------------------------------------------------------
-- INSERT INTO categories (cycle_id, name, description, criteria, sort_order)
-- VALUES
--   (1, 'Employee of the Quarter', 'Exceptional all-round performance', 'Consistent output, teamwork, and attitude', 1),
--   (1, 'Innovation Award', 'Best new idea or process improvement', 'Originality, impact, and feasibility', 2),
--   (1, 'Team Player Award', 'Outstanding collaboration', 'Goes beyond their role to support colleagues', 3),
--   (1, 'Leadership Excellence', 'Demonstrated leadership at any level', 'Initiative, mentorship, and results', 4);