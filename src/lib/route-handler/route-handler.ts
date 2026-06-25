import {
  InternalServerError,
  ZodValidationError,
} from '@/lib/route-handler/next-errors';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

type RouteHandler<
  T extends NextResponse = NextResponse,
  P = { params: Promise<any> },
> = (req: NextRequest, props: P) => T | Promise<T>;

/**
 * Wraps a Next route handler with a try/catch error handler.
 */
export function routeHandler<
  T extends NextResponse = NextResponse,
  P = { params: Promise<any> },
>(handler: RouteHandler<T, P>) {
  return async function (req: NextRequest, props: P) {
    try {
      return await handler(req, props);
    } catch (error) {
      console.error(error);

      switch (true) {
        case error instanceof ZodError:
          return ZodValidationError(error);
        case error instanceof Error:
          return InternalServerError(error.message);
        default:
          return InternalServerError('Unknown err');
      }
    }
  };
}
