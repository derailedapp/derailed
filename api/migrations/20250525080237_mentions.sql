CREATE TABLE IF NOT EXISTS message_mentions (
    message_id BIGINT NOT NULL REFERENCES messages(id),
    channel_id BIGINT NOT NULL REFERENCES channels(id),
    user_id INTEGER NOT NULL,
    PRIMARY KEY (message_id, user_id)
);