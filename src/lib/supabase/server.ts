type SupabaseMethod = 'GET' | 'POST' | 'PATCH';

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function supabaseRequest<T>(path: string, options: { method?: SupabaseMethod; body?: unknown; prefer?: string } = {}): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  const response = await fetch(`${url}/rest/v1/${path}`, { method: options.method ?? 'GET', headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json', Prefer: options.prefer ?? 'return=representation' }, body: options.body === undefined ? undefined : JSON.stringify(options.body), cache: 'no-store' });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  if (response.status === 204) return null;
  return await response.json() as T;
}
