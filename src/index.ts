type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "controller";
type Fetch = () => Promise<unknown>;
export type ProxyFetch = {
  GET: Fetch;
  POST: Fetch;
  PUT: Fetch;
  PATCH: Fetch;
  DELETE: Fetch;
  controller: AbortController;
};
type Request = {
  method: Method;
  signal: AbortSignal;
  body?: string;
  headers: {
    "Content-Type": string;
  };
};

// Custom error class to ensure status code gets forwarded
class HTTPError extends Error {
  name = "HTTPError";
  status: number;
  statusText: string;

  constructor(status: number, statusText: string, ...args) {
    super(...args);
    this.status = status;
    this.statusText = statusText;
  }
}

const defaultConfig = { headers: { "Content-Type": "application/json" } };

// A more robust fetch request that can create one service that can get more things.
// const service = proxyfetch('https://test.com/api/users')
// const user = await service.get('1'); // GET request on /api/users/1
// allows for all methods (get, post, put, delete, etc.)
export function proxyfetch(
  url: string,
  partialRequest = defaultConfig,
): ProxyFetch {
  let controller: AbortController;

  function get(_, method: Method) {
    if (method === "controller") return controller;
    return async function (ext = "", data = null) {
      try {
        controller = new AbortController();
        const req: Request = {
          method,
          signal: controller.signal,
          ...partialRequest,
        };
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
  return new Proxy<ProxyFetch>({} as ProxyFetch, { get });
}
