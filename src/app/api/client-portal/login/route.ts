import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { readStore } from '@/lib/stay-visible/local-store';

const zClientLoginInput = z.object({
  email: z.string().email(),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const parsed = zClientLoginInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);

  const data = await readStore();
  const email = parsed.data.email.trim().toLowerCase();
  const client = data.clients.find((item) => item.email.toLowerCase() === email && item.status !== 'Paused');

  if (!client) {
    return NextResponse.json({ error: 'No active client found for that email.' }, { status: 404 });
  }

  // MVP note: swap this email lookup for Supabase auth or magic links before client production use.
  const cookieStore = await cookies();
  cookieStore.set('stayvisible-client-id', client.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ client: { id: client.id, firstName: client.firstName } });
});
