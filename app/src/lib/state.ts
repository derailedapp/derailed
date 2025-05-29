import { writable } from "svelte/store";
import { type Profile, type Account, type PrivateChannel } from "$lib/models";

export const currentUser = writable<{
	profile: Profile;
	account: Account;
} | null>(null);
export const users = writable<Profile[]>([]);
export const privateChannels = writable<PrivateChannel[]>([]);
