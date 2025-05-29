import { writable } from "svelte/store";
import {
	type Profile,
	type Account,
	type PrivateChannel,
	type Toast,
} from "$lib/models";

export const currentUser = writable<{
	profile: Profile;
	account: Account;
} | null>(null);
export const users = writable<Profile[]>([]);
export const privateChannels = writable<PrivateChannel[]>([]);

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
