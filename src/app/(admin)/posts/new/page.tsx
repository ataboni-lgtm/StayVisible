import { PageHeader } from '@/components/stay-visible/ui';
import { PostOpportunityForm } from '@/components/stay-visible/post-opportunity-form';
import { readStore } from '@/lib/stay-visible/local-store';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() { const { clients } = await readStore(); return <div className="@container/page"><PageHeader eyebrow="New post opportunity" title="Turn a real moment into a post" description="Give StayVisible the raw material. It will use the client’s voice profile to shape the writing." /><PostOpportunityForm clients={clients} /></div>; }
