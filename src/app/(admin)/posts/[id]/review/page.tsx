import { PostReviewEditor } from '@/components/stay-visible/post-review-editor';
import { PageHeader } from '@/components/stay-visible/ui';
export default async function PostReviewPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <div className="@container/page"><PageHeader eyebrow="Post review" title="Make it feel unmistakably human" description="Give the draft one last read, then send a private approval link." /><PostReviewEditor postId={id} /></div>; }
