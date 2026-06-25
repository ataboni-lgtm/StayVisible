import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { updatePost } from '@/lib/stay-visible/local-store';

const zPostPatch = z.object({
  caption: z.string().min(1).optional(),
  status: z.enum(['Idea', 'Draft', 'Generated', 'Sent for Approval', 'Changes Requested', 'Approved', 'Posted', 'Rejected']).optional(),
});

export const PATCH = routeHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const parsed = zPostPatch.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);
  const post = await updatePost(id, parsed.data);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  return NextResponse.json({ post });
});
