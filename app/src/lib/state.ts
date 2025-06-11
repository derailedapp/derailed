import { writable } from "svelte/store";
import { type Actor, type Account, type Channel, type ReadState } from "./api";

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
export const currentActor = writable<Actor | undefined>({
	id: "01JXFEWNW27KAS8D0XDE9JAGX5",
	username: "vincentrps",
	display_name: "VincentRPS",
	avatar_id: null,
	banner_id: null,
	flags: 0
});
export const currentAccount = writable<Account | undefined>({
	id: "01JXFEWNW27KAS8D0XDE9JAGX5",
	email: "woosh@woosh.woosh",
	flags: 0
});
export const users = writable<Actor[]>([]);

export const channels = writable<Channel[]>([]);
export const channelMembers = writable<Map<string, Actor[]>>(new Map());
export const readStates = writable<ReadState[]>([]);

export const currentPrivateChannelId = writable<string | undefined>();
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
