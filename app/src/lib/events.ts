import EventEmitter from "eventemitter3";
import type { Account, Relationship, RTChannel, UserActor } from "./models";
import {
	channels,
	currentAccount,
	currentActor,
	isLoading,
	relationships,
} from "./state";

const emitter = new EventEmitter();

export default emitter;

emitter.on("Ready", (data) => {
	const relationshipData: Relationship[] = data.relationships;
	const actor: UserActor = data.actor;
	const account: Account = data.account;
	const rtChannels: RTChannel[] = data.channels;

	currentActor.set(actor);
	currentAccount.set(account);
	channels.set(rtChannels);
	relationships.set(relationshipData);

	isLoading.set(false);
});
