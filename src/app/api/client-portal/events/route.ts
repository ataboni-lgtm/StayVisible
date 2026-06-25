import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { readStore, savePostIdea } from '@/lib/stay-visible/local-store';

const zClientEventInput = z.object({
  postType: z.string().min(1),
  topic: z.string().min(1),
  date: z.string().optional(),
  location: z.string().optional(),
  mentions: z.string().optional(),
  mainTakeaway: z.string().optional(),
  notes: z.string().optional(),
  photoContext: z.string().optional(),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const cookieStore = await cookies();
  const clientId = cookieStore.get('stayvisible-client-id')?.value;
  if (!clientId) return NextResponse.json({ error: 'Client login required.' }, { status: 401 });

  const parsed = zClientEventInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);

  const data = await readStore();
  const client = data.clients.find((item) => item.id === clientId && item.status !== 'Paused');
  if (!client) return NextResponse.json({ error: 'Client not found.' }, { status: 404 });

  const saved = await savePostIdea({
    clientId,
    postType: parsed.data.postType,
    topic: parsed.data.topic,
    date: parsed.data.date,
    location: parsed.data.location,
    mentions: parsed.data.mentions,
    mainTakeaway: parsed.data.mainTakeaway || 'Client submitted this as an upcoming event. Add the takeaway after it happens.',
    notes: parsed.data.notes,
    photoContext: parsed.data.photoContext,
  });

  return NextResponse.json(saved);
});
