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

## Middleware

Middleware functions take a `Request` object as input, and a `Request` object as output.

```js
import { proxyfetch } from 'proxyfetch';

const mw = (req) => {
		req.headers.Authorization = 'Bearer token';
		return req;
	};

const service = proxyfetch('https://pokeapi.co/api/v2/pokemon/', {
	config: middleware: [mw]
});
```

## Named client

Allows you to use parts of the API url in the object.

```js
import { proxyclient } from 'proxyfetch';
const service = proxyclient('https://pokeapi.co/api/v2/');

const [response, error] = await service.pokemon.get();
console.log(response); // an entire list of pokemon
console.log(error); // null
```
