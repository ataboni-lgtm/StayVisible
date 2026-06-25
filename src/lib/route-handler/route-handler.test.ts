import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { routeHandler } from '@/lib/route-handler/route-handler';

describe('routeHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the original response when the handler succeeds', async () => {
    const handler = routeHandler(async (_req, props: { params: Promise<{ id: string }> }) =>
      NextResponse.json({ ok: true }, { status: 201 }),
    );

    const response = await handler(new NextRequest('http://localhost/test'), {
      params: Promise.resolve({ id: '123' }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('maps Zod errors to a 400 response', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const handler = routeHandler(async () => {
      throw new ZodError([
        {
          code: 'custom',
          message: 'Invalid payload',
          path: ['email'],
        },
      ]);
    });

    const response = await handler(new NextRequest('http://localhost/test'), {
      params: Promise.resolve({}),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'ValidationError',
      issues: [
        expect.objectContaining({
          message: 'Invalid payload',
          path: ['email'],
        }),
      ],
    });
  });

  it('maps generic errors to a 500 response', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const handler = routeHandler(async () => {
      throw new Error('boom');
    });

    const response = await handler(new NextRequest('http://localhost/test'), {
      params: Promise.resolve({}),
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'boom' });
  });

  it('maps non-error throw values to the unknown 500 response', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const handler = routeHandler(async () => {
      throw 'boom';
    });

    const response = await handler(new NextRequest('http://localhost/test'), {
      params: Promise.resolve({}),
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Unknown err' });
  });
});
