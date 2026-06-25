import Link from 'next/link';
import { CalendarDays, CheckCircle2, Clock3, Lightbulb, MessageSquareText, Sparkles, UserPlus } from 'lucide-react';
import { clients, posts, weeklyIdeas } from '@/lib/stay-visible/demo-data';
import { EmptyState, MetricCard, PageHeader } from '@/components/stay-visible/ui';

export default function DashboardPage() {
  const attentionPosts = posts.filter((post) => post.status === 'Sent for Approval' || post.status === 'Changes Requested');
  const onboardingCount = clients.filter((client) => client.status === 'Onboarding Needed').length;
  const waitingCount = posts.filter((post) => post.status === 'Sent for Approval').length;
  const changesCount = posts.filter((post) => post.status === 'Changes Requested').length;
  const approvedCount = posts.filter((post) => post.status === 'Approved').length;
  const postedPosts = posts.filter((post) => post.status === 'Posted');
  return <div className="@container/page">
    <PageHeader eyebrow="Dashboard" title="Stay Visible" description="Start by adding a client, building their voice profile, and drafting the first LinkedIn post." action={<Link href="/posts/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Sparkles className="size-4" />Create a post</Link>} />
    <section className="grid gap-4 @md/page:grid-cols-2 @3xl/page:grid-cols-5">
      <MetricCard label="Need onboarding" value={onboardingCount} helper="Clients to follow up" icon={UserPlus} tone="sand" href="/clients" />
      <MetricCard label="Waiting for approval" value={waitingCount} helper="Sent to clients" icon={Clock3} href="/posts/new" />
      <MetricCard label="Changes requested" value={changesCount} helper="Needs revision" icon={MessageSquareText} tone="sand" href="/posts/new" />
      <MetricCard label="Ready to publish" value={approvedCount} helper="Approved drafts" icon={CheckCircle2} tone="green" href="/posts/new" />
      <MetricCard label="Weekly opportunities" value={weeklyIdeas.length} helper="Ideas ready to draft" icon={Lightbulb} tone="sky" href="/weekly-ideas" />
    </section>
    <div className="mt-7 grid gap-6 @4xl/page:grid-cols-[1.55fr_1fr]">
      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 @md/page:px-6"><div><h2 className="font-semibold text-[#0B1F3A]">Needs attention</h2><p className="mt-0.5 text-xs text-slate-400">Drafts currently moving through approval</p></div><Link href="/posts/new" className="text-xs font-semibold text-blue-600">View all</Link></div>
        {attentionPosts.length ? <div className="divide-y divide-slate-100">{attentionPosts.map((post) => <Link href={`/posts/${post.id}`} key={post.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/70 @md/page:px-6"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#0B1F3A]">{post.topic}</p><p className="mt-1 text-xs text-slate-400">{post.clientName} · {post.type}</p></div></Link>)}</div> : <div className="p-6"><EmptyState title="No drafts need attention" description="Once you send posts for approval or clients request changes, they will appear here." /></div>}
      </section>
      <section className="surface-card p-5 @md/page:p-6">
        <div className="flex items-center justify-between"><div><p className="eyebrow">This week</p><h2 className="mt-1 font-semibold text-[#0B1F3A]">Content opportunities</h2></div><span className="grid size-9 place-items-center rounded-xl bg-[#FFF6E5] text-amber-700"><CalendarDays className="size-4.5" /></span></div>
        {weeklyIdeas.length ? <div className="mt-5 space-y-3">{weeklyIdeas.slice(0, 3).map((idea, index) => <div key={idea.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-lg bg-white text-[11px] font-bold text-blue-600 shadow-sm">{index + 1}</span><div><p className="text-sm font-medium leading-5 text-[#0B1F3A]">{idea.topic}</p><p className="mt-1 text-xs text-slate-400">{idea.clientName}</p></div></div></div>)}</div> : <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Weekly ideas will appear after you add active clients.</p>}
        <Link href="/weekly-ideas" className="mt-4 flex h-10 items-center justify-center rounded-xl bg-[#E0F2FE] text-sm font-semibold text-blue-700 hover:bg-sky-200">Explore weekly ideas</Link>
      </section>
    </div>
    <section className="mt-7 surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 @md/page:px-6"><div><h2 className="font-semibold text-[#0B1F3A]">Recently posted</h2><p className="mt-0.5 text-xs text-slate-400">Approved content that has been marked posted.</p></div></div><div className="p-5 @md/page:p-6">{postedPosts.length ? postedPosts.map((post) => <Link href={`/posts/${post.id}`} key={post.id} className="block rounded-xl bg-slate-50 p-4 text-sm font-medium text-[#0B1F3A]">{post.topic}</Link>) : <p className="text-sm text-slate-500">No posted content yet.</p>}</div></section>
  </div>;
}
