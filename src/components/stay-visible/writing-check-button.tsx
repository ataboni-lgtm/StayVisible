'use client';

import { useState } from 'react';
import { LoaderCircle, SpellCheck } from 'lucide-react';
import { toast } from 'sonner';
import { secondaryButtonClass } from './ui';

export function WritingCheckButton({ text, onApply, context = 'LinkedIn caption', className = '' }: {
  text: string;
  onApply: (text: string) => void;
  context?: string;
  className?: string;
}) {
  const [checking, setChecking] = useState(false);

  async function checkWriting() {
    if (!text.trim()) return;
    setChecking(true);
    try {
      const response = await fetch('/api/check-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context }),
      });
      if (!response.ok) throw new Error();
      const result = await response.json() as { checkedText: string; changed: boolean };
      onApply(result.checkedText);
      toast.success(result.changed ? 'Spelling and grammar cleaned up' : 'No spelling or grammar changes found');
    } catch {
      toast.error('Could not check spelling and grammar');
    } finally {
      setChecking(false);
    }
  }

  return <button type="button" onClick={checkWriting} disabled={checking || !text.trim()} className={`${secondaryButtonClass} ${className}`}>
    {checking ? <LoaderCircle className="size-4 animate-spin" /> : <SpellCheck className="size-4" />}
    {checking ? 'Checking...' : 'Check spelling & grammar'}
  </button>;
}
