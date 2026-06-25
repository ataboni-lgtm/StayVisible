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
  return <div className="@container/page"><PageHeader eyebrow="Voice profile" title={`${client.firstName}’s LinkedIn voice`} description="A living guide built from onboarding and refined by every edit." /><section className="surface-card p-6"><p className="eyebrow">Voice at a glance</p><p className="mt-3 text-lg leading-8 text-[#0B1F3A]">{profile.toneSummary}</p><p className="mt-5 whitespace-pre-line rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{profile.examplePost}</p></section></div>;
}
