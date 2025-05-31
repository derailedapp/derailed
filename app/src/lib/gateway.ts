import JSON from "json-bigint";
import { emitter } from "./events";
import { channelMessages, currentUser, privateChannels, savedChannels, users, waitingForMessages } from "./state";

let socket: WebSocket;
let socketOpen = false;

if (localStorage.getItem("token") !== null && !socketOpen) {
	socket = new WebSocket(import.meta.env.VITE_GATEWAY_URL);
} else {
	// @ts-ignore
	socket = null;
}

if (window) {
	// @ts-ignore
	window.WSS = socket;
}
let hbInt: number | null = null;
let sequence: number = 0;
let resume: boolean = false;
let sessionId: string | null = null;

socket.addEventListener("open", () => {
	console.log("Successfully opened connection to Gateway");
	socketOpen = true;
});

socket.addEventListener("message", (ev) => {
	const data = JSON.parse(ev.data);
	const op: number = data.op;
	const d: any = data.d;

	if (op === 2) {
		hbInt = setInterval(() => {
			if (socketOpen) {
				socket.send(
					JSON.stringify({
						op: 4,
						d: { sequence: sequence },
					}),
				);
			} else {
				if (hbInt) {
					clearInterval(hbInt);
				}
			}
		}, d);
	}

	if (op === 2 && resume) {
		socket.send(
			JSON.stringify({
				op: 3,
				d: { token: localStorage.getItem("token"), session_id: sessionId },
			}),
		);
	} else if (op === 2) {
		socket.send(
			JSON.stringify({
				op: 0,
				d: { token: localStorage.getItem("token") },
			}),
		);
	}

	if (op === 1) {
		sequence += 1;
		emitter.emit(data.t, d);
		if (data.t === "READY") {
			sessionId = d.session_id;
		}
	}
});

socket.addEventListener("close", (ev) => {
	console.log(
		`Gateway socket has closed. Closed with code ${ev.code} ("${ev.reason}")`,
	);
	if (ev.code !== 1011) {
		socket = new WebSocket(import.meta.env.VITE_GATEWAY_URL);
	} else {
		currentUser.set(null);
		users.set([]);
		privateChannels.set([]);
		channelMessages.set(new Map());
		savedChannels.set([]);
		waitingForMessages.set([]);
	}
});
