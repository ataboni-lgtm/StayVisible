import Link from 'next/link';
import { FilePenLine, Plus, Sparkles } from 'lucide-react';
import { readStore } from '@/lib/stay-visible/local-store';
import { EmptyState, PageHeader, StatusBadge, primaryButtonClass, secondaryButtonClass } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { posts } = await readStore();
  const post = posts.find((item) => item.id === id);
  if (!post) return <EmptyState title="Post not found" description="Create a post opportunity first, then drafts will appear here." action={<Link href="/posts/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Plus className="size-4" />New post</Link>} />;
  return <div className="@container/page"><PageHeader eyebrow={post.type} title={post.topic} description={`For ${post.clientName}`} action={<div className="flex flex-wrap gap-2">
    <Link href={`/posts/${post.id}/review`} className={primaryButtonClass}><Sparkles className="size-4" />Review draft</Link>
    <Link href="/posts/new" className={secondaryButtonClass}><FilePenLine className="size-4" />New post</Link>
  </div>} />
    <section className="surface-card p-6">
      <div className="flex flex-wrap items-center gap-2"><StatusBadge status={post.status} /><span className="rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[11px] font-semibold text-blue-700">{post.type}</span></div>
      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Saved idea</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.caption || 'No details added yet.'}</p>
      </div>
    </section>
  </div>;
}
