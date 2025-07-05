import { writable } from "svelte/store";
import {
	type UserActor,
	type Account,
	type Message,
	type ReadState,
} from "./models";
import type { Relationship, RTChannel } from "./models";

export interface Toast {
	id: number;
	type: "info" | "error" | "success";
	message: string;
	timeout: number;
}

export enum CropType {
	Banner,
	Avatar,
}

// user info
export const currentActor = writable<UserActor | undefined>();
export const currentAccount = writable<Account | undefined>();
export const users = writable<UserActor[]>([]);

export const relationships = writable<Relationship[]>([]);

export const channels = writable<RTChannel[]>([]);
export const readStates = writable<ReadState[]>([]);
export const channelMessages = writable<Map<string, Message[]>>(new Map());
export const pendingNonces = writable<string[]>([]);

export const currentPrivateChannelId = writable<string | undefined>();
export const toasts = writable<Toast[]>([]);

export const isLoading = writable(true);

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
