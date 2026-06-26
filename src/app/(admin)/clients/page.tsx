import Link from 'next/link';
import { ArrowRight, Building2, MapPin, Plus, Search } from 'lucide-react';
import { readStore } from '@/lib/stay-visible/local-store';
import { clientDisplayName, clientRoleLine } from '@/lib/stay-visible/client-display';
import { EmptyState, inputClass, PageHeader, StatusBadge } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const { clients } = await readStore();
  return <div className="@container/page"><PageHeader eyebrow="People" title="Clients" description="Manage each client’s details, voice, and content preferences." action={<Link href="/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="size-4" />Add client</Link>} />
    <div className="surface-card p-4"><div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className={`${inputClass} pl-10`} placeholder="Search clients..." /></div></div>
    <div className="mt-5">{clients.length ? <div className="grid gap-4 @3xl/page:grid-cols-2 @6xl/page:grid-cols-3">
      {clients.map((client) => <Link key={client.id} href={`/clients/${client.id}`} className="surface-card group p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(15,23,42,0.09)]">
        {(() => {
          const displayName = clientDisplayName(client);
          const roleLine = clientRoleLine(client);
          return <>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#E0F2FE] text-sm font-bold text-[#2563EB]">{client.initials}</span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-[#0B1F3A]">{displayName}</h2>
              <p className="truncate text-sm text-slate-500">{client.email}</p>
            </div>
          </div>
          <ArrowRight className="mt-3 size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <StatusBadge status={client.status} />
          <span className="rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[11px] font-semibold text-blue-700">{client.clientType}</span>
          <span className="rounded-full bg-[#FFF6E5] px-2.5 py-1 text-[11px] font-semibold text-amber-800">{client.notificationMethod}</span>
        </div>
        <div className="mt-5 space-y-2 text-sm text-slate-500">
          {roleLine && <p className="flex items-center gap-2"><Building2 className="size-4 text-slate-400" />{roleLine}</p>}
          {client.location && <p className="flex items-center gap-2"><MapPin className="size-4 text-slate-400" />{client.location}</p>}
        </div>
        </>;
        })()}
      </Link>)}
    </div> : <EmptyState title="No clients yet" description="Add your first client to begin onboarding their LinkedIn voice." action={<Link href="/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Plus className="size-4" />Add client</Link>} />}</div>
  </div>;
}
