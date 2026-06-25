import {
  ApiError,
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
  ZodValidationError,
} from '@/lib/route-handler/next-errors';
import { ZodError } from 'zod';

describe('next-errors helpers', () => {
  it('builds json api error responses with optional extra fields', async () => {
    const response = ApiError(418, 'teapot', { detail: 'short and stout' });

    expect(response.status).toBe(418);
    await expect(response.json()).resolves.toEqual({
      error: 'teapot',
      detail: 'short and stout',
    });
  });

  it('returns canned error responses for common statuses', async () => {
    await expect(InternalServerError().json()).resolves.toEqual({
      error: 'Internal Server Error',
    });
    await expect(InternalServerError('boom').json()).resolves.toEqual({
      error: 'boom',
    });
    await expect(UnauthorizedError().json()).resolves.toEqual({
      error: 'Unauthorized',
    });
    await expect(BadRequestError('bad', { field: 'email' }).json()).resolves.toEqual({
      error: 'bad',
      field: 'email',
    });
  });

  it('serializes zod issues into a validation response', async () => {
    const response = ZodValidationError(
      new ZodError([
        {
          code: 'custom',
          message: 'Required',
          path: ['email'],
        },
      ]),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'ValidationError',
      issues: [expect.objectContaining({ message: 'Required', path: ['email'] })],
    });
  });
});
