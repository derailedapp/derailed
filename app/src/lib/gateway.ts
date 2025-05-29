import JSON from "json-bigint";
import { emitter } from "./events";

const socket = new WebSocket(import.meta.env.GATEWAY_URL);
let hbInt: number | null = null;
let socketOpen = false;
let sequence: number = 0;
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
	socketOpen = false;
});
