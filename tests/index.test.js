import fetch from 'isomorphic-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { proxyfetch, proxyclient } from '../src';

// MSW handlers
const _data = [{ id: '1' }, { id: '2' }];

const handlers = [
	rest.get('https://test.com/users', async (_, res, ctx) => {
		return res(ctx.json(_data));
	}),
	rest.get('https://test.com/users/:id', async (req, res, ctx) => {
		const _d = _data.find((d) => d.id === req.params.id);
		if (!_d) return res(ctx.status(404));
		return res(ctx.json(_d));
	}),
	rest.post('https://test.com/users', async (req, res, ctx) => {
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
	const [res, err] = await proxyfetch('https://test.com/users').get();
	expect(res).toEqual(_data);
	expect(err).toEqual(null);
});

test('GET request with extension - success', async () => {
	let [res, err] = await proxyfetch('https://test.com/users/1').get();
	expect(res).toEqual({ id: '1' });
	expect(err).toEqual(null);
	[res, err] = await proxyfetch('https://test.com/users/2').get();
	expect(res).toEqual({ id: '2' });
});

test('GET request with extension - not found', async () => {
	const [res, err] = await proxyfetch('https://test.com/users/3').get();
	expect(res).toEqual(null);
	expect(err.status).toEqual(404);
});

test('POST request - success', async () => {
	const [res, err] = await proxyfetch('https://test.com/users').post('', {
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

test('proxyclient', async () => {
	const client = proxyclient('https://test.com');
	const [res, err] = await client.users.get();
	expect(res).toEqual(_data);
	expect(err).toEqual(null);
});
