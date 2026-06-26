'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, RefreshCw, Send } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState, primaryButtonClass, secondaryButtonClass } from './ui';

export function GeneratedReview() {
  const [options, setOptions] = useState<Array<{ label: string; content: string; postId?: string }>>([]);
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('stayvisible-generated');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Array<{ label?: string; title?: string; content: string; postId?: string }>;
        setOptions(parsed.map((option, index) => ({ label: option.label ?? option.title ?? `Option ${index + 1}`, content: option.content, postId: option.postId })));
      } catch {}
    }
  }, []);

  function continueReview() {
    if (!options[selected]) return;
    sessionStorage.setItem('stayvisible-selected', options[selected].content);
    const postId = options[selected].postId;
    router.push(postId ? `/posts/${postId}/review` : '/posts/generated/review');
  }

  async function copySelected() {
    if (!options[selected]) return;
    await navigator.clipboard.writeText(options[selected].content);
    toast.success('Copied selected draft');
  }

  function startOver() {
    sessionStorage.removeItem('stayvisible-generated');
    sessionStorage.removeItem('stayvisible-selected');
    router.push('/posts/new');
  }

  if (!options.length) return <EmptyState title="No generated drafts yet" description="Create a post opportunity first, then the generated options will appear here." />;

  return <div><div className="grid gap-5 @4xl/page:grid-cols-3">{options.map((option, index) => <button type="button" onClick={() => setSelected(index)} key={`${option.label}-${index}`} className={`surface-card relative min-h-96 p-6 text-left transition ${selected === index ? 'border-blue-500 ring-3 ring-blue-100' : 'hover:border-blue-200'}`}>{selected === index && <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-blue-600 text-white"><Check className="size-3.5" /></span>}<p className="eyebrow">Option {index + 1}</p><h2 className="mt-2 font-semibold text-[#0B1F3A]">{option.label}</h2><p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">{option.content}</p></button>)}</div><div className="mt-6 flex flex-col gap-3 @md/page:flex-row @md/page:justify-between"><div className="flex gap-3"><button className={secondaryButtonClass} onClick={copySelected}><Copy className="size-4" />Copy</button><button className={secondaryButtonClass} onClick={startOver}><RefreshCw className="size-4" />Start over</button></div><button onClick={continueReview} className={primaryButtonClass}>Review selected draft<Send className="size-4" /></button></div></div>;
}
