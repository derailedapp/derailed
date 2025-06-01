export interface Account {
	id: string;
	email: string;
	flags: number;
}

export interface Profile {
	user_id: string;
	username: string;
	display_name: string | null;
	avatar: string | null;
	banner: string | null;
	flags: string;
}

export interface PrivateChannel {
	id: string;
	type: number;
	name: string | null;
	owner_id: string | null;
	members: Profile[] | undefined;
}

export interface Toast {
	id: number;
	type: "info" | "error" | "success";
	message: string;
	timeout: number;
}

export interface Message {
	id: string;
	author_id: string;
	content: string;
	channel_id: string;
	created_at: number;
	last_modified_at: number;
	nonce: string | undefined;
}

export enum CropType {
	Banner,
	Avatar,
}
