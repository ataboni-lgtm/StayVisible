import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { authenticateClientPortal } from '@/lib/stay-visible/local-store';

const zClientLoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const parsed = zClientLoginInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);

  const email = parsed.data.email.trim().toLowerCase();
  const client = await authenticateClientPortal(email, parsed.data.password);

  if (!client) {
    return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
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
