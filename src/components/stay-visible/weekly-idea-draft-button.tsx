'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FilePenLine, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { WeeklyIdea } from '@/lib/stay-visible/types';
import { secondaryButtonClass } from './ui';

export function WeeklyIdeaDraftButton({ idea }: { idea: WeeklyIdea }) {
  const router = useRouter();
  const [drafting, setDrafting] = useState(false);

  async function draftPost() {
    setDrafting(true);
    try {
      const response = await fetch('/api/generate-linkedin-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: idea.clientId,
          postType: 'General Update',
          topic: idea.topic,
          mainTakeaway: idea.angle || idea.reason || idea.topic,
          notes: idea.reason,
          tone: 'Use the client voice profile and keep it natural.',
        }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json() as { options: unknown[] };
      sessionStorage.setItem('stayvisible-generated', JSON.stringify(data.options));
      toast.success('Draft options are ready');
      router.push('/posts/generated/review');
    } catch {
      toast.error('Could not draft a post from this idea');
    } finally {
      setDrafting(false);
    }
  }

  return <button type="button" onClick={draftPost} disabled={drafting} className={`${secondaryButtonClass} mt-5 w-full`}>
    {drafting ? <><LoaderCircle className="size-4 animate-spin" />Drafting...</> : <><FilePenLine className="size-4" />Draft Post</>}
  </button>;
}
