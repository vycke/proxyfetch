// Custom error class to ensure status code
// Gets forwarded
class HTTPError extends Error {
	constructor(status, ...args) {
		super(...args);
		this.name = 'HTTPError';
		this.status = status;
	}
}

// Chaining middle-/afterware
function pipe(...fns) {
	if (fns.length === 0) return (t) => t;
	return fns.reduce((a, b) => (t) => {
		return b(a(t));
	});
}

const defaultConfig = { headers: { 'Content-Type': 'application/json' } };

export function proxyfetch(url, config = {}) {
	const { middleware, ..._config } = config;
	function get(_, method) {
		return async function (ext = '', data = null) {
			try {
				// Create request object
				const base = { method, ...defaultConfig, ..._config };
				if (data) base.body = JSON.stringify(data);
				const req = pipe(...(middleware || []))(base);

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

export function proxyclient(url, config = {}) {
	function get(_, key) {
		return proxyfetch(`${url}/${key}`, config);
	}
	return new Proxy({}, { get });
}
