import { OnboardingForm } from '@/components/stay-visible/onboarding-form';
import { readStore } from '@/lib/stay-visible/local-store';
import { EmptyState, PageHeader } from '@/components/stay-visible/ui';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { clients } = await readStore();
  const client = clients.find((item) => item.id === id);
  if (!client) return <EmptyState title="Client not found" description="Add a client before starting onboarding." />;
  return <div className="@container/page mx-auto max-w-4xl"><PageHeader eyebrow="LinkedIn voice onboarding" title={`Help us sound like ${client.firstName}`} description="These answers shape every future draft. The goal is not a perfect persona. It’s a recognizable one." /><OnboardingForm clientId={client.id} /></div>;
}
