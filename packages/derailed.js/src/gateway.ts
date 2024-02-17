import EventEmitter from "eventemitter3"

export interface Event {
    op: number,
    t?: string,
    d: any,
    s: number
}

export class DerailedWebSocket {
    public emitter: EventEmitter<string, any>
    public heartbeat_interval: number = 0
    public sequence: number = 0
    private token: string
    private ws: WebSocket | null = null
    private heartbeat_ref: number | null = null
    private connected: boolean = false

    constructor(token: string) {
        this.token = token
        this.emitter = new EventEmitter()
    }

    connect() {
        if (this.connected) {
            return
        }
        console.log("[WS] << INITIALIZING")
        this.connected = true
        // @ts-ignore
        this.ws = new WebSocket(import.meta.env.VITE_GATEWAY_URL)
        this.ws.onmessage = (ev) => {
            const data: Event = JSON.parse(ev.data)
            if (data.t !== undefined) {
                this.emitter.emit(data.t, data.d)
            }
            this.sequence = data.s

            console.debug(`[WS] << [t: ${data.t}] [s: ${data.s}] [op: ${data.op}]`)

            if (data.op === 1) {
                this.heartbeat_interval = data.d.heartbeat_interval
                this.heartbeat_ref = setInterval(() => {
                    this.ws?.send(JSON.stringify({
                        op: 3
                    }))
                }, this.heartbeat_interval)
                // Identify with the WebSocket
                this.ws?.send(JSON.stringify({
                    op: 2,
                    d: {
                        token: this.token
                    }
                }))
            }
        }
        this.ws.onclose = (_ev) => {
            if (this.heartbeat_ref) {
                clearInterval(this.heartbeat_ref)
                this.heartbeat_ref = null
            }

            this.connected = false
            this.ws = null
        }
        this.ws.onerror = (_ev) => {
            console.error("[WS] >> Error with websocket Gateway occured.")
        }
    }
}