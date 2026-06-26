import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CalendarDays, FilePenLine, Sparkles } from 'lucide-react';
import { ClientPortalEventForm } from '@/components/stay-visible/client-portal-event-form';
import { ClientPortalPhotoUpload } from '@/components/stay-visible/client-portal-photo-upload';
import { EmptyState, StatusBadge } from '@/components/stay-visible/ui';
import { readStore } from '@/lib/stay-visible/local-store';
import { clientDisplayName, clientRoleLine } from '@/lib/stay-visible/client-display';

export const dynamic = 'force-dynamic';

export default async function ClientPortalPage() {
  const cookieStore = await cookies();
  const clientId = cookieStore.get('stayvisible-client-id')?.value;
  if (!clientId) redirect('/client-login');

  const data = await readStore();
  const client = data.clients.find((item) => item.id === clientId && item.status !== 'Paused');
  if (!client) redirect('/client-login');

  const opportunities = data.postOpportunities.filter((item) => item.clientId === client.id);
  const displayName = clientDisplayName(client);
  const roleLine = clientRoleLine(client);

  return <main className="min-h-screen bg-[#F8FAFC]">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/client-portal" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-[#2563EB] text-white shadow-sm"><Sparkles className="size-4.5" /></span>
          <span className="text-lg font-semibold tracking-tight text-[#0B1F3A]">StayVisible</span>
        </Link>
        <span className="rounded-full bg-[#F4D7A1] px-3 py-1 text-xs font-semibold text-[#0B1F3A]">{displayName}</span>
      </div>
    </header>
    <div className="@container/page mx-auto max-w-6xl px-4 py-8">
      <div className="mb-7">
        <p className="eyebrow">Client portal</p>
        <h1 className="page-title">What should we know about?</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Add upcoming events now. Photos and final takeaways can come later.</p>
      </div>
      <section className="mb-7 grid gap-4 @3xl/page:grid-cols-3">
        <div className="surface-card p-5 @3xl/page:col-span-2">
          <p className="eyebrow">Your profile</p>
          <h2 className="mt-2 text-xl font-semibold text-[#0B1F3A]">{displayName}</h2>
          <div className="mt-4 grid gap-4 text-sm @lg/page:grid-cols-2">
            <div><p className="font-semibold text-[#0B1F3A]">{client.clientType === 'Company' ? 'Positioning' : 'Role'}</p><p className="mt-1 text-slate-500">{roleLine || 'Not added yet'}</p></div>
            <div><p className="font-semibold text-[#0B1F3A]">Location</p><p className="mt-1 text-slate-500">{client.location || 'Not added yet'}</p></div>
            <div><p className="font-semibold text-[#0B1F3A]">{client.clientType === 'Company' ? 'Primary contact' : 'Email'}</p><p className="mt-1 text-slate-500">{client.clientType === 'Company' ? `${client.firstName} ${client.lastName} · ${client.email}` : client.email}</p></div>
            <div><p className="font-semibold text-[#0B1F3A]">LinkedIn</p><p className="mt-1 truncate text-slate-500">{client.linkedInUrl || 'Not added yet'}</p></div>
          </div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-[#E0F2FE]/60 p-5">
          <p className="text-sm font-semibold text-[#0B1F3A]">Only your information is shown here.</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">Anything you submit goes to your Stay Visible admin to draft or schedule.</p>
        </div>
      </section>
      <ClientPortalEventForm />
      <section className="mt-7 surface-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <CalendarDays className="size-5 text-blue-600" />
          <div>
            <h2 className="font-semibold text-[#0B1F3A]">Your submitted items</h2>
            <p className="mt-1 text-sm text-slate-400">These are visible to the Stay Visible admin workspace.</p>
          </div>
        </div>
        {opportunities.length ? <div className="divide-y divide-slate-100">
          {opportunities.map((opportunity) => <article key={opportunity.id} className="grid gap-4 px-5 py-4 @lg/page:grid-cols-[1fr_auto] @lg/page:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#0B1F3A]">{opportunity.topic}</h3>
                <StatusBadge status={opportunity.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{opportunity.date || 'Date TBD'}{opportunity.location ? ` · ${opportunity.location}` : ''}</p>
              {opportunity.photoContext && <p className="mt-2 max-w-2xl whitespace-pre-line text-xs leading-5 text-slate-400">{opportunity.photoContext}</p>}
            </div>
            <div className="space-y-2"><ClientPortalPhotoUpload opportunityId={opportunity.id} /><span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600"><FilePenLine className="size-4" />Admin will draft from this</span></div>
          </article>)}
        </div> : <div className="p-5"><EmptyState title="No events submitted yet" description="Add the first event above and it will appear here." /></div>}
      </section>
    </div>
  </main>;
}
