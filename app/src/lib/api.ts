import { env } from "$env/dynamic/public";
import { browser } from "$app/environment";

export class APIClient {
	// @ts-ignore
	token: string;

	constructor() {
		if (browser) {
			this.token = localStorage.getItem("token")!;
		}
	}

	request(method: string, route: string, body: any) {
		return fetch(env.PUBLIC_API_URL + route, {
			body: JSON.stringify(body),
			method,
			headers: {
				Authorization: this.token,
				"Content-Type": "application/json",
			},
		});
	}

	getCDNUrl(scope: string, id: string) {
		return env.PUBLIC_CDN_URL + `/${scope}/` + id;
	}
}

export default new APIClient();

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

export interface ChannelMember {
	channel_id: string;
	user_id: string;
}

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

export interface Actor {
	id: string;
	username: string;
	display_name: string | null;
	avatar_id: string | null;
	banner_id: string | null;
	flags: number;
}
