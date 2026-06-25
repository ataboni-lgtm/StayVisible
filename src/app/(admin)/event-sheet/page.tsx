import { EventSheet } from '@/components/stay-visible/event-sheet';
import { PageHeader } from '@/components/stay-visible/ui';
import { readStore } from '@/lib/stay-visible/local-store';

export const dynamic = 'force-dynamic';

export default async function EventSheetPage() {
  const { clients, postOpportunities } = await readStore();
  const planned = postOpportunities.filter((item) => item.status === 'Idea').sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  return <div className="@container/page">
    <PageHeader eyebrow="Planning sheet" title="Events coming up" description="Add future events now, attach photo context later, and draft text when the moment is closer." />
    <EventSheet clients={clients} opportunities={planned} />
  </div>;
}
