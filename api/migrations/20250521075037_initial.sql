CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    flags BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS profiles (
    user_id BIGINT NOT NULL PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar TEXT,
    banner TEXT,
    flags BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS private_channels (
    id BIGINT NOT NULL PRIMARY KEY,
    name TEXT,
    type INTEGER NOT NULL,
    owner_id BIGINT REFERENCES accounts(id)
);
CREATE TABLE IF NOT EXISTS channel_members (
    channel_id BIGINT NOT NULL REFERENCES private_channels(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    PRIMARY KEY (channel_id, user_id)
);
CREATE TABLE IF NOT EXISTS guilds (
    id BIGINT NOT NULL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS guild_members (
    guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    PRIMARY KEY (guild_id, user_id)
);
CREATE TABLE IF NOT EXISTS guild_channels (
    id BIGINT NOT NULL UNIQUE,
    guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    name TEXT NOT NULL,
    parent_id BIGINT REFERENCES guild_channels(id),
    type INTEGER NOT NULL,
    PRIMARY KEY (id, guild_id)
);
CREATE TABLE IF NOT EXISTS guild_roles (
    id BIGINT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    allow BIGINT NOT NULL,
    deny BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS role_assigns (
    role_id BIGINT NOT NULL REFERENCES guild_roles(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    FOREIGN KEY (guild_id, user_id) REFERENCES guild_members(guild_id, user_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_channel_permissions (
    user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id BIGINT NOT NULL REFERENCES guild_channels(id) ON DELETE CASCADE,
    allow BIGINT NOT NULL,
    deny BIGINT NOT NULL,
    PRIMARY KEY (user_id, channel_id),
    FOREIGN KEY (guild_id, user_id) REFERENCES guild_members(guild_id, user_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS role_channel_permissions (
    role_id BIGINT NOT NULL REFERENCES guild_roles(id) ON DELETE CASCADE,
    channel_id BIGINT NOT NULL REFERENCES guild_channels(id) ON DELETE CASCADE,
    allow BIGINT NOT NULL,
    deny BIGINT NOT NULL,
    PRIMARY KEY (role_id, channel_id)
);