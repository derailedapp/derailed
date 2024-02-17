export interface User {
    id: BigInt,
    username: string,
    display_name: string | null,
    flags: BigInt,
    invited_by: BigInt | null
}

export interface Settings {
    user_id: BigInt,
    theme: "dark" | "light",
    status: number
}

export interface Channel {
    id: BigInt,
    type: number,
    name: string | null,
    last_message_id: BigInt | null,
    recipients?: BigInt[]
}

export interface Message {
    id: BigInt,
    channel_id: BigInt,
    author: User,
    content: string | null,
    timestamp: string,
    edited_timestamp: string | null,
    referenced_message_id: BigInt | null
}

export interface ReadState {
    user_id: BigInt,
    channel_id: BigInt,
    mentions: BigInt,
    last_message_id: BigInt | null
}

export interface MessageReaction {
    message_id: BigInt,
    user_id: BigInt,
    emoji: string,
    created_at: string
}

export interface Relationship {
    origin_user_id: BigInt,
    target_user_id: BigInt,
    relation: number
}