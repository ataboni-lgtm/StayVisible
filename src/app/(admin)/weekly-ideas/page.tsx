import { ArrowRight, CalendarDays } from 'lucide-react';
import { readStore } from '@/lib/stay-visible/local-store';
import { WeeklyIdeaDraftButton } from '@/components/stay-visible/weekly-idea-draft-button';
import { WeeklyIdeasGenerator } from '@/components/stay-visible/weekly-ideas-generator';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function WeeklyIdeasPage() {
  const { clients, weeklyIdeas } = await readStore();
  return <div className="@container/page"><PageHeader eyebrow="Weekly LinkedIn assistant" title="A useful reason to post" description="Fresh ideas shaped by each client’s role, audience, voice, and recent activity." />
    <div className="mb-4 flex h-11 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-600"><CalendarDays className="size-4 text-slate-400" />Current week</div>
    <WeeklyIdeasGenerator clients={clients} />
    {weeklyIdeas.length ? <div className="grid gap-4 @4xl/page:grid-cols-2 @7xl/page:grid-cols-3">
      {weeklyIdeas.map((idea) => <article key={idea.id} className="surface-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{idea.clientName}</p>
            <h2 className="mt-2 text-lg font-semibold leading-6 text-[#0B1F3A]">{idea.topic}</h2>
          </div>
          <ArrowRight className="mt-1 size-4 shrink-0 text-slate-300" />
        </div>
        <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
          <div><p className="font-semibold text-[#0B1F3A]">Why it works</p><p className="mt-1">{idea.reason}</p></div>
          <div><p className="font-semibold text-[#0B1F3A]">Suggested angle</p><p className="mt-1">{idea.angle}</p></div>
        </div>
        <WeeklyIdeaDraftButton idea={idea} />
      </article>)}
    </div> : <EmptyState title="No weekly ideas yet" description="Add active clients and recent activity notes, then generate this week’s ideas." />}</div>;
}
