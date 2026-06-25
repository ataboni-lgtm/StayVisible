'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogIn, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Field, inputClass, primaryButtonClass } from './ui';

export function ClientPortalLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/client-portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email') }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error);
      toast.success('Welcome back');
      router.push('/client-portal');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in');
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="space-y-5">
    <Field label="Email"><input required type="email" name="email" autoComplete="email" className={inputClass} placeholder="you@example.com" /></Field>
    <button disabled={loading} className={`${primaryButtonClass} w-full`}>
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
      {loading ? 'Opening portal...' : 'Open client portal'}
    </button>
  </form>;
}
