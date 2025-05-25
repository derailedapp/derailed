CREATE TABLE IF NOT EXISTS read_states (
    user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    last_message_id BIGINT NOT NULL,
    mentions INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, channel_id)
);