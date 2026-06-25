import Link from 'next/link';
import { BriefcaseBusiness, Building2, ExternalLink, FilePenLine, Mail, MapPin, Phone, Plus, Sparkles } from 'lucide-react';
import { readStore } from '@/lib/stay-visible/local-store';
import { EmptyState, PageHeader, StatusBadge, primaryButtonClass, secondaryButtonClass } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { clients } = await readStore();
  const client = clients.find((item) => item.id === id);
  if (!client) return <EmptyState title="Client not found" description="Add a client first, then their profile will appear here." action={<Link href="/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Plus className="size-4" />Add client</Link>} />;
  const roleLine = [client.jobTitle, client.company].filter(Boolean).join(' at ');
  return <div className="@container/page">
    <PageHeader eyebrow="Client profile" title={`${client.firstName} ${client.lastName}`} description={roleLine || 'Client details, LinkedIn voice, and content workflow.'} action={<div className="flex flex-wrap gap-2">
      <Link href={`/clients/${client.id}/onboarding`} className={primaryButtonClass}><Sparkles className="size-4" />Onboarding</Link>
      <Link href={`/posts/new`} className={secondaryButtonClass}><FilePenLine className="size-4" />Draft post</Link>
    </div>} />
    <div className="grid gap-6 @5xl/page:grid-cols-[0.85fr_1.15fr]">
      <section className="surface-card p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#E0F2FE] text-xl font-bold text-[#2563EB]">{client.initials}</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#0B1F3A]">{client.firstName} {client.lastName}</h2>
            <p className="mt-1 text-sm text-slate-500">{client.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={client.status} />
              <span className="rounded-full bg-[#FFF6E5] px-2.5 py-1 text-[11px] font-semibold text-amber-800">{client.notificationMethod}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3 text-sm">
          <ProfileRow icon={Mail} label="Email" value={client.email} />
          <ProfileRow icon={Phone} label="Phone" value={client.phone || 'Not added'} />
          <ProfileRow icon={Building2} label="Company" value={client.company || 'Not added'} />
          <ProfileRow icon={BriefcaseBusiness} label="Job title" value={client.jobTitle || 'Not added'} />
          <ProfileRow icon={MapPin} label="Location" value={client.location || 'Not added'} />
        </div>
        {client.linkedInUrl && <a href={client.linkedInUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-blue-700">Open LinkedIn profile <ExternalLink className="size-4" /></a>}
      </section>
      <section className="surface-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Voice and positioning</p>
            <h2 className="mt-1 font-semibold text-[#0B1F3A]">Content preferences</h2>
          </div>
          <Link href={`/clients/${client.id}/voice-profile`} className="text-sm font-semibold text-[#2563EB] hover:text-blue-700">Voice profile</Link>
        </div>
        <div className="mt-6 grid gap-5 @3xl/page:grid-cols-2">
          <InfoBlock title="Target audience" value={client.targetAudience || 'Not added yet'} />
          <InfoBlock title="Industry" value={client.industry || 'Not added yet'} />
          <TagBlock title="Known-for topics" items={client.topics} empty="No topics added yet" />
          <TagBlock title="Topics to avoid" items={client.topicsToAvoid} empty="No avoid-list topics yet" />
        </div>
      </section>
    </div>
  </div>;
}

function ProfileRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
    <Icon className="size-4 shrink-0 text-slate-400" />
    <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    <span className="min-w-0 truncate text-slate-700">{value}</span>
  </div>;
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
    <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
  </div>;
}

function TagBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {items.length ? items.map((item) => <span key={item} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{item}</span>) : <p className="text-sm text-slate-500">{empty}</p>}
    </div>
  </div>;
}
