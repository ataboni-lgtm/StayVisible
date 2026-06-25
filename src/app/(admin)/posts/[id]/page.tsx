import Link from 'next/link';
import { Plus } from 'lucide-react';
import { readStore } from '@/lib/stay-visible/local-store';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { posts } = await readStore();
  const post = posts.find((item) => item.id === id);
  if (!post) return <EmptyState title="Post not found" description="Create a post opportunity first, then drafts will appear here." action={<Link href="/posts/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Plus className="size-4" />New post</Link>} />;
  return <div className="@container/page"><PageHeader eyebrow={post.type} title={post.topic} description={`For ${post.clientName}`} /></div>;
}
