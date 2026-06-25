import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getClient } from '@/lib/stay-visible/demo-data';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) return <EmptyState title="Client not found" description="Add a client first, then their profile will appear here." action={<Link href="/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Plus className="size-4" />Add client</Link>} />;
  return <div className="@container/page"><PageHeader eyebrow="Client profile" title={`${client.firstName} ${client.lastName}`} description={`${client.jobTitle} at ${client.company}`} /></div>;
}
