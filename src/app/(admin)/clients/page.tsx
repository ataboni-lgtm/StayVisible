import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ClientDirectory } from '@/components/stay-visible/client-directory';
import { readStore } from '@/lib/stay-visible/local-store';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const { clients } = await readStore();
  return <div className="@container/page"><PageHeader eyebrow="People" title="Clients" description="Manage each client’s details, voice, and content preferences." action={<Link href="/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="size-4" />Add client</Link>} />
    {clients.length ? <ClientDirectory clients={clients} /> : <EmptyState title="No clients yet" description="Add your first client to begin onboarding their LinkedIn voice." action={<Link href="/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Plus className="size-4" />Add client</Link>} />}
  </div>;
}
