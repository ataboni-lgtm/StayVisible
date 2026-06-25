import { PostReviewEditor } from '@/components/stay-visible/post-review-editor';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';
import { readStore } from '@/lib/stay-visible/local-store';

export const dynamic = 'force-dynamic';

export default async function PostReviewPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const { posts } = await readStore(); const post = posts.find((item) => item.id === id); if (!post) return <EmptyState title="Post not found" description="Generate a post first, then review it here." />; return <div className="@container/page"><PageHeader eyebrow="Post review" title="Make it feel unmistakably human" description="Give the draft one last read, then send a private approval link." /><PostReviewEditor post={post} /></div>; }
