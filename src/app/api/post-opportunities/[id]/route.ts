import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { db } from '@/lib/db/db';
import { postOpportunities } from '@/lib/stay-visible/schema';

const zUpdateOpportunityInput = z.object({
  notes: z.string().optional(),
  photoContext: z.string().optional(),
});

export const PATCH = routeHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const parsed = zUpdateOpportunityInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);
  const [row] = await db.update(postOpportunities).set({
    notes: parsed.data.notes,
    photoContext: parsed.data.photoContext,
    updatedAt: new Date(),
  }).where(eq(postOpportunities.id, id)).returning();
  if (!row) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
  return NextResponse.json({ opportunity: row });
});
