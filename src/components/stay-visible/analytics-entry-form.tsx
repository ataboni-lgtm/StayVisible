'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import type { Client, Post } from '@/lib/stay-visible/types';
import { Field, inputClass, primaryButtonClass, textareaClass } from './ui';

export function AnalyticsEntryForm({ clients, posts }: { clients: Client[]; posts: Post[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [saving, setSaving] = useState(false);
  const clientPosts = posts.filter((post) => post.clientId === clientId);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      if (!response.ok) throw new Error();
      toast.success('Analytics saved');
      event.currentTarget.reset();
      router.refresh();
    } catch {
      toast.error('Could not save analytics');
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="surface-card p-5 @md/page:p-6">
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-[#E0F2FE] text-blue-700"><BarChart3 className="size-5" /></span>
      <div>
        <h2 className="font-semibold text-[#0B1F3A]">Add post analytics</h2>
        <p className="text-xs text-slate-400">Manual entry now, official LinkedIn import later.</p>
      </div>
    </div>

    <div className="mt-6 grid gap-4 @lg/page:grid-cols-2">
      <Field label="Client"><select required name="clientId" value={clientId} onChange={(event) => setClientId(event.target.value)} className={inputClass}>{clients.map((client) => <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>)}</select></Field>
      <Field label="Post"><select name="postId" className={inputClass}><option value="">No specific post</option>{clientPosts.map((post) => <option key={post.id} value={post.id}>{post.topic}</option>)}</select></Field>
      <Field label="Captured date"><input required type="date" name="capturedAt" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} /></Field>
      <Field label="Posting hour"><input type="number" min="0" max="23" name="postingHour" placeholder="9" className={inputClass} /></Field>
      <Field label="Impressions"><input type="number" min="0" name="impressions" defaultValue="0" className={inputClass} /></Field>
      <Field label="Reactions"><input type="number" min="0" name="reactions" defaultValue="0" className={inputClass} /></Field>
      <Field label="Comments"><input type="number" min="0" name="comments" defaultValue="0" className={inputClass} /></Field>
      <Field label="Reposts"><input type="number" min="0" name="reposts" defaultValue="0" className={inputClass} /></Field>
      <Field label="Profile views"><input type="number" min="0" name="profileViews" defaultValue="0" className={inputClass} /></Field>
      <Field label="Link clicks"><input type="number" min="0" name="linkClicks" defaultValue="0" className={inputClass} /></Field>
    </div>
    <div className="mt-4"><Field label="Notes"><textarea name="notes" className={textareaClass} placeholder="What seemed to work, comments from the audience, or anything to test next..." /></Field></div>
    <button disabled={saving || !clients.length} className={`${primaryButtonClass} mt-5 w-full`}>{saving ? 'Saving...' : 'Save analytics'}</button>
  </form>;
}
