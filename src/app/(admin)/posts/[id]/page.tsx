import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getPost } from '@/lib/stay-visible/demo-data';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(id);
  if (!post) return <EmptyState title="Post not found" description="Create a post opportunity first, then drafts will appear here." action={<Link href="/posts/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Plus className="size-4" />New post</Link>} />;
  return <div className="@container/page"><PageHeader eyebrow={post.type} title={post.topic} description={`For ${post.clientName}`} /></div>;
}
