import { writable } from "svelte/store";
import { env } from "$env/dynamic/public";
import Events from "./events";
import { goto } from "$app/navigation";

const ws = new WebSocket(env.PUBLIC_GATEWAY_URL);

ws.onopen = () => {
	let token = localStorage.getItem("token");
	if (token) {
		ws.send(
			JSON.stringify({
				op: "IDENTIFY",
				d: {
					token,
				},
			}),
		);
	}
};

ws.onmessage = (ev) => {
	let data = JSON.parse(ev.data);

	let op = data.op;
	let e = data.e;
	let t = e?.t;
	let d = e?.d;

	if (op == 0) {
		Events.emit(t, d);
	}
};

ws.onclose = (ev) => {
	if (ev.code === 401) {
		localStorage.removeItem("token");
		goto("/login");
	}
};
