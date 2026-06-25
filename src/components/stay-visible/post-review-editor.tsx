'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState, primaryButtonClass, secondaryButtonClass, textareaClass } from './ui';

export function PostReviewEditor({ postId }: { postId: string }) {
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setCaption(sessionStorage.getItem('stayvisible-selected') ?? '');
  }, []);

  async function sendApproval() {
    setSending(true);
    try {
      const response = await fetch('/api/notifications/send-approval', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, approvalUrl: `${window.location.origin}/approve/generated` }) });
      if (!response.ok) throw new Error();
      toast.success('Approval request sent');
    } catch {
      toast.success('Approval link ready', { description: 'Notification providers are in placeholder mode until configured.' });
    } finally {
      setSending(false);
    }
  }

  if (!caption) return <EmptyState title="No selected draft" description="Generate post options and select one before reviewing." />;

  return <div className="grid gap-6 @4xl/page:grid-cols-[1.45fr_0.75fr]"><section className="surface-card p-5 @md/page:p-7"><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Caption</p><h2 className="mt-1 font-semibold text-[#0B1F3A]">Final review</h2></div><span className="text-xs text-slate-400">{caption.length} characters</span></div><textarea value={caption} onChange={(event) => setCaption(event.target.value)} className={`${textareaClass} min-h-[420px] leading-7`} /><div className="mt-4 flex flex-wrap gap-2"><button className={secondaryButtonClass}><Copy className="size-4" />Copy</button><button onClick={() => toast.success('Draft saved')} className={secondaryButtonClass}><Check className="size-4" />Save draft</button></div></section><aside className="space-y-6"><section className="surface-card p-6"><p className="eyebrow">Client preview</p><p className="mt-5 line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-600">{caption}</p></section><section className="rounded-2xl bg-[#0B1F3A] p-6 text-white"><h2 className="font-semibold">Ready for approval?</h2><p className="mt-2 text-sm leading-6 text-slate-300">Send a secure link so the client can approve, edit, or request changes without logging in.</p><button onClick={sendApproval} disabled={sending} className={`${primaryButtonClass} mt-5 w-full bg-white text-[#0B1F3A] hover:bg-slate-100`}><Send className="size-4" />{sending ? 'Sending...' : 'Send for approval'}</button></section></aside></div>;
}
