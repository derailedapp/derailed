CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL,
    browser TEXT,
    operating_system TEXT,
    location TEXT,
    last_usage BIGINT NOT NULL
);