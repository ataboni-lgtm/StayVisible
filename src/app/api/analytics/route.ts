import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { readStore, refreshAnalyticsRecommendations, savePostAnalytics } from '@/lib/stay-visible/local-store';

const zAnalyticsInput = z.object({
  clientId: z.string().min(1),
  postId: z.string().optional(),
  capturedAt: z.string().min(1),
  postedAt: z.string().optional(),
  postingHour: z.coerce.number().int().min(0).max(23).optional(),
  impressions: z.coerce.number().int().min(0).default(0),
  reactions: z.coerce.number().int().min(0).default(0),
  comments: z.coerce.number().int().min(0).default(0),
  reposts: z.coerce.number().int().min(0).default(0),
  profileViews: z.coerce.number().int().min(0).default(0),
  linkClicks: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export const GET = routeHandler(async (request: NextRequest) => {
  const clientId = new URL(request.url).searchParams.get('clientId') ?? undefined;
  const data = await readStore();
  const analytics = clientId ? data.postAnalytics.filter((item) => item.clientId === clientId) : data.postAnalytics;
  const recommendations = clientId
    ? data.contentRecommendations.filter((item) => item.clientId === clientId && item.status === 'active')
    : data.contentRecommendations.filter((item) => item.status === 'active');

  return NextResponse.json({
    analytics,
    recommendations,
    summary: summarizeAnalytics(analytics),
  });
});

export const POST = routeHandler(async (request: NextRequest) => {
  const parsed = zAnalyticsInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);

  const analytics = await savePostAnalytics(parsed.data);
  const recommendations = await refreshAnalyticsRecommendations(parsed.data.clientId);
  return NextResponse.json({ analytics, recommendations });
});

function summarizeAnalytics(analytics: Awaited<ReturnType<typeof readStore>>['postAnalytics']) {
  const totals = analytics.reduce((sum, item) => ({
    impressions: sum.impressions + item.impressions,
    reactions: sum.reactions + item.reactions,
    comments: sum.comments + item.comments,
    reposts: sum.reposts + item.reposts,
    linkClicks: sum.linkClicks + item.linkClicks,
  }), { impressions: 0, reactions: 0, comments: 0, reposts: 0, linkClicks: 0 });
  const engagementRate = totals.impressions
    ? Number((((totals.reactions + totals.comments + totals.reposts + totals.linkClicks) / totals.impressions) * 100).toFixed(2))
    : 0;

  return {
    postCount: analytics.length,
    ...totals,
    engagementRate,
  };
}
