import EventEmitter from "eventemitter3";
import { currentUser, privateChannels, users } from "./state";
import { type PrivateChannel } from "./models";

export let emitter = new EventEmitter<string, any>();

emitter.on("READY", (data) => {
	currentUser.set({ profile: data.profile, account: data.account });
	users.update((v) => {
		v.push(data.profile);
		const private_channels: PrivateChannel[] = data.private_channels;
		private_channels.forEach((channel) => {
			channel.members?.forEach((profile) => {
				if (v.find((v) => v.user_id == profile.user_id) === undefined) {
					v.push(profile);
				}
			});
		});
		return v;
	});
	privateChannels.update((v) => v.concat(data.private_channels));
});
