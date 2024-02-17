import { DerailedWebSocket } from "derailed.js"

class Client {
    public loading: boolean = false;
    public connected: boolean = false;
    token: string;
    ws: DerailedWebSocket;

    constructor(token: string) {
        this.token = token
    }

    async connect() {
        if (this.loading || this.connected) {
            return;
        }

        this.loading = true;


    }
}

function useClient(): Client {
    var client: Client | undefined = (window as any)["gClient"]

    if (client === undefined) {
        client = new Client(localStorage.getItem("token")!);
        (window as any)["gClient"] = client;
    }

    return client
}
