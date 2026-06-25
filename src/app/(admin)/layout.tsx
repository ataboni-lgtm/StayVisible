import { AppShell } from '@/components/stay-visible/app-shell';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (supabaseConfigured && !cookieStore.get('stayvisible-access-token')) redirect('/login');
  return <AppShell>{children}</AppShell>;
}
