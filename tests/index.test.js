import fetch from 'isomorphic-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { proxyfetch } from '../src';

// MSW handlers
const handlers = [
	rest.get('https://test.com/get', async (_, res, ctx) => {
		return res(ctx.json({ id: '1' }));
	}),
	rest.post('https://test.com/post', async (req, res, ctx) => {
		console.log(req.body);
		return res(ctx.json(req.body));
	}),
	rest.get('https://test.com/forbidden', async (_, res, ctx) => {
		return res(ctx.status(403));
	}),
	rest.get('https://test.com/middleware', async (req, res, ctx) => {
		return res(
			ctx.json({
				'content-type': req.headers.get('content-type'),
				authorization: req.headers.get('authorization'),
			})
		);
	}),
];

// MSW setup
const server = setupServer(...handlers);
beforeAll(() => {
	server.listen();
	globalThis.fetch = fetch;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Tests
test('GET request - success', async () => {
	const [res, err] = await proxyfetch('https://test.com/get').get();
	expect(res).toEqual({ id: '1' });
	expect(err).toEqual(null);
});

test('POST request - success', async () => {
	const [res, err] = await proxyfetch('https://test.com/post').post({
		id: '2',
	});
	expect(res).toEqual({ id: '2' });
	expect(err).toEqual(null);
});

test('GET request - failure', async () => {
	const [res, err] = await proxyfetch('https://test.com/forbidden').get();
	expect(res).toEqual(null);
	expect(err.status).toEqual(403);
	expect(err.message).toEqual('Forbidden');
});

// Tests
test('GET request - success', async () => {
	const mw1 = (req) => {
		req.headers['Content-Type'] = 'test';
		return req;
	};

	const mw2 = (req) => {
		req.headers.Authorization = 'Bearer token';
		return req;
	};

	const config = { middleware: [mw1, mw2] };

	const [res, err] = await proxyfetch(
		'https://test.com/middleware',
		config
	).get();
	expect(res).toEqual({
		authorization: 'Bearer token',
		'content-type': 'test',
	});
	expect(err).toEqual(null);
});
