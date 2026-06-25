'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CalendarPlus, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Field, inputClass, primaryButtonClass, textareaClass } from './ui';

const postTypes = ['Event Recap', 'Conference Post', 'Client Meeting', 'Market Insight', 'Company Repost', 'Article Share', 'Deal Announcement', 'General Update'];

export function ClientPortalEventForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/client-portal/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      toast.success('Event sent to your Stay Visible workspace');
      form.reset();
      router.refresh();
    } catch {
      toast.error('Could not save that event');
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="surface-card grid gap-5 p-5 @3xl/page:grid-cols-2">
    <Field label="What is coming up?"><input required name="topic" className={inputClass} placeholder="Conference, lunch, meeting, article..." /></Field>
    <Field label="Post type"><select name="postType" className={inputClass}>{postTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
    <Field label="Date"><input name="date" type="date" className={inputClass} /></Field>
    <Field label="Location"><input name="location" className={inputClass} placeholder="City, venue, or virtual" /></Field>
    <Field label="People or companies to mention"><input name="mentions" className={inputClass} placeholder="Optional" /></Field>
    <Field label="Photo reminder"><input name="photoContext" className={inputClass} placeholder="Photos to add later, or what to capture" /></Field>
    <div className="@3xl/page:col-span-2"><Field label="Notes for the post"><textarea name="notes" className={textareaClass} placeholder="Messy notes are fine. Add why this matters, who was there, or what you want remembered." /></Field></div>
    <div className="@3xl/page:col-span-2"><Field label="Main takeaway"><textarea name="mainTakeaway" className={textareaClass} placeholder="Optional. Add the point you want the post to make, or leave it blank until later." /></Field></div>
    <div className="@3xl/page:col-span-2">
      <button disabled={saving} className={primaryButtonClass}>
        {saving ? <LoaderCircle className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
        {saving ? 'Saving...' : 'Send event'}
      </button>
    </div>
  </form>;
}
