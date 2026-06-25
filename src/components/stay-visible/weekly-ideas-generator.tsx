'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/lib/stay-visible/types';
import { inputClass, primaryButtonClass } from './ui';

export function WeeklyIdeasGenerator({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const activeClients = clients.filter((client) => client.status === 'Active');
  const [clientId, setClientId] = useState(activeClients[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  async function generate() {
    if (!clientId) {
      toast.error('Choose an active client first');
      return;
    }
    setGenerating(true);
    try {
      const response = await fetch('/api/weekly-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, recentActivityNotes: notes }),
      });
      if (!response.ok) throw new Error();
      toast.success('Weekly ideas generated');
      setNotes('');
      router.refresh();
    } catch {
      toast.error('Could not generate weekly ideas');
    } finally {
      setGenerating(false);
    }
  }

  return <section className="surface-card mb-6 grid gap-4 p-4 @lg/page:grid-cols-[1fr_2fr_auto]">
    <select value={clientId} onChange={(event) => setClientId(event.target.value)} className={inputClass}>
      {activeClients.length ? activeClients.map((client) => <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>) : <option value="">No active clients</option>}
    </select>
    <input value={notes} onChange={(event) => setNotes(event.target.value)} className={inputClass} placeholder="Add recent activity notes to inspire ideas..." />
    <button type="button" onClick={generate} disabled={generating || !clientId} className={primaryButtonClass}>
      <Sparkles className="size-4" />{generating ? 'Generating...' : 'Generate ideas'}
    </button>
  </section>;
}
