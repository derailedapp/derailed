import { writable } from "svelte/store";

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

export const currentPrivateChannelId = writable<string | undefined>(undefined);
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
