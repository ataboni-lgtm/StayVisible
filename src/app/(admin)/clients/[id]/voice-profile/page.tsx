import { readStore } from '@/lib/stay-visible/local-store';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function VoiceProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { clients, voiceProfiles } = await readStore();
  const client = clients.find((item) => item.id === id);
  if (!client) return <EmptyState title="Client not found" description="Add a client before generating a voice profile." />;
  const profile = voiceProfiles[client.id];
  if (!profile?.toneSummary) return <div className="@container/page"><PageHeader eyebrow="Voice profile" title={`${client.firstName}’s LinkedIn voice`} description="Complete onboarding to generate this client’s voice profile." /><EmptyState title="No voice profile yet" description="Submit onboarding answers to generate a structured LinkedIn voice profile." /></div>;
  const voiceDetails = [
    ['Sentence style', profile.sentenceStyle],
    ['Vocabulary style', profile.vocabularyStyle],
    ['Post length', profile.postLengthPreference],
    ['First person', profile.firstPersonPreference],
    ['Personal balance', profile.personalProfessionalBalance],
    ['Emoji rules', profile.emojiRules],
    ['Hashtag rules', profile.hashtagRules],
  ].filter(([, value]) => value);
  return <div className="@container/page"><PageHeader eyebrow="Voice profile" title={`${client.firstName}’s LinkedIn voice`} description="A living guide built from onboarding, final approved posts, and every client edit." /><div className="grid gap-6 @5xl/page:grid-cols-[1.25fr_0.75fr]"><section className="surface-card p-6"><p className="eyebrow">Voice at a glance</p><p className="mt-3 text-lg leading-8 text-[#0B1F3A]">{profile.toneSummary}</p>{profile.examplePost && <div className="mt-5 rounded-xl bg-slate-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Example in their voice</p><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{profile.examplePost}</p></div>}</section><section className="surface-card p-6"><p className="eyebrow">Learning loop</p><h2 className="mt-2 font-semibold text-[#0B1F3A]">What the app has learned</h2>{profile.learningNotes.length ? <ul className="mt-4 space-y-3">{profile.learningNotes.map((note) => <li key={note} className="rounded-xl bg-[#E0F2FE]/60 px-4 py-3 text-sm leading-6 text-slate-700">{note}</li>)}</ul> : <p className="mt-4 text-sm leading-6 text-slate-500">No approved-post learnings yet. When a client edits, approves, or requests changes, those patterns will appear here.</p>}</section></div><section className="mt-6 grid gap-4 @3xl/page:grid-cols-2 @6xl/page:grid-cols-3">{voiceDetails.map(([label, value]) => <article key={label} className="surface-card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-sm leading-6 text-[#0B1F3A]">{value}</p></article>)}</section><section className="mt-6 grid gap-4 @4xl/page:grid-cols-2"><RuleList title="Do" items={profile.dos} tone="do" /><RuleList title="Don't" items={profile.donts} tone="dont" /></section></div>;
}

function RuleList({ title, items, tone }: { title: string; items: string[]; tone: 'do' | 'dont' }) {
  if (!items.length) return null;
  return <section className="surface-card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p><ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className={`rounded-xl px-4 py-3 text-sm leading-6 ${tone === 'do' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{item}</li>)}</ul></section>;
}
