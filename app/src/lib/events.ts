import EventEmitter from "eventemitter3";
import { channelMessages, currentUser, privateChannels, users, waitingForMessages } from "./state";
import { type Message, type PrivateChannel, type Profile } from "./models";
import { get } from "svelte/store";

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

emitter.on("USER_UPDATE", (data: Profile) => {
	const currentUserData = get(currentUser)!;
	if (currentUserData.profile.user_id == data.user_id) {
		currentUser.set({account: currentUserData.account, profile: data});
	}
	users.update((v) => {
		let idx = v.findIndex((v) => v.user_id == data.user_id);
		if (idx === -1) {
			v.push(data);
		} else {
			v[idx] = data;
		}
		return v;
	})
})

emitter.on("MESSAGE_CREATE", (data: Message) => {
	const awaitedMessages = get(waitingForMessages)
	channelMessages.update((channels) => {
		const msgs = channels.get(data.channel_id);
		if (msgs === undefined) {
			return channels;
		}
		if (awaitedMessages.includes(data.id)) {
			waitingForMessages.update((ms) => {
				const idx = ms.indexOf(data.id);
				return ms.splice(idx, 1)
			});
		} else {
			msgs.push(data)
		}
		return channels;
	})
})
