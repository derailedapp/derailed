import JSON from "json-bigint"

export class HTTPClient {
    private token: string

    constructor(token: string) {
        this.token = token
    }

    async request(
        method: "POST" | "GET" | "PATCH" | "DELETE" | "PUT",
        path: string,
        json: any | null
    ): Promise<any> {
        let headers: any = {
            "Authorization": this.token
        }

        var data: any = undefined

        if (json !== null) {
            headers["Content-Type"] = "application/json"
            data = JSON.stringify(json)
        }

        return await fetch(
            path,
            {
                headers: headers,
                method: method,
                body: data
            }
        )
    }
}