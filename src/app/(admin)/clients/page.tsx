import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { clients } from '@/lib/stay-visible/demo-data';
import { EmptyState, inputClass, PageHeader } from '@/components/stay-visible/ui';

export default function ClientsPage() {
  return <div className="@container/page"><PageHeader eyebrow="People" title="Clients" description="Manage each client’s details, voice, and content preferences." action={<Link href="/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="size-4" />Add client</Link>} />
    <div className="surface-card p-4"><div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className={`${inputClass} pl-10`} placeholder="Search clients..." /></div></div>
    <div className="mt-5">{clients.length ? null : <EmptyState title="No clients yet" description="Add your first client to begin onboarding their LinkedIn voice." action={<Link href="/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Plus className="size-4" />Add client</Link>} />}</div>
  </div>;
}
