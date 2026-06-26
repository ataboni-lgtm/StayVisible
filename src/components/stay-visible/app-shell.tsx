'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, CalendarDays, ChevronDown, FilePenLine, Lightbulb, Menu, Plus, Settings, Users, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/event-sheet', label: 'Event Sheet', icon: CalendarDays },
  { href: '/content-calendar', label: 'Content Calendar', icon: CalendarDays },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/posts/new', label: 'Posts', icon: FilePenLine },
  { href: '/weekly-ideas', label: 'Weekly Ideas', icon: Lightbulb },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <aside className={cn('fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white p-5 transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)} className="lg:hidden"><X className="size-5" /></button></div>
        <nav className="mt-9 space-y-1.5">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href === '/clients' && pathname.startsWith('/clients')) || (item.href === '/posts/new' && pathname.startsWith('/posts'));
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors', active ? 'bg-[#E0F2FE] text-[#1D4ED8]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B1F3A]')}><item.icon className="size-4.5" />{item.label}</Link>;
          })}
        </nav>
        <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-[#0B1F3A] p-4 text-white">
          <p className="text-sm font-medium">One real moment is enough.</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">Turn a note or photo into this week’s post.</p>
          <Link href="/posts/new" className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"><Plus className="size-3.5" />Create a post</Link>
        </div>
      </aside>
      {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-navy/20 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md @md/page:px-8">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Menu className="size-5" /></button>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/posts/new" className="hidden items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:flex"><Plus className="size-4" />New post</Link>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-sm text-slate-700"><span className="grid size-7 place-items-center rounded-lg bg-[#F4D7A1] text-xs font-bold text-[#0B1F3A]">AT</span><span className="hidden sm:inline">Andrea</span><ChevronDown className="size-3.5 text-slate-400" /></button>
          </div>
        </header>
        <main className="@container/page mx-auto max-w-[1440px] p-4 @md/page:p-8">{children}</main>
      </div>
    </div>
  );
}
