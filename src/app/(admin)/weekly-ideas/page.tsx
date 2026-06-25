import { CalendarDays, Sparkles } from 'lucide-react';
import { readStore } from '@/lib/stay-visible/local-store';
import { EmptyState, inputClass, PageHeader } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function WeeklyIdeasPage() {
  const { clients, weeklyIdeas } = await readStore();
  return <div className="@container/page"><PageHeader eyebrow="Weekly LinkedIn assistant" title="A useful reason to post" description="Fresh ideas shaped by each client’s role, audience, voice, and recent activity." action={<button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white"><Sparkles className="size-4" />Generate this week’s ideas</button>} /><section className="surface-card mb-6 grid gap-4 p-4 @lg/page:grid-cols-[1fr_1fr_2fr]"><select className={inputClass}><option>All active clients</option>{clients.filter((client) => client.status === 'Active').map((client) => <option key={client.id}>{client.firstName} {client.lastName}</option>)}</select><div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-600"><CalendarDays className="size-4 text-slate-400" />Current week</div><input className={inputClass} placeholder="Add recent activity notes to inspire ideas..." /></section>{weeklyIdeas.length ? null : <EmptyState title="No weekly ideas yet" description="Add active clients and recent activity notes, then generate this week’s ideas." />}</div>;
}
