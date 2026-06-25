'use client';

import { useState } from 'react';
import { Check, ClipboardCheck, Hash, MessageSquare, RotateCcw, Send, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Post } from '@/lib/stay-visible/types';
import { EmptyState, primaryButtonClass, secondaryButtonClass, textareaClass } from './ui';
import { WritingCheckButton } from './writing-check-button';

export function ApprovalEditor({ token, post }: { token: string; post?: Post }) {
  const [caption, setCaption] = useState(post?.caption ?? '');
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function act(action: string) {
    if (!caption.trim()) return;
    try {
      await fetch(`/api/approvals/${token}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, caption, feedback }) });
    } catch {}
    if (action === 'approve_copy') await navigator.clipboard?.writeText(caption);
    if (action.startsWith('approve')) setDone(true);
    toast.success(action.startsWith('approve') ? 'Post approved' : 'Feedback saved');
  }

  function transform(type: string) {
    if (type === 'shorter') setCaption((value) => value.split('\n\n').slice(0, 2).join('\n\n'));
    if (type === 'hashtags') setCaption((value) => value.replace(/#\w+/g, '').trim());
    if (type === 'casual') setFeedback('Please make this feel more conversational and less polished.');
    if (type === 'professional') setFeedback('Please make this slightly more professional while keeping my natural voice.');
    toast.success('Draft updated');
  }

  if (done) return <div className="mx-auto max-w-xl py-20 text-center"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><ClipboardCheck className="size-7" /></span><h1 className="mt-6 text-2xl font-semibold text-[#0B1F3A]">You’re all set</h1><p className="mt-3 text-sm leading-6 text-slate-500">Your approved version has been saved.</p></div>;
  if (!caption) return <EmptyState title="No draft loaded" description="This approval link is waiting for a real draft from the database." />;

  return <div className="grid gap-6 @4xl/page:grid-cols-[1.3fr_0.7fr]"><section className="surface-card p-5 @md/page:p-8"><textarea aria-label="Post caption" value={caption} onChange={(event) => setCaption(event.target.value)} className={`${textareaClass} min-h-[360px] border-0 bg-slate-50 shadow-none leading-7 focus:ring-0`} /><WritingCheckButton text={caption} onApply={setCaption} context="Client approval LinkedIn caption" className="mt-4" /></section><aside className="space-y-6"><section className="surface-card p-6"><p className="eyebrow">Quick refinements</p><div className="mt-4 grid gap-2"><button onClick={() => transform('shorter')} className={`${secondaryButtonClass} justify-start`}><RotateCcw className="size-4" />Make shorter</button><button onClick={() => transform('casual')} className={`${secondaryButtonClass} justify-start`}><MessageSquare className="size-4" />Make more casual</button><button onClick={() => transform('professional')} className={`${secondaryButtonClass} justify-start`}><Send className="size-4" />Make more professional</button><button onClick={() => transform('hashtags')} className={`${secondaryButtonClass} justify-start`}><Hash className="size-4" />Remove hashtags</button></div></section><section className="surface-card p-6"><p className="text-sm font-semibold text-[#0B1F3A]">Want something different?</p><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} className={`${textareaClass} mt-3 min-h-24`} placeholder="Tell us what to change..." /><button onClick={() => act('changes_requested')} className={`${secondaryButtonClass} mt-3 w-full`}>Request changes</button></section><section className="rounded-2xl bg-[#0B1F3A] p-6"><button onClick={() => act('approve')} className={`${primaryButtonClass} w-full bg-white text-[#0B1F3A] hover:bg-slate-100`}><Check className="size-4" />Approve</button><button onClick={() => act('approve_copy')} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white"><ClipboardCheck className="size-4" />Approve & copy</button><button onClick={() => act('reject')} className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"><ThumbsDown className="size-3.5" />Reject this post</button></section></aside></div>;
}
