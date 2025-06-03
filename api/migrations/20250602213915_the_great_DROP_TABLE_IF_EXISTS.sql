DROP TABLE IF EXISTS 
    message_mentions, read_states, relationships, messages, sessions,
    role_channel_permissions, user_channel_permissions, role_assigns, 
    guild_roles, guild_channels, guild_members, guilds,
    channel_members, channels, profiles, accounts
CASCADE;

CREATE TABLE accounts (
    id TEXT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    flags BIGINT NOT NULL
);

CREATE TABLE profiles (
    user_id TEXT NOT NULL PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar TEXT,
    banner TEXT,
    flags BIGINT NOT NULL
);

CREATE TABLE channels (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT,
    type INTEGER NOT NULL,
    owner_id TEXT REFERENCES accounts(id)
);

CREATE TABLE channel_members (
    channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE guilds (
    id TEXT NOT NULL PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    name TEXT NOT NULL
);

CREATE TABLE guild_members (
    guild_id TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE guild_channels (
    channel_id TEXT NOT NULL PRIMARY KEY REFERENCES channels(id) ON DELETE CASCADE,
    guild_id TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    parent_id TEXT REFERENCES channels(id)
);

CREATE TABLE guild_roles (
    id TEXT NOT NULL PRIMARY KEY,
    guild_id TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    allow BIGINT NOT NULL,
    deny BIGINT NOT NULL
);

CREATE TABLE role_assigns (
    role_id TEXT NOT NULL REFERENCES guild_roles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    guild_id TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    FOREIGN KEY (guild_id, user_id) REFERENCES guild_members(guild_id, user_id) ON DELETE CASCADE
);

CREATE TABLE user_channel_permissions (
    user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    guild_id TEXT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL REFERENCES guild_channels(channel_id) ON DELETE CASCADE,
    allow BIGINT NOT NULL,
    deny BIGINT NOT NULL,
    PRIMARY KEY (user_id, channel_id),
    FOREIGN KEY (guild_id, user_id) REFERENCES guild_members(guild_id, user_id) ON DELETE CASCADE
);

CREATE TABLE role_channel_permissions (
    role_id TEXT NOT NULL REFERENCES guild_roles(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL REFERENCES guild_channels(channel_id) ON DELETE CASCADE,
    allow BIGINT NOT NULL,
    deny BIGINT NOT NULL,
    PRIMARY KEY (role_id, channel_id)
);

CREATE TABLE sessions (
    id TEXT NOT NULL PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL,
    browser TEXT,
    operating_system TEXT,
    location TEXT,
    last_usage BIGINT NOT NULL
);

CREATE TABLE messages (
    id TEXT NOT NULL PRIMARY KEY,
    author_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    last_modified_at BIGINT NOT NULL
);
CREATE INDEX message_channels ON messages(channel_id);

CREATE TABLE relationships (
    user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    target_user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type INTEGER NOT NULL,
    PRIMARY KEY (user_id, target_user_id)
);

CREATE TABLE read_states (
    user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    last_message_id TEXT NOT NULL,
    mentions INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, channel_id)
);

CREATE TABLE message_mentions (
    message_id TEXT NOT NULL REFERENCES messages(id),
    channel_id TEXT NOT NULL REFERENCES channels(id),
    user_id TEXT NOT NULL,
    PRIMARY KEY (message_id, user_id)
);

CREATE UNIQUE INDEX usernames ON profiles(lower(username));