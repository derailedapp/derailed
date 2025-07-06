import { env } from "$env/dynamic/public";
import { browser } from "$app/environment";

export class APIClient {
	// @ts-ignore
	token: string;

	constructor() {
		if (browser) {
			this.token = localStorage.getItem("token")!;
		}
	}

	request(method: string, route: string, body: any) {
		return fetch(env.PUBLIC_API_URL + route, {
			body: JSON.stringify(body),
			method,
			headers: {
				Authorization: this.token,
				"Content-Type": "application/json",
			},
		});
	}

	requestForm(method: string, route: string, body: FormData) {
		return fetch(env.PUBLIC_API_URL + route, {
			body: body,
			method,
			headers: {
				Authorization: this.token,
			},
		});
	}

	getCDNUrl(scope: string, id: string) {
		return env.PUBLIC_CDN_URL + `/${scope}/` + id;
	}
}

export default new APIClient();
