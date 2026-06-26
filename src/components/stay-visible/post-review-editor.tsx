'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Check, Copy, Send, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import type { Post } from '@/lib/stay-visible/types';
import { EmptyState, primaryButtonClass, secondaryButtonClass, textareaClass } from './ui';
import { WritingCheckButton } from './writing-check-button';

export function PostReviewEditor({ post }: { post: Post }) {
  const [caption, setCaption] = useState(post.caption);
  const [scheduledFor, setScheduledFor] = useState(post.scheduledFor ?? '');
  const [sending, setSending] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    setCaption(sessionStorage.getItem('stayvisible-selected') ?? post.caption);
  }, [post.caption]);

  async function saveSchedule() {
    setSavingSchedule(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, scheduledFor }),
      });
      if (!response.ok) throw new Error();
      toast.success('Post added to content calendar');
    } catch {
      toast.error('Could not save schedule date');
    } finally {
      setSavingSchedule(false);
    }
  }

  async function markPublished() {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, status: 'Posted', scheduledFor }),
      });
      if (!response.ok) throw new Error();
      toast.success('Post marked published');
    } catch {
      toast.error('Could not mark post published');
    }
  }

  async function sendApproval() {
    setSending(true);
    try {
      await fetch(`/api/posts/${post.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption, status: 'Draft' }) });
      const response = await fetch('/api/notifications/send-approval', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, approvalUrl: `${window.location.origin}/approve/generated` }) });
      if (!response.ok) throw new Error();
      const json = await response.json() as { approvalUrl?: string };
      toast.success('Approval link created', { description: json.approvalUrl });
    } catch {
      toast.success('Approval link ready', { description: 'Notification providers are in placeholder mode until configured.' });
    } finally {
      setSending(false);
    }
  }

  if (!caption) return <EmptyState title="No selected draft" description="Generate post options and select one before reviewing." />;

  return <div className="grid gap-6 @4xl/page:grid-cols-[1.45fr_0.75fr]"><section className="surface-card p-5 @md/page:p-7"><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Caption</p><h2 className="mt-1 font-semibold text-[#0B1F3A]">Final review</h2></div><span className="text-xs text-slate-400">{caption.length} characters</span></div><textarea value={caption} onChange={(event) => setCaption(event.target.value)} className={`${textareaClass} min-h-[420px] leading-7`} /><div className="mt-4 flex flex-wrap gap-2"><WritingCheckButton text={caption} onApply={setCaption} context="Admin LinkedIn caption final review" /><button onClick={async () => { await navigator.clipboard.writeText(caption); toast.success('Copied'); }} className={secondaryButtonClass}><Copy className="size-4" />Copy</button><button onClick={async () => { await fetch(`/api/posts/${post.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption, status: 'Draft', scheduledFor }) }); toast.success('Draft saved'); }} className={secondaryButtonClass}><Check className="size-4" />Save draft</button></div></section><aside className="space-y-6"><section className="surface-card p-6"><p className="eyebrow">Client preview</p><p className="mt-5 line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-600">{caption}</p></section><section className="surface-card p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#E0F2FE] text-blue-700"><CalendarCheck className="size-5" /></span><div><h2 className="font-semibold text-[#0B1F3A]">Content calendar</h2><p className="text-xs text-slate-400">Choose when this should go out.</p></div></div><label className="mt-5 block"><span className="mb-1.5 block text-sm font-medium text-[#0B1F3A]">Scheduled publish date</span><input type="date" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#0B1F3A] shadow-sm focus:border-blue-500 focus:ring-3 focus:ring-blue-100" /></label><div className="mt-4 grid gap-2"><button onClick={saveSchedule} disabled={!scheduledFor || savingSchedule} className={primaryButtonClass}><CalendarCheck className="size-4" />{savingSchedule ? 'Saving...' : 'Save to calendar'}</button><button onClick={markPublished} className={secondaryButtonClass}><UploadCloud className="size-4" />Mark published</button></div></section><section className="rounded-2xl bg-[#0B1F3A] p-6 text-white"><h2 className="font-semibold">Ready for approval?</h2><p className="mt-2 text-sm leading-6 text-slate-300">Send a secure link so the client can approve, edit, or request changes without logging in.</p><button onClick={sendApproval} disabled={sending} className={`${primaryButtonClass} mt-5 w-full bg-white text-[#0B1F3A] hover:bg-slate-100`}><Send className="size-4" />{sending ? 'Sending...' : 'Create approval link'}</button></section></aside></div>;
}
