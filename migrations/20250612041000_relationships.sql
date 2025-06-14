CREATE TABLE IF NOT EXISTS relationships (
    user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    target_user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type INTEGER NOT NULL,
    PRIMARY KEY (user_id, target_user_id)
);