import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ClientPortalLoginForm } from '@/components/stay-visible/client-portal-login-form';

export default function ClientLoginPage() {
  return <main className="min-h-screen bg-[#F8FAFC] px-4 py-10">
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
      <Link href="/client-login" className="mb-8 flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-xl bg-[#2563EB] text-white shadow-sm"><Sparkles className="size-5" /></span>
        <span className="text-xl font-semibold tracking-tight text-[#0B1F3A]">StayVisible</span>
      </Link>
      <section className="surface-card p-6">
        <p className="eyebrow">Client portal</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0B1F3A]">Share what is coming up</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Use the email and password from your Stay Visible profile to submit upcoming events, meetings, and photo reminders.</p>
        <div className="mt-6"><ClientPortalLoginForm /></div>
      </section>
      <p className="mt-5 text-center text-xs leading-5 text-slate-400">For this MVP, password sign-in is stored locally. Production client access should use magic links or Supabase auth.</p>
    </div>
  </main>;
}
