import Link from 'next/link';
import { CalendarDays, CheckCircle2, Clock3, FilePenLine, Plus } from 'lucide-react';
import { readStore } from '@/lib/stay-visible/local-store';
import type { Post } from '@/lib/stay-visible/types';
import { EmptyState, PageHeader, ScheduledBadge, StatusBadge, primaryButtonClass } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function ContentCalendarPage() {
  const { posts } = await readStore();
  const scheduledPosts = posts
    .filter((post) => Boolean(calendarDate(post)))
    .sort((a, b) => calendarDate(a).localeCompare(calendarDate(b)));
  const upcomingPosts = scheduledPosts.filter((post) => post.status !== 'Posted');
  const publishedPosts = scheduledPosts.filter((post) => post.status === 'Posted');
  const grouped = groupPostsByMonth(scheduledPosts);

  return <div className="@container/page">
    <PageHeader
      eyebrow="Content calendar"
      title="Scheduled LinkedIn posts"
      description="Posts appear here automatically when you add a scheduled publish date. When you mark one published, the calendar updates its status."
      action={<Link href="/posts/new" className={primaryButtonClass}><Plus className="size-4" />New post</Link>}
    />

    <section className="grid gap-4 @md/page:grid-cols-3">
      <CalendarMetric icon={CalendarDays} label="Scheduled" value={upcomingPosts.length} helper="Not published yet" />
      <CalendarMetric icon={CheckCircle2} label="Published" value={publishedPosts.length} helper="Marked posted" tone="green" />
      <CalendarMetric icon={Clock3} label="This month" value={scheduledPosts.filter((post) => isCurrentMonth(calendarDate(post))).length} helper="Scheduled or posted" tone="sand" />
    </section>

    <section className="mt-7 surface-card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 @md/page:px-6">
        <h2 className="font-semibold text-[#0B1F3A]">Calendar</h2>
        <p className="mt-1 text-sm text-slate-400">Use each post review page to add or change the scheduled publish date.</p>
      </div>
      {scheduledPosts.length ? <div className="divide-y divide-slate-100">
        {Object.entries(grouped).map(([month, monthPosts]) => <div key={month} className="grid gap-4 px-5 py-5 @2xl/page:grid-cols-[180px_1fr] @md/page:px-6">
          <div>
            <p className="text-sm font-semibold text-[#0B1F3A]">{month}</p>
            <p className="mt-1 text-xs text-slate-400">{monthPosts.length} post{monthPosts.length === 1 ? '' : 's'}</p>
          </div>
          <div className="grid gap-3">
            {monthPosts.map((post) => <Link href={`/posts/${post.id}/review`} key={post.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-blue-100 hover:bg-slate-50/70">
              <div className="flex flex-col gap-3 @md/page:flex-row @md/page:items-start @md/page:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={post.status === 'Posted' ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700' : 'rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700'}>{formatDate(calendarDate(post))}</span>
                    {post.status !== 'Posted' && <ScheduledBadge />}
                    <StatusBadge status={post.status} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#0B1F3A]">{post.topic}</p>
                  <p className="mt-1 text-xs text-slate-400">{post.clientName} · {post.type}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600"><FilePenLine className="size-3.5" />Review</span>
              </div>
            </Link>)}
          </div>
        </div>)}
      </div> : <div className="p-6"><EmptyState title="No scheduled posts yet" description="Open a post review page, choose a publish date, and it will appear here automatically." action={<Link href="/posts/new" className={primaryButtonClass}>Create a post</Link>} /></div>}
    </section>
  </div>;
}

function CalendarMetric({ icon: Icon, label, value, helper, tone = 'blue' }: { icon: typeof CalendarDays; label: string; value: number; helper: string; tone?: 'blue' | 'green' | 'sand' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    sand: 'bg-[#FFF6E5] text-amber-700',
  };
  return <div className="surface-card p-5">
    <span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></span>
    <p className="mt-5 text-3xl font-semibold tracking-tight text-[#0B1F3A]">{value}</p>
    <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
    <p className="mt-1 text-xs text-slate-400">{helper}</p>
  </div>;
}

function calendarDate(post: Post) {
  if (post.status === 'Posted') return post.postedAt?.slice(0, 10) ?? post.scheduledFor ?? post.updatedAt.slice(0, 10);
  return post.scheduledFor ?? '';
}

function groupPostsByMonth(posts: Post[]) {
  return posts.reduce<Record<string, Post[]>>((groups, post) => {
    const month = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(parseIsoDate(calendarDate(post)));
    groups[month] = [...(groups[month] ?? []), post];
    return groups;
  }, {});
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(parseIsoDate(value));
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isCurrentMonth(value: string) {
  if (!value) return false;
  const date = parseIsoDate(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}
