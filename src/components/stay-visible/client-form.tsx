'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Client } from '@/lib/stay-visible/types';
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, textareaClass } from './ui';

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success(client ? 'Client updated' : 'Client added', { description: 'Saved in demo mode. Connect Supabase to persist changes.' });
    setSaving(false); router.push(client ? `/clients/${client.id}` : '/clients');
  }
  return <form onSubmit={submit} className="space-y-6"><section className="surface-card p-5 @md/page:p-7"><div className="mb-6"><h2 className="font-semibold text-[#0B1F3A]">Contact details</h2><p className="mt-1 text-sm text-slate-400">The basics used in approvals and notifications.</p></div><div className="grid gap-5 @lg/page:grid-cols-2"><Field label="First name"><input required name="firstName" defaultValue={client?.firstName} className={inputClass} /></Field><Field label="Last name"><input required name="lastName" defaultValue={client?.lastName} className={inputClass} /></Field><Field label="Email"><input required type="email" name="email" defaultValue={client?.email} className={inputClass} /></Field><Field label="Phone number"><input name="phone" defaultValue={client?.phone} className={inputClass} placeholder="+1 555 000 0000" /></Field></div></section>
    <section className="surface-card p-5 @md/page:p-7"><div className="mb-6"><h2 className="font-semibold text-[#0B1F3A]">Professional profile</h2><p className="mt-1 text-sm text-slate-400">Context that makes generated ideas relevant.</p></div><div className="grid gap-5 @lg/page:grid-cols-2"><Field label="Company"><input name="company" defaultValue={client?.company} className={inputClass} /></Field><Field label="Job title"><input name="jobTitle" defaultValue={client?.jobTitle} className={inputClass} /></Field><Field label="Industry"><input name="industry" defaultValue={client?.industry} className={inputClass} /></Field><Field label="Location"><input name="location" defaultValue={client?.location} className={inputClass} /></Field><Field label="LinkedIn profile URL"><input type="url" name="linkedInUrl" defaultValue={client?.linkedInUrl} className={inputClass} placeholder="https://linkedin.com/in/..." /></Field><Field label="Status"><select name="status" defaultValue={client?.status ?? 'Onboarding Needed'} className={inputClass}><option>Onboarding Needed</option><option>Active</option><option>Paused</option></select></Field></div></section>
    <section className="surface-card p-5 @md/page:p-7"><div className="mb-6"><h2 className="font-semibold text-[#0B1F3A]">Content direction</h2><p className="mt-1 text-sm text-slate-400">A starting point for their voice onboarding.</p></div><div className="space-y-5"><Field label="Target audience"><textarea name="targetAudience" defaultValue={client?.targetAudience} className={textareaClass} /></Field><div className="grid gap-5 @lg/page:grid-cols-2"><Field label="Topics to be known for" hint="Separate topics with commas."><textarea name="topics" defaultValue={client?.topics.join(', ')} className={textareaClass} /></Field><Field label="Topics to avoid" hint="Separate topics with commas."><textarea name="topicsToAvoid" defaultValue={client?.topicsToAvoid.join(', ')} className={textareaClass} /></Field></div><Field label="Preferred notifications"><select name="notificationMethod" defaultValue={client?.notificationMethod ?? 'Email'} className={inputClass}><option>Email</option><option>Text</option><option>Both</option></select></Field></div></section>
    <div className="flex justify-end gap-3"><button type="button" onClick={() => router.back()} className={secondaryButtonClass}>Cancel</button><button disabled={saving} className={primaryButtonClass}>{saving ? 'Saving…' : client ? 'Save changes' : 'Add client'}</button></div></form>;
}
