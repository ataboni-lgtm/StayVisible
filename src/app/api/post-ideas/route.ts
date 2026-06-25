import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { savePostIdea } from '@/lib/stay-visible/local-store';

const zPostIdeaInput = z.object({
  clientId: z.string().min(1),
  postType: z.string().min(1),
  topic: z.string().min(1),
  date: z.string().optional(),
  location: z.string().optional(),
  mentions: z.string().optional(),
  mainTakeaway: z.string().min(1),
  notes: z.string().optional(),
  tone: z.string().optional(),
  callToAction: z.string().optional(),
  photoContext: z.string().optional(),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const parsed = zPostIdeaInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);
  const saved = await savePostIdea(parsed.data);
  return NextResponse.json(saved);
});
