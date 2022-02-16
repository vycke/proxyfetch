enum Method {
	GET = 'GET',
	PUT = 'PUT',
	POST = 'POST',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}

type Request = {
	method: Method;
	body: string;
	headers: { [key: string]: string };
} & { [key: string]: unknown };

const defaultHeaders = { 'Content-Type': 'application/json' };

export function proxyfetch(url: string) {
	function get(_target: object, method: Method) {
		return async function (id = '', data = {}) {
			try {
				const request: Request = {
					method,
					body: JSON.stringify(data),
					headers: defaultHeaders,
				};

				const response = await fetch(`${url}/${id}`, request);

				if (!response.ok) throw Error(response.statusText);
				return [response.json(), null];
			} catch (e) {
				return [null, e];
			}
		};
	}
	return new Proxy({}, { get });
}
