import Link from 'next/link';
import { Bell, Bot, Database, KeyRound, Linkedin, Mail, MessageSquareText, ShieldCheck, UsersRound } from 'lucide-react';
import { PageHeader, secondaryButtonClass } from '@/components/stay-visible/ui';

const config = [
  {
    icon: Database,
    name: 'Local Postgres',
    description: 'Stores clients, posts, approvals, photos, analytics, and recommendations.',
    status: process.env.DB_CONNECTION_STRING ? 'Configured' : 'Missing',
    details: 'DB_CONNECTION_STRING',
  },
  {
    icon: Mail,
    name: 'Gmail',
    description: 'Free-first sender for approval links and event photo reminders.',
    status: process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? 'Ready to send' : process.env.GMAIL_USER ? 'Needs app password' : 'Missing',
    details: 'GMAIL_USER, GMAIL_APP_PASSWORD',
  },
  {
    icon: Bot,
    name: 'OpenAI',
    description: 'Optional. When blank, Stay Visible uses built-in fallback drafting.',
    status: process.env.OPENAI_API_KEY ? 'Configured' : '$0 fallback mode',
    details: 'OPENAI_API_KEY',
  },
  {
    icon: MessageSquareText,
    name: 'Twilio SMS',
    description: 'Optional. Leave blank while testing to avoid SMS costs.',
    status: process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Placeholder mode',
    details: 'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER',
  },
  {
    icon: Linkedin,
    name: 'LinkedIn OAuth',
    description: 'Future official posting and analytics connection. No scraping or password storage.',
    status: process.env.LINKEDIN_CLIENT_ID ? 'Configured' : 'Coming later',
    details: 'LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET',
  },
];

export default function SettingsPage() {
  return <div className="@container/page">
    <PageHeader eyebrow="Workspace" title="Settings" description="Check the local setup, free-first integrations, and safety rules for Stay Visible." />

    <div className="grid gap-6 @5xl/page:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <section className="surface-card p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Bell className="size-5" /></span>
            <div>
              <h2 className="font-semibold text-[#0B1F3A]">$0 testing mode</h2>
              <p className="text-xs text-slate-400">Built to test without paid providers.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
            <p>Use local Postgres for storage, Gmail for email, and fallback drafting when OpenAI is blank.</p>
            <p>SMS, SendGrid, OpenAI, and LinkedIn OAuth can stay off until they are worth paying for or approving.</p>
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="flex items-center gap-3">
            <UsersRound className="size-5 text-blue-600" />
            <div>
              <h2 className="font-semibold text-[#0B1F3A]">Client portal</h2>
              <p className="text-xs text-slate-400">Clients can submit future events and upload photos.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <Link href="/client-login" className={secondaryButtonClass}>Open client portal</Link>
            <Link href="/event-sheet" className={secondaryButtonClass}>Open event sheet</Link>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="surface-card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-[#0B1F3A]">Configuration</h2>
            <p className="mt-1 text-sm text-slate-400">No secrets are shown here, only whether each integration is ready.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {config.map((item) => <div key={item.name} className="flex items-start gap-4 px-6 py-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500"><item.icon className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[#0B1F3A]">{item.name}</p>
                  <span className="rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[11px] font-semibold text-blue-700">{item.status}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                <p className="mt-2 font-mono text-[11px] text-slate-400">{item.details}</p>
              </div>
            </div>)}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-[#E0F2FE]/60 p-6">
          <div className="flex gap-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-600" />
            <div>
              <h2 className="font-semibold text-[#0B1F3A]">Publishing stays in your control</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Stay Visible does not store LinkedIn passwords, scrape LinkedIn, or publish without explicit client approval. Analytics can be entered manually now and connected through official LinkedIn permissions later.</p>
            </div>
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-blue-600" />
            <div>
              <h2 className="font-semibold text-[#0B1F3A]">Useful admin pages</h2>
              <p className="text-xs text-slate-400">Quick access while testing.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 @md/page:grid-cols-2">
            <Link href="/posts" className={secondaryButtonClass}>Posts</Link>
            <Link href="/content-calendar" className={secondaryButtonClass}>Content calendar</Link>
            <Link href="/analytics" className={secondaryButtonClass}>Analytics</Link>
            <Link href="/weekly-ideas" className={secondaryButtonClass}>Weekly ideas</Link>
          </div>
        </section>
      </div>
    </div>
  </div>;
}
