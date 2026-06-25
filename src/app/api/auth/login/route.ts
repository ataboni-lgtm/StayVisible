import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
const zLoginInput = z.object({ email: z.string().email(), password: z.string().min(6) });
export const POST = routeHandler(async (request: NextRequest) => {
  // Authentication
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.json({ error: 'Supabase Auth is not configured.' }, { status: 503 });
  // Authorization: Admin membership is checked by RLS after authentication.
  // Input validation
  const parsed = zLoginInput.safeParse(await request.json()); if (!parsed.success) return ZodValidationError(parsed.error);
  // Processing the request
  const authResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
  const result = await authResponse.json() as { access_token?: string; expires_in?: number; error_description?: string; msg?: string };
  if (!authResponse.ok || !result.access_token) return NextResponse.json({ error: result.error_description ?? result.msg ?? 'Invalid email or password.' }, { status: 401 });
  const response = NextResponse.json({ success: true }); response.cookies.set('stayvisible-access-token', result.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: result.expires_in ?? 3600 }); return response;
});
