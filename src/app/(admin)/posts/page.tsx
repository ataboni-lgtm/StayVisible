import Link from 'next/link';
import { CalendarDays, CheckCircle2, Clock3, FilePenLine, MessageSquareText, Plus, Send } from 'lucide-react';
import { EmptyState, MetricCard, PageHeader, StatusBadge, primaryButtonClass, secondaryButtonClass } from '@/components/stay-visible/ui';
import { readStore } from '@/lib/stay-visible/local-store';
import type { Post, PostStatus } from '@/lib/stay-visible/types';

export const dynamic = 'force-dynamic';

const statusOrder: PostStatus[] = ['Changes Requested', 'Sent for Approval', 'Approved', 'Generated', 'Draft', 'Idea', 'Posted', 'Rejected'];

export default async function PostsPage() {
  const { posts } = await readStore();
  const sortedPosts = [...posts].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) || b.updatedAt.localeCompare(a.updatedAt));
  const counts = {
    draft: posts.filter((post) => post.status === 'Draft' || post.status === 'Generated' || post.status === 'Idea').length,
    approval: posts.filter((post) => post.status === 'Sent for Approval').length,
    changes: posts.filter((post) => post.status === 'Changes Requested').length,
    approved: posts.filter((post) => post.status === 'Approved').length,
    posted: posts.filter((post) => post.status === 'Posted').length,
  };

  return <div className="@container/page">
    <PageHeader
      eyebrow="Posts"
      title="Manage LinkedIn drafts"
      description="Review drafts, approval status, scheduled posts, and published content from one place."
      action={<Link href="/posts/new" className={primaryButtonClass}><Plus className="size-4" />New post</Link>}
    />

    <section className="grid gap-4 @md/page:grid-cols-2 @3xl/page:grid-cols-5">
      <MetricCard label="Draft pipeline" value={counts.draft} helper="Ideas and generated drafts" icon={FilePenLine} href="/posts" />
      <MetricCard label="Waiting approval" value={counts.approval} helper="Sent to clients" icon={Clock3} href="/posts" />
      <MetricCard label="Changes requested" value={counts.changes} helper="Needs revision" icon={MessageSquareText} tone="sand" href="/posts" />
      <MetricCard label="Ready to publish" value={counts.approved} helper="Approved by client" icon={CheckCircle2} tone="green" href="/posts" />
      <MetricCard label="Published" value={counts.posted} helper="Marked posted" icon={Send} tone="sky" href="/analytics" />
    </section>

    <section className="mt-7 surface-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 @md/page:flex-row @md/page:items-center @md/page:justify-between @md/page:px-6">
        <div>
          <h2 className="font-semibold text-[#0B1F3A]">All posts</h2>
          <p className="mt-1 text-sm text-slate-400">Click any item to review, schedule, send approval, or mark published.</p>
        </div>
        <Link href="/content-calendar" className={secondaryButtonClass}><CalendarDays className="size-4" />Calendar</Link>
      </div>
      {sortedPosts.length ? <div className="divide-y divide-slate-100">
        {sortedPosts.map((post) => <PostRow key={post.id} post={post} />)}
      </div> : <div className="p-6"><EmptyState title="No posts yet" description="Create a post from an event, meeting, article, or market idea. It will show up here as soon as it is saved." action={<Link href="/posts/new" className={primaryButtonClass}>Create first post</Link>} /></div>}
    </section>
  </div>;
}

function PostRow({ post }: { post: Post }) {
  const href = post.caption ? `/posts/${post.id}/review` : `/posts/${post.id}`;
  return <Link href={href} className="grid gap-4 px-5 py-4 transition hover:bg-slate-50/70 @3xl/page:grid-cols-[1fr_180px_150px] @md/page:px-6">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={post.status} />
        <span className="rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[11px] font-semibold text-blue-700">{post.type}</span>
      </div>
      <p className="mt-3 truncate text-sm font-semibold text-[#0B1F3A]">{post.topic}</p>
      <p className="mt-1 text-xs text-slate-400">{post.clientName}</p>
    </div>
    <SmallInfo label="Scheduled" value={post.scheduledFor ? formatDate(post.scheduledFor) : 'Not scheduled'} />
    <SmallInfo label="Updated" value={formatUpdated(post.updatedAt)} />
  </Link>;
}

function SmallInfo({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-medium text-slate-700">{value}</p></div>;
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(year, month - 1, day));
}

function formatUpdated(value: string) {
  if (value === 'Just now') return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}
