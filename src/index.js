// Custom error class to ensure status code
// Gets forwarded
class HTTPError extends Error {
	constructor(status, ...args) {
		super(...args);
		this.name = 'HTTPError';
		this.status = status;
	}
}

// Basic configuration of a HTTP request
const defaultConfig = { headers: { 'Content-Type': 'application/json' } };

export function proxyfetch(url, partialRequest = defaultConfig) {
	function get(_, method) {
		return async function (ext = '', data = null) {
			try {
				// Create request object
				const req = { method, ...partialRequest };
				if (data) req.body = JSON.stringify(data);

				const res = await fetch(`${url}/${ext}`, req);
				if (!res.ok) throw new HTTPError(res.status, res.statusText);
				return [await res.json(), null];
			} catch (e) {
				return [null, e];
			}
		};
	}
	return new Proxy({}, { get });
}

export function proxyclient(url, partialRequest = defaultConfig) {
	function get(_, key) {
		return proxyfetch(`${url}/${key}`, partialRequest);
	}
	return new Proxy({}, { get });
}
