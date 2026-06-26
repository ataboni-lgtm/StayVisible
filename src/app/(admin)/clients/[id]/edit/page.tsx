import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ClientForm } from '@/components/stay-visible/client-form';
import { readStore } from '@/lib/stay-visible/local-store';
import { clientDisplayName } from '@/lib/stay-visible/client-display';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { clients } = await readStore();
  const client = clients.find((item) => item.id === id);
  if (!client) return <EmptyState title="Client not found" description="Add a client before editing their profile." action={<Link href="/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Plus className="size-4" />Add client</Link>} />;
  return <div className="@container/page mx-auto max-w-4xl">
    <PageHeader eyebrow="Client profile" title={`Edit ${clientDisplayName(client)}`} description="Update contact details, professional context, status, and content preferences." />
    <ClientForm client={client} />
  </div>;
}
