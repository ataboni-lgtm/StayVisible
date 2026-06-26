import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClientStatus, PostStatus } from '@/lib/stay-visible/types';

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 @lg/page:flex-row @lg/page:items-end @lg/page:justify-between"><div>{eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}<h1 className="page-title">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>{action}</div>;
}

export function StatusBadge({ status }: { status: ClientStatus | PostStatus }) {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15', Paused: 'bg-slate-100 text-slate-600 ring-slate-500/10',
    'Onboarding Needed': 'bg-amber-50 text-amber-700 ring-amber-600/15', 'Sent for Approval': 'bg-purple-50 text-purple-700 ring-purple-600/15',
    'Changes Requested': 'bg-orange-50 text-orange-700 ring-orange-600/15', Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    Posted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15', Rejected: 'bg-red-50 text-red-700 ring-red-600/15',
    Idea: 'bg-blue-50 text-blue-700 ring-blue-600/15', Draft: 'bg-blue-50 text-blue-700 ring-blue-600/15', Generated: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  };
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset', styles[status])}>{status}</span>;
}

export function ScheduledBadge() {
  return <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/15">Scheduled</span>;
}

export function MetricCard({ label, value, helper, icon: Icon, tone = 'blue', href }: { label: string; value: number; helper: string; icon: LucideIcon; tone?: 'blue' | 'sand' | 'sky' | 'green'; href: string }) {
  const iconStyles = { blue: 'bg-blue-50 text-blue-600', sand: 'bg-[#FFF6E5] text-amber-700', sky: 'bg-sky-50 text-sky-600', green: 'bg-emerald-50 text-emerald-600' };
  return <Link href={href} className="surface-card group p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(15,23,42,0.09)]"><div className="flex items-start justify-between"><span className={cn('grid size-10 place-items-center rounded-xl', iconStyles[tone])}><Icon className="size-5" /></span><ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" /></div><p className="mt-5 text-3xl font-semibold tracking-tight text-[#0B1F3A]">{value}</p><p className="mt-1 text-sm font-medium text-slate-700">{label}</p><p className="mt-1 text-xs text-slate-400">{helper}</p></Link>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="surface-card flex min-h-60 flex-col items-center justify-center p-8 text-center"><h2 className="text-lg font-semibold text-[#0B1F3A]">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-[#0B1F3A]">{label}</span>{children}{hint && <span className="mt-1.5 block text-xs leading-5 text-slate-400">{hint}</span>}</label>;
}

export const inputClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#0B1F3A] shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100';
export const textareaClass = 'min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-[#0B1F3A] shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100';
export const primaryButtonClass = 'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50';
export const secondaryButtonClass = 'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50';
