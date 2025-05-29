export interface Account {
	id: BigInt;
	email: string;
	flags: number;
}

export interface Profile {
	user_id: BigInt;
	username: string;
	display_name: string | null;
	avatar: string | null;
	banner: string | null;
	flags: BigInt;
}

export interface PrivateChannel {
	id: BigInt;
	type: number;
	name: string | null;
	owner_id: BigInt | null;
	members: Profile[] | undefined;
}

export interface Toast {
	id: number;
	type: "info" | "error" | "success";
	message: string;
	timeout: number;
}
