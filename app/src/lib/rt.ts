import { writable } from "svelte/store";
import { env } from "$env/dynamic/public";
import Events from "./events";

const ws = new WebSocket(env.PUBLIC_GATEWAY_URL);

ws.onopen = () => {
	let token = localStorage.getItem("token");
	if (token) {
		ws.send(
			JSON.stringify({
				op: "Identify",
				d: {
					token,
				},
			}),
		);
	}
};

ws.onmessage = (ev) => {
	let data = ev.data;

	let op = data.op;
	let e = data.e;
	let t = e?.t;
	let d = e?.d;

	if (op == "Dispatch") {
		Events.emit(t, d);
	}
};
