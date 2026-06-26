'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FileText, LoaderCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { Client, PostOpportunity } from '@/lib/stay-visible/types';
import { clientDisplayName } from '@/lib/stay-visible/client-display';
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, textareaClass } from './ui';

const postTypes = ['Event Recap', 'Conference Post', 'Client Meeting', 'Market Insight', 'Company Repost', 'Article Share', 'Deal Announcement', 'General Update'];

export function EventSheet({ clients, opportunities }: { clients: Client[]; opportunities: PostOpportunity[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [photoNotes, setPhotoNotes] = useState<Record<string, string>>(Object.fromEntries(opportunities.map((item) => [item.id, item.photoContext ?? ''])));

  async function createEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/post-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      toast.success('Event added to sheet');
      form.reset();
      router.refresh();
    } catch {
      toast.error('Could not save event');
    } finally {
      setSaving(false);
    }
  }

  async function savePhotoNotes(opportunity: PostOpportunity) {
    try {
      const response = await fetch(`/api/post-opportunities/${opportunity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: opportunity.notes ?? '', photoContext: photoNotes[opportunity.id] ?? '' }),
      });
      if (!response.ok) throw new Error();
      toast.success('Photo notes saved');
      router.refresh();
    } catch {
      toast.error('Could not save photo notes');
    }
  }

  async function draftText(opportunity: PostOpportunity) {
    setDraftingId(opportunity.id);
    try {
      const response = await fetch('/api/generate-linkedin-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: opportunity.clientId,
          postType: opportunity.postType,
          topic: opportunity.topic,
          date: opportunity.date,
          location: opportunity.location,
          mentions: opportunity.mentions,
          mainTakeaway: opportunity.mainTakeaway || `Planned post for ${opportunity.topic}. Use the event details and notes to draft a natural LinkedIn post.`,
          notes: opportunity.notes,
          tone: opportunity.tone,
          callToAction: opportunity.callToAction,
          photoContext: photoNotes[opportunity.id] ?? opportunity.photoContext,
        }),
      });
      if (!response.ok) throw new Error();
      const json = await response.json() as { options: unknown[] };
      sessionStorage.setItem('stayvisible-generated', JSON.stringify(json.options));
      toast.success('Draft options ready');
      router.push('/posts/generated/review');
    } catch {
      toast.error('Could not draft text yet');
    } finally {
      setDraftingId(null);
    }
  }

  return <div className="space-y-6">
    <form onSubmit={createEvent} className="surface-card grid gap-4 p-5 @4xl/page:grid-cols-4">
      <Field label="Client"><select required name="clientId" className={inputClass}><option value="">Choose client</option>{clients.filter((client) => client.status !== 'Paused').map((client) => <option key={client.id} value={client.id}>{clientDisplayName(client)}</option>)}</select></Field>
      <Field label="Post type"><select name="postType" className={inputClass}>{postTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
      <Field label="Event name"><input required name="topic" className={inputClass} placeholder="Conference, lunch, meeting..." /></Field>
      <Field label="Date"><input name="date" type="date" className={inputClass} /></Field>
      <Field label="Location"><input name="location" className={inputClass} placeholder="City, venue, or virtual" /></Field>
      <Field label="People/companies"><input name="mentions" className={inputClass} placeholder="Optional" /></Field>
      <Field label="Photo notes"><input name="photoContext" className={inputClass} placeholder="Add photos later, or note what to capture" /></Field>
      <Field label="Main note"><input name="mainTakeaway" className={inputClass} placeholder="Optional angle or reminder" /></Field>
      <div className="@4xl/page:col-span-4"><button disabled={saving} className={primaryButtonClass}>{saving ? 'Saving...' : 'Add event to sheet'}</button></div>
    </form>

    <section className="surface-card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-[#0B1F3A]">Planned events</h2><p className="mt-1 text-sm text-slate-500">Schedule the moment now. Add photo context and draft text when it gets closer.</p></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Event</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Photo notes</th><th className="px-5 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {opportunities.map((opportunity) => {
              const client = clients.find((item) => item.id === opportunity.clientId);
              return <tr key={opportunity.id} className="align-top">
                <td className="px-5 py-4 text-slate-600">{opportunity.date || 'No date'}</td>
                <td className="px-5 py-4 font-medium text-[#0B1F3A]">{client ? clientDisplayName(client) : 'Client'}</td>
                <td className="px-5 py-4"><p className="font-medium text-[#0B1F3A]">{opportunity.topic}</p><p className="mt-1 text-xs text-slate-400">{opportunity.postType}</p></td>
                <td className="px-5 py-4 text-slate-600">{opportunity.location || 'TBD'}</td>
                <td className="px-5 py-4"><textarea value={photoNotes[opportunity.id] ?? ''} onChange={(event) => setPhotoNotes((notes) => ({ ...notes, [opportunity.id]: event.target.value }))} className={`${textareaClass} min-h-20`} placeholder="Add photo filenames, captions, or what to remember later..." /></td>
                <td className="space-y-2 px-5 py-4"><button type="button" onClick={() => savePhotoNotes(opportunity)} className={`${secondaryButtonClass} w-full`}><Save className="size-4" />Save notes</button><button type="button" onClick={() => draftText(opportunity)} className={`${primaryButtonClass} w-full`}><FileText className="size-4" />{draftingId === opportunity.id ? <><LoaderCircle className="size-4 animate-spin" />Drafting...</> : 'Draft text'}</button></td>
              </tr>;
            })}
            {!opportunities.length && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No planned events yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </div>;
}
