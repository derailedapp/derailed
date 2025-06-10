CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(26) NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    flags BIGINT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE sessions (
    id TEXT NOT NULL PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL,
    last_usage BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS actors (
    id VARCHAR(26) NOT NULL PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    username VARCHAR(32) NOT NULL,
    display_name VARCHAR(32),
    avatar_id VARCHAR(26),
    banner_id VARCHAR(26),
    flags BIGINT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS usernames ON actors(lower(username));

CREATE TABLE IF NOT EXISTS channels (
    id VARCHAR(26) NOT NULL PRIMARY KEY,
    type INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS channel_members (
    channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT NOT NULL PRIMARY KEY,
    author_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL,
    last_modified_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS message_channels ON messages(channel_id);


CREATE TABLE IF NOT EXISTS read_states (
    user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    last_message_id TEXT NOT NULL,
    mentions INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, channel_id)
);

CREATE TABLE IF NOT EXISTS message_mentions (
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    PRIMARY KEY (message_id, user_id)
);
