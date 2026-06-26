'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Client } from '@/lib/stay-visible/types';
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, textareaClass } from './ui';

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [clientType, setClientType] = useState<Client['clientType']>(client?.clientType ?? 'Individual');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, id: client?.id }) });
      if (!response.ok) throw new Error();
      const json = await response.json() as { client: Client };
      toast.success(client ? 'Client updated' : 'Client added', { description: 'Saved locally.' });
      router.push(`/clients/${json.client.id}`);
      router.refresh();
    } catch {
      toast.error('Could not save client');
    } finally {
      setSaving(false);
    }
  }
  return <form onSubmit={submit} className="space-y-6"><section className="surface-card p-5 @md/page:p-7"><div className="mb-6"><h2 className="font-semibold text-[#0B1F3A]">Client type and contact</h2><p className="mt-1 text-sm text-slate-400">Company clients use the company name as the account name and keep a primary contact for approvals.</p></div><div className="grid gap-5 @lg/page:grid-cols-2"><Field label="Client type"><select name="clientType" value={clientType} onChange={(event) => setClientType(event.target.value as Client['clientType'])} className={inputClass}><option>Individual</option><option>Company</option></select></Field><Field label={clientType === 'Company' ? 'Primary contact first name' : 'First name'}><input required name="firstName" defaultValue={client?.firstName} className={inputClass} /></Field><Field label={clientType === 'Company' ? 'Primary contact last name' : 'Last name'}><input required name="lastName" defaultValue={client?.lastName} className={inputClass} /></Field><Field label={clientType === 'Company' ? 'Primary contact email' : 'Email'}><input required type="email" name="email" defaultValue={client?.email} className={inputClass} /></Field><Field label="Phone number"><input name="phone" defaultValue={client?.phone} className={inputClass} placeholder="+1 555 000 0000" /></Field></div></section>
    <section className="surface-card p-5 @md/page:p-7"><div className="mb-6"><h2 className="font-semibold text-[#0B1F3A]">{clientType === 'Company' ? 'Company profile' : 'Professional profile'}</h2><p className="mt-1 text-sm text-slate-400">Context that makes generated ideas relevant.</p></div><div className="grid gap-5 @lg/page:grid-cols-2"><Field label={clientType === 'Company' ? 'Company name' : 'Company'}><input required={clientType === 'Company'} name="company" defaultValue={client?.company} className={inputClass} /></Field><Field label={clientType === 'Company' ? 'Company positioning' : 'Job title'}><input name="jobTitle" defaultValue={client?.jobTitle} className={inputClass} placeholder={clientType === 'Company' ? 'Commercial real estate advisory, lender, nonprofit...' : undefined} /></Field><Field label="Industry"><input name="industry" defaultValue={client?.industry} className={inputClass} /></Field><Field label="Location"><input name="location" defaultValue={client?.location} className={inputClass} /></Field><Field label={clientType === 'Company' ? 'LinkedIn company page URL' : 'LinkedIn profile URL'}><input type="url" name="linkedInUrl" defaultValue={client?.linkedInUrl} className={inputClass} placeholder={clientType === 'Company' ? 'https://linkedin.com/company/...' : 'https://linkedin.com/in/...'} /></Field><Field label="Status"><select name="status" defaultValue={client?.status ?? 'Onboarding Needed'} className={inputClass}><option>Onboarding Needed</option><option>Active</option><option>Paused</option></select></Field></div></section>
    <section className="surface-card p-5 @md/page:p-7"><div className="mb-6"><h2 className="font-semibold text-[#0B1F3A]">Content direction</h2><p className="mt-1 text-sm text-slate-400">A starting point for their voice onboarding.</p></div><div className="space-y-5"><Field label="Target audience"><textarea name="targetAudience" defaultValue={client?.targetAudience} className={textareaClass} /></Field><div className="grid gap-5 @lg/page:grid-cols-2"><Field label="Topics to be known for" hint="Separate topics with commas."><textarea name="topics" defaultValue={client?.topics.join(', ')} className={textareaClass} /></Field><Field label="Topics to avoid" hint="Separate topics with commas."><textarea name="topicsToAvoid" defaultValue={client?.topicsToAvoid.join(', ')} className={textareaClass} /></Field></div><Field label="Preferred notifications"><select name="notificationMethod" defaultValue={client?.notificationMethod ?? 'Email'} className={inputClass}><option>Email</option><option>Text</option><option>Both</option></select></Field></div></section>
    <section className="surface-card p-5 @md/page:p-7"><div className="mb-6"><h2 className="font-semibold text-[#0B1F3A]">Client portal access</h2><p className="mt-1 text-sm text-slate-400">Give this client their own sign-in to submit events and view only their profile.</p></div><div className="space-y-5"><label className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"><span><span className="block text-sm font-medium text-[#0B1F3A]">Enable client portal</span><span className="mt-1 block text-xs text-slate-400">Client can sign in at /client-login.</span></span><input type="checkbox" name="portalAccessEnabled" defaultChecked={client?.portalAccessEnabled} className="size-4" /></label><Field label={client?.portalPasswordSet ? 'New portal password' : 'Portal password'} hint={client?.portalPasswordSet ? 'Leave blank to keep the current password.' : 'Set a password before sharing access.'}><input type="password" name="portalPassword" className={inputClass} autoComplete="new-password" /></Field></div></section>
    <div className="flex justify-end gap-3"><button type="button" onClick={() => router.back()} className={secondaryButtonClass}>Cancel</button><button disabled={saving} className={primaryButtonClass}>{saving ? 'Saving…' : client ? 'Save changes' : 'Add client'}</button></div></form>;
}
