export interface Account {
	id: string;
	email: string;
	flags: number;
}

export interface Session {
	id: string;
	account_id: string;
	expires_at: number;
	last_usage: number;
}

export interface UserActor {
	id: string;
	username: string;
	display_name: string | null;
	avatar_id: string | null;
	banner_id: string | null;
	flags: number;
}

export interface Message {
	id: string;
	author_id: string;
	content: string;
	channel_id: string;
	created_at: number;
	last_modified_at: number;
}

export interface ReadState {
	user_id: string;
	channel_id: string;
	last_message_id: string;
	mentions: number;
}

export interface MessageMention {
	message_id: string;
	channel_id: string;
	user_id: string;
}

export interface Channel {
	id: string;
	type: number;
	last_message_id: string | null;
}

export interface RTChannel {
	channel: Channel;
	members: UserActor[];
	read_state: ReadState;
}

export interface Relationship {
	type: number;
	target: UserActor;
}
