# proxyfetch

Simple proxy-based fetch wrapper for DX.

## simple fetch

Allowed methods: `.get(id?: string)`, `.post(id?, data)`, `.put(id?, data)`, `patch(id?, data)`, and `delete(id?)`.

```js
import { proxyfetch } from 'proxyfetch';
const service = proxyfetch('https://pokeapi.co/api/v2/pokemon/');

const [response, error] = await service.get();
console.log(response); // an entire list of pokemon
console.log(error); // null

const [response, error] = await service.get('330');
console.log(response); // FLYGON!
console.log(error); // null

const [response, error] = await service.get('1100');
console.log(response); // null
console.log(error.status); // 404
```

The library supports aborting as well.
```js
import { proxyfetch } from 'proxyfetch';
const service = proxyfetch('https://pokeapi.co/api/v2/pokemon/');

service.controller.abort();
service.controller.signal.aborted; // true
```

## Wrapper example

A second parameter can be used to set the attributes of a `Request` object, except for the `method` and `body`. Easy wrappers around `proxyfetch` can be created to add `Authorization`, change the `Content-Type` or different settings of a request. In the below example we set a JWT token, or call a refresh request when

```js
import { proxyfetch } from 'proxyfetch';

async function fetcher(url, baseRequest) {
	const req = { ...baseRequest };
	req.headers.Authorization = `Bearer ${token}`;
	return await proxyFetch(url, req);
}
```

Great examples of logic that can be captured in wrappers (or middleware, depending on how you structure it), are:

- Setting request configuration
- Change the `Content-Type` of a specific request
- Set authentication information
- Determine if refresh is required before a request