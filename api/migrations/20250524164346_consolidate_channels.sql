DROP TABLE channel_members;
DROP TABLE private_channels;
DROP TABLE user_channel_permissions;
DROP TABLE role_channel_permissions;
DROP TABLE guild_channels;

CREATE TABLE IF NOT EXISTS channels (
    id BIGINT NOT NULL PRIMARY KEY,
    name TEXT,
    type INTEGER NOT NULL,
    owner_id BIGINT REFERENCES accounts(id)
);

-- DM/Group Channels

CREATE TABLE IF NOT EXISTS channel_members (
    channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    PRIMARY KEY (channel_id, user_id)
);

-- Guild Channels
CREATE TABLE IF NOT EXISTS guild_channels (
    channel_id BIGINT NOT NULL PRIMARY KEY REFERENCES channels(id) ON DELETE CASCADE,
    guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    parent_id BIGINT REFERENCES channels(id)
);
CREATE TABLE IF NOT EXISTS user_channel_permissions (
    user_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id BIGINT NOT NULL REFERENCES guild_channels(channel_id) ON DELETE CASCADE,
    allow BIGINT NOT NULL,
    deny BIGINT NOT NULL,
    PRIMARY KEY (user_id, channel_id),
    FOREIGN KEY (guild_id, user_id) REFERENCES guild_members(guild_id, user_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS role_channel_permissions (
    role_id BIGINT NOT NULL REFERENCES guild_roles(id) ON DELETE CASCADE,
    channel_id BIGINT NOT NULL REFERENCES guild_channels(channel_id) ON DELETE CASCADE,
    allow BIGINT NOT NULL,
    deny BIGINT NOT NULL,
    PRIMARY KEY (role_id, channel_id)
);