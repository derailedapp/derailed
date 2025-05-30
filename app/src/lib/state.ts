import { get, writable } from "svelte/store";
import {
	type Profile,
	type Account,
	type PrivateChannel,
	type Toast,
	type Message,
} from "$lib/models";

export const currentUser = writable<{
	profile: Profile;
	account: Account;
} | null>(null);
export const users = writable<Profile[]>([]);
export const privateChannels = writable<PrivateChannel[]>([]);
export const currentPrivateChannel = writable<BigInt | null>(null);
export const currentGuild = writable<BigInt | null>(null);
export const currentSidebarType = writable<"guild" | "dms">("dms");
export const channelMessages = writable<Map<BigInt, Message[]>>(new Map());
export const waitingForMessages = writable<BigInt[]>([]);
export const savedChannels = writable<BigInt[]>([]);

export const toasts = writable<Toast[]>([]);

export const addToast = (
	type: "info" | "error" | "success",
	message: string,
	timeout: number,
) => {
	const id = Math.floor(Math.random() * 10000);

	const toast: Toast = {
		id,
		type,
		message,
		timeout,
	};

	toasts.update((all) => [toast, ...all]);

	if (toast.timeout) setTimeout(() => dismissToast(id), toast.timeout);
};

export const dismissToast = (id: number) => {
	toasts.update((all) => all.filter((t) => t.id !== id));
};

export function getChannelName(channel: PrivateChannel) {
	const currentUserData = get(currentUser);

	if (channel.members !== undefined && channel.type === 0) {
		let profile = channel.members.find((v) => {
			if (currentUserData?.profile.user_id.valueOf() !== v.user_id.valueOf()) {
				return true;
			}
			return false;
		})!;
		let name = profile.display_name || profile.username;
		return name!;
	} else {
		return channel.name || "Some Channel";
	}
}
