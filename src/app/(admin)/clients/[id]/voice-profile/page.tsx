import { getClient } from '@/lib/stay-visible/demo-data';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';

export default async function VoiceProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) return <EmptyState title="Client not found" description="Add a client before generating a voice profile." />;
  return <div className="@container/page"><PageHeader eyebrow="Voice profile" title={`${client.firstName}’s LinkedIn voice`} description="Complete onboarding to generate this client’s voice profile." /><EmptyState title="No voice profile yet" description="Submit onboarding answers to generate a structured LinkedIn voice profile." /></div>;
}
