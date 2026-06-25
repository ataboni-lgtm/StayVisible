-- StayVisible MVP schema for Supabase Postgres
create extension if not exists pgcrypto;

create type public.client_status as enum ('Onboarding Needed', 'Active', 'Paused');
create type public.post_status as enum ('Idea', 'Draft', 'Generated', 'Sent for Approval', 'Changes Requested', 'Approved', 'Posted', 'Rejected');
create type public.notification_method as enum ('Email', 'Text', 'Both');

create table public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(), admin_id uuid not null references public.admins(id) on delete cascade,
  first_name text not null, last_name text not null, email text not null, phone text,
  company text, job_title text, industry text, location text, linkedin_profile_url text,
  target_audience text, topics text[] not null default '{}', topics_to_avoid text[] not null default '{}',
  preferred_notification_method public.notification_method not null default 'Email',
  status public.client_status not null default 'Onboarding Needed', recent_activity_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.voice_profiles (
  id uuid primary key default gen_random_uuid(), client_id uuid not null unique references public.clients(id) on delete cascade,
  tone_summary text, sentence_style text, vocabulary_style text, post_length_preference text,
  common_phrases text[] not null default '{}', words_to_avoid text[] not null default '{}',
  emoji_rules text, hashtag_rules text, first_person_preference text, personal_professional_balance text,
  example_post text, dos text[] not null default '{}', donts text[] not null default '{}',
  learning_notes text[] not null default '{}', source_answers jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.post_opportunities (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  post_type text not null, topic_name text not null, event_date date, location text,
  people_companies_to_mention text[] not null default '{}', main_takeaway text, notes text,
  desired_tone text, call_to_action text, status public.post_status not null default 'Idea',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  post_opportunity_id uuid references public.post_opportunities(id) on delete cascade,
  storage_path text not null, alt_text text, context text, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  post_opportunity_id uuid references public.post_opportunities(id) on delete set null,
  variant_label text, caption text not null default '', hashtags text[] not null default '{}',
  selected boolean not null default false, status public.post_status not null default 'Draft',
  approved_at timestamptz, posted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  approval_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  action text, feedback text, is_active boolean not null default true,
  expires_at timestamptz not null default (now() + interval '14 days'), responded_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade, approval_id uuid references public.approvals(id) on delete set null,
  channel text not null check (channel in ('email', 'sms')), recipient text not null,
  provider_message_id text, status text not null default 'queued', error_message text, sent_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  provider text not null default 'linkedin', provider_account_id text, access_token_encrypted text,
  refresh_token_encrypted text, token_expires_at timestamptz, scopes text[] not null default '{}', status text not null default 'disconnected',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(client_id, provider)
);

create table public.edit_feedback (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  original_caption text, final_caption text, feedback text, feedback_type text, extracted_learning text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.weekly_ideas (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  week_of date not null, suggested_topic text not null, why_it_works text, suggested_angle text,
  source_context jsonb not null default '{}', status public.post_status not null default 'Idea',
  post_opportunity_id uuid references public.post_opportunities(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index clients_admin_id_idx on public.clients(admin_id);
create index clients_status_idx on public.clients(status);
create index voice_profiles_client_id_idx on public.voice_profiles(client_id);
create index opportunities_client_id_idx on public.post_opportunities(client_id);
create index opportunities_status_idx on public.post_opportunities(status);
create index photos_client_id_idx on public.photos(client_id);
create index posts_client_id_idx on public.posts(client_id);
create index posts_status_idx on public.posts(status);
create index approvals_post_id_idx on public.approvals(post_id);
create index approvals_client_id_idx on public.approvals(client_id);
create index approvals_token_idx on public.approvals(approval_token) where is_active = true;
create index notifications_client_id_idx on public.notifications(client_id);
create index notifications_post_id_idx on public.notifications(post_id);
create index social_accounts_client_id_idx on public.social_accounts(client_id);
create index edit_feedback_client_id_idx on public.edit_feedback(client_id);
create index edit_feedback_post_id_idx on public.edit_feedback(post_id);
create index weekly_ideas_client_id_idx on public.weekly_ideas(client_id);
create index weekly_ideas_status_idx on public.weekly_ideas(status);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
do $$ declare table_name text; begin foreach table_name in array array['admins','clients','voice_profiles','post_opportunities','photos','posts','approvals','notifications','social_accounts','edit_feedback','weekly_ideas'] loop execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name); end loop; end $$;

alter table public.admins enable row level security;
alter table public.clients enable row level security;
alter table public.voice_profiles enable row level security;
alter table public.post_opportunities enable row level security;
alter table public.photos enable row level security;
alter table public.posts enable row level security;
alter table public.approvals enable row level security;
alter table public.notifications enable row level security;
alter table public.social_accounts enable row level security;
alter table public.edit_feedback enable row level security;
alter table public.weekly_ideas enable row level security;

create policy "admins manage own profile" on public.admins for all using (id = auth.uid()) with check (id = auth.uid());
create policy "admins manage own clients" on public.clients for all using (admin_id = auth.uid()) with check (admin_id = auth.uid());
create policy "admins manage client voice profiles" on public.voice_profiles for all using (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid())) with check (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid()));
create policy "admins manage opportunities" on public.post_opportunities for all using (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid())) with check (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid()));
create policy "admins manage photos" on public.photos for all using (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid())) with check (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid()));
create policy "admins manage posts" on public.posts for all using (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid())) with check (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid()));
create policy "admins manage approvals" on public.approvals for all using (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid())) with check (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid()));
create policy "admins manage notifications" on public.notifications for all using (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid())) with check (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid()));
create policy "admins manage social accounts" on public.social_accounts for all using (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid())) with check (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid()));
create policy "admins manage feedback" on public.edit_feedback for all using (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid())) with check (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid()));
create policy "admins manage weekly ideas" on public.weekly_ideas for all using (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid())) with check (exists(select 1 from public.clients c where c.id = client_id and c.admin_id = auth.uid()));

insert into storage.buckets (id, name, public) values ('post-photos', 'post-photos', false) on conflict (id) do nothing;
create policy "admins manage post photos" on storage.objects for all using (bucket_id = 'post-photos' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'post-photos' and (storage.foldername(name))[1] = auth.uid()::text);
