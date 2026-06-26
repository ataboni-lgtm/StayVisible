'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Building2, MapPin, Search, X } from 'lucide-react';
import type { Client, ClientStatus } from '@/lib/stay-visible/types';
import { clientDisplayName, clientRoleLine } from '@/lib/stay-visible/client-display';
import { EmptyState, StatusBadge, inputClass, secondaryButtonClass } from './ui';

const statuses: Array<'All statuses' | ClientStatus> = ['All statuses', 'Onboarding Needed', 'Active', 'Paused'];
const clientTypes: Array<'All types' | Client['clientType']> = ['All types', 'Individual', 'Company'];

export function ClientDirectory({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]>('All statuses');
  const [clientType, setClientType] = useState<(typeof clientTypes)[number]>('All types');

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return clients.filter((client) => {
      if (status !== 'All statuses' && client.status !== status) return false;
      if (clientType !== 'All types' && client.clientType !== clientType) return false;
      if (!normalizedQuery) return true;
      const searchable = [
        clientDisplayName(client),
        `${client.firstName} ${client.lastName}`,
        client.email,
        client.company,
        client.jobTitle,
        client.industry,
        client.location,
        client.targetAudience,
        ...client.topics,
        ...client.topicsToAvoid,
      ].join(' ').toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [clientType, clients, query, status]);

  function resetFilters() {
    setQuery('');
    setStatus('All statuses');
    setClientType('All types');
  }

  return <>
    <section className="surface-card grid gap-3 p-4 @2xl/page:grid-cols-[1fr_auto_auto]">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search clients, companies, topics..." />
      </div>
      <select value={clientType} onChange={(event) => setClientType(event.target.value as (typeof clientTypes)[number])} className={`${inputClass} @2xl/page:w-44`}>
        {clientTypes.map((type) => <option key={type}>{type}</option>)}
      </select>
      <select value={status} onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])} className={`${inputClass} @2xl/page:w-52`}>
        {statuses.map((item) => <option key={item}>{item}</option>)}
      </select>
    </section>

    <div className="mt-5">
      {filteredClients.length ? <div className="grid gap-4 @3xl/page:grid-cols-2 @6xl/page:grid-cols-3">
        {filteredClients.map((client) => <ClientCard key={client.id} client={client} />)}
      </div> : <EmptyState title="No matching clients" description="Try a different name, company, topic, type, or status." action={<button type="button" onClick={resetFilters} className={secondaryButtonClass}><X className="size-4" />Clear filters</button>} />}
    </div>
  </>;
}

function ClientCard({ client }: { client: Client }) {
  const displayName = clientDisplayName(client);
  const roleLine = clientRoleLine(client);

  return <Link href={`/clients/${client.id}`} className="surface-card group p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(15,23,42,0.09)]">
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
  </Link>;
}
