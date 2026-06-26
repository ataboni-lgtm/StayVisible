import { BarChart3, Clock3, MessageCircle, MousePointerClick, Repeat2, Sparkles, ThumbsUp } from 'lucide-react';
import { AnalyticsEntryForm } from '@/components/stay-visible/analytics-entry-form';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';
import { readStore } from '@/lib/stay-visible/local-store';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const data = await readStore();
  const summary = summarize(data.postAnalytics);
  const activeRecommendations = data.contentRecommendations.filter((item) => item.status === 'active');

  return <div className="@container/page">
    <PageHeader
      eyebrow="Analytics"
      title="Content performance"
      description="Track LinkedIn engagement manually now, then use the same backend for official LinkedIn analytics later."
    />
    <section className="grid gap-4 @md/page:grid-cols-2 @3xl/page:grid-cols-5">
      <Metric icon={BarChart3} label="Impressions" value={summary.impressions} />
      <Metric icon={ThumbsUp} label="Reactions" value={summary.reactions} />
      <Metric icon={MessageCircle} label="Comments" value={summary.comments} />
      <Metric icon={Repeat2} label="Reposts" value={summary.reposts} />
      <Metric icon={MousePointerClick} label="Engagement" value={`${summary.engagementRate}%`} />
    </section>

    <div className="mt-7 grid gap-6 @5xl/page:grid-cols-[1fr_0.9fr]">
      <AnalyticsEntryForm clients={data.clients} posts={data.posts} />
      <section className="surface-card p-5 @md/page:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Suggestions</p>
            <h2 className="mt-1 font-semibold text-[#0B1F3A]">What to improve next</h2>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-[#FFF6E5] text-amber-700"><Sparkles className="size-5" /></span>
        </div>
        {activeRecommendations.length ? <div className="mt-5 space-y-3">{activeRecommendations.slice(0, 5).map((recommendation) => <div key={recommendation.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#0B1F3A]">{recommendation.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{recommendation.rationale}</p>
              <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-slate-600">{recommendation.suggestedAction}</p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{recommendation.confidenceScore}%</span>
          </div>
        </div>)}</div> : <div className="mt-5"><EmptyState title="No suggestions yet" description="Add analytics for a posted item and Stay Visible will create posting-time and content suggestions." /></div>}
      </section>
    </div>

    <section className="mt-7 surface-card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 @md/page:px-6">
        <h2 className="font-semibold text-[#0B1F3A]">Recent analytics</h2>
        <p className="mt-1 text-sm text-slate-400">Latest manually entered performance data.</p>
      </div>
      {data.postAnalytics.length ? <div className="divide-y divide-slate-100">{data.postAnalytics.slice(0, 10).map((item) => <div key={item.id} className="grid gap-3 px-5 py-4 @3xl/page:grid-cols-[1fr_repeat(4,110px)] @md/page:px-6">
        <div>
          <p className="text-sm font-semibold text-[#0B1F3A]">{item.postTopic ?? 'LinkedIn post'}</p>
          <p className="mt-1 text-xs text-slate-400">{item.capturedAt}{item.postingHour !== undefined ? ` · ${formatHour(item.postingHour)}` : ''}</p>
        </div>
        <SmallMetric label="Impressions" value={item.impressions} />
        <SmallMetric label="Reactions" value={item.reactions} />
        <SmallMetric label="Comments" value={item.comments} />
        <SmallMetric label="Engagement" value={`${item.engagementRate}%`} />
      </div>)}</div> : <div className="p-6"><EmptyState title="No analytics yet" description="Once posts are published, add their impressions, reactions, comments, reposts, and clicks here." /></div>}
    </section>
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: number | string }) {
  return <div className="surface-card p-5"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon className="size-5" /></span><p className="mt-5 text-3xl font-semibold tracking-tight text-[#0B1F3A]">{value}</p><p className="mt-1 text-sm font-medium text-slate-700">{label}</p></div>;
}

function SmallMetric({ label, value }: { label: string; value: number | string }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-[#0B1F3A]">{value}</p></div>;
}

function summarize(analytics: Awaited<ReturnType<typeof readStore>>['postAnalytics']) {
  const totals = analytics.reduce((sum, item) => ({
    impressions: sum.impressions + item.impressions,
    reactions: sum.reactions + item.reactions,
    comments: sum.comments + item.comments,
    reposts: sum.reposts + item.reposts,
    linkClicks: sum.linkClicks + item.linkClicks,
  }), { impressions: 0, reactions: 0, comments: 0, reposts: 0, linkClicks: 0 });
  const engagementRate = totals.impressions ? Number((((totals.reactions + totals.comments + totals.reposts + totals.linkClicks) / totals.impressions) * 100).toFixed(2)) : 0;
  return { ...totals, engagementRate };
}

function formatHour(hour: number) {
  const date = new Date(2026, 0, 1, hour);
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(date);
}
