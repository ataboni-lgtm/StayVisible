import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { readStore, upsertClient } from '@/lib/stay-visible/local-store';

const zClientInput = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  company: z.string().optional().default(''),
  jobTitle: z.string().optional().default(''),
  industry: z.string().optional().default(''),
  location: z.string().optional().default(''),
  linkedInUrl: z.string().optional().default(''),
  targetAudience: z.string().optional().default(''),
  topics: z.string().optional().default(''),
  topicsToAvoid: z.string().optional().default(''),
  notificationMethod: z.enum(['Email', 'Text', 'Both']).default('Email'),
  status: z.enum(['Onboarding Needed', 'Active', 'Paused']).default('Onboarding Needed'),
});

export const GET = routeHandler(async () => {
  const data = await readStore();
  return NextResponse.json({ clients: data.clients });
});

export const POST = routeHandler(async (request: NextRequest) => {
  const parsed = zClientInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);
  const client = await upsertClient({
    ...parsed.data,
    phone: parsed.data.phone ?? '',
    company: parsed.data.company ?? '',
    jobTitle: parsed.data.jobTitle ?? '',
    industry: parsed.data.industry ?? '',
    location: parsed.data.location ?? '',
    linkedInUrl: parsed.data.linkedInUrl ?? '',
    targetAudience: parsed.data.targetAudience ?? '',
    topics: splitList(parsed.data.topics),
    topicsToAvoid: splitList(parsed.data.topicsToAvoid),
  });
  return NextResponse.json({ client });
});

function splitList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
