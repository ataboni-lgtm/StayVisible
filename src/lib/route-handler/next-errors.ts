import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function ApiError<T>(status: number, message: string, extra?: T) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function InternalServerError(error = 'Internal Server Error') {
  return ApiError(500, error);
}

export function UnauthorizedError(error = 'Unauthorized') {
  return ApiError(401, error);
}

export function BadRequestError<T>(error = 'Bad Request Error', extra?: T) {
  return ApiError(400, error, extra);
}

export function ZodValidationError(error: ZodError) {
  return BadRequestError('ValidationError', {
    issues: error.issues,
  });
}
