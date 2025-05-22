CREATE TABLE IF NOT EXISTS messages (
    id BIGINT NOT NULL PRIMARY KEY,
    author_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    channel_id BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    last_modified_at BIGINT NOT NULL
);
CREATE INDEX message_channels ON messages(channel_id);