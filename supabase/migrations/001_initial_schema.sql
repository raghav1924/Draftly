-- Draftly initial schema
-- Run in Supabase SQL Editor or via Supabase CLI

create extension if not exists "pgcrypto";

create type share_permission as enum ('viewer', 'editor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled Document'
    check (char_length(title) >= 1 and char_length(title) <= 100),
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission share_permission not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (document_id, user_id)
);

create index documents_owner_id_idx on public.documents(owner_id);
create index documents_updated_at_idx on public.documents(updated_at desc);
create index document_shares_user_id_idx on public.document_shares(user_id);
create index document_shares_document_id_idx on public.document_shares(document_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper function to break recursion in RLS policies by querying documents as security definer
create or replace function public.check_document_owner(doc_id uuid, user_id uuid)
returns boolean
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.documents
    where id = doc_id and owner_id = user_id
  );
end;
$$ language plpgsql;

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_shares enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Owners can CRUD own documents"
  on public.documents for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Shared users can read documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.document_shares ds
      where ds.document_id = documents.id
        and ds.user_id = auth.uid()
    )
  );

create policy "Shared editors can update documents"
  on public.documents for update
  using (
    exists (
      select 1 from public.document_shares ds
      where ds.document_id = documents.id
        and ds.user_id = auth.uid()
        and ds.permission = 'editor'
    )
  );

create policy "Owners can manage shares"
  on public.document_shares for all
  using (public.check_document_owner(document_id, auth.uid()));

create policy "Recipients can view own shares"
  on public.document_shares for select
  using (auth.uid() = user_id);

-- Allow document owners to look up profiles by email when sharing
create policy "Owners can lookup profiles for sharing"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.documents d
      where d.owner_id = auth.uid()
    )
  );
