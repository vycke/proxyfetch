// Custom error class to ensure status code gets forwarded
class HTTPError extends Error {
  constructor(status, statusText, ...args) {
    super(...args);
    this.name = "HTTPError";
    this.status = status;
    this.statusText = statusText;
  }
}

const defaultConfig = { headers: { "Content-Type": "application/json" } };

// A more robust fetch request that can create one service that can get more things.
// const service = proxyfetch('https://test.com/api/users')
// const user = await service.get('1'); // GET request on /api/users/1
// allows for all methods (get, post, put, delete, etc.)
export function proxyfetch(url, partialRequest = defaultConfig) {
  let controller;

  function get(_, method) {
    if (method === "controller") return controller;
    return async function (ext = "", data = null) {
      try {
        controller = new AbortController();
        const req = { method, signal: controller.signal, ...partialRequest };
        if (data) req.body = JSON.stringify(data);
        const res = await fetch(`${url}/${ext}`, req);
        if (!res.ok) throw new HTTPError(res.status, res.statusText);
        const body = await res.json();
        return [body, null];
      } catch (e) {
        return [null, e];
      }
    };
  }
  return new Proxy({}, { get });
}
