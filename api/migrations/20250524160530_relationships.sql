CREATE TABLE IF NOT EXISTS relationships (
    user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    target_user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    -- 0: Following
    -- 1: Followed
    -- 2: Friends
    -- 3: Blocked
    -- 4: Blocked By
    type INTEGER NOT NULL,
    PRIMARY KEY (user_id, target_user_id)
);