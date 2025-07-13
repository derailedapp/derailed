import EventEmitter from "eventemitter3";
import type {
	Account,
	Message,
	ReadState,
	Relationship,
	RTChannel,
	UserActor,
} from "./models";
import {
	channelMessages,
	channels,
	currentAccount,
	currentActor,
	isLoading,
	pendingNonces,
	readStates,
	relationships,
	users,
} from "./state";
import { get } from "svelte/store";

const emitter = new EventEmitter();

export default emitter;

emitter.on("READY", (data) => {
	const relationshipData: Relationship[] = data.relationships;
	const actor: UserActor = data.actor;
	const account: Account = data.account;
	const rtChannels: RTChannel[] = data.channels;

	currentActor.set(actor);
	currentAccount.set(account);
	users.update((actors) => {
		actors.push(actor);
		rtChannels.forEach((channel) => {
			let refs: WeakRef<UserActor>[] = [];
			channel.members.forEach((member) => {
				// @ts-ignore
				actors.push(member as UserActor);
				// @ts-ignore
				refs.push(new WeakRef(member as UserActor));
			});
			channel.members = refs;
		});
		return actors;
	});
	readStates.update(() => {
		let states: ReadState[] = [];
		rtChannels.forEach((channel) => {
			// @ts-ignore
			states.push(channel.read_state as ReadState);
			// @ts-ignore
			channel.read_state = new WeakRef(channel.read_state as ReadState);
			// @ts-ignore
			states.push(channel.read_state);
		});
		return states;
	});
	channels.set(rtChannels);
	relationships.set(relationshipData);

	isLoading.set(false);
});

emitter.on("MESSAGE_CREATE", (data: Message) => {
	let nonces = get(pendingNonces);
	if (!nonces.includes(data.nonce!)) {
		channelMessages.update((msgs) => {
			let messages = msgs.get(data.channel_id);
			if (!messages) {
				msgs.set(data.channel_id, [data]);
			} else {
				messages.push(data);
			}
			return msgs;
		});
	} else {
		channelMessages.update((msgs) => {
			let messages = msgs.get(data.channel_id)!;
			let message = messages.find((v) => (v.nonce = data.nonce))!;
			message.id = data.id;
			message.created_at = data.created_at;
			message.last_modified_at = data.last_modified_at;
			message.pending = false;
			return msgs;
		});
	}
	if (data.nonce !== null) {
		pendingNonces.update((nonces) =>
			nonces.splice(nonces.indexOf(data.nonce!), 1),
		);
	}
});

emitter.on("ACTOR_UPDATE", (data: UserActor) => {
	const currentActorData = get(currentActor)!;
	if (currentActorData.id == data.id) {
		return currentActor.set(data);
	}

	users.update((v) => {
		let idx = v.findIndex((v) => v.id == data.id);
		if (idx === -1) {
			v.push(data);
		} else {
			v[idx] = data;
		}
		return v;
	});
});
