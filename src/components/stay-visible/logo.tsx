import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-[#2563EB] text-white shadow-sm"><Sparkles className="size-4.5" /></span>
      {!compact && <span className="text-lg font-semibold tracking-tight text-[#0B1F3A]">StayVisible</span>}
    </Link>
  );
}
