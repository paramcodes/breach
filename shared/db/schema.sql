-- Twitch clone data layer schema.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.streams (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  title text not null,
  status text not null default 'idle' check (status in ('idle', 'live', 'ended')),
  viewer_count integer not null default 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, channel_id)
);

create table if not exists public.emotes (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  name text not null,
  url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (channel_id, name)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  username text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Profile auto-creation on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, username)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS.
alter table public.users enable row level security;
alter table public.channels enable row level security;
alter table public.streams enable row level security;
alter table public.follows enable row level security;
alter table public.emotes enable row level security;
alter table public.messages enable row level security;

-- users
create policy "users_select_all" on public.users for select using (true);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- channels (ownership)
create policy "channels_select_all" on public.channels for select using (true);
create policy "channels_insert_owner" on public.channels for insert with check (auth.uid() = owner_id);
create policy "channels_update_owner" on public.channels for update using (auth.uid() = owner_id);
create policy "channels_delete_owner" on public.channels for delete using (auth.uid() = owner_id);

-- streams
create policy "streams_select_all" on public.streams for select using (true);
create policy "streams_write_owner" on public.streams for all using (
  exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
) with check (
  exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
);

-- follows
create policy "follows_select_all" on public.follows for select using (true);
create policy "follows_insert_own" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete_own" on public.follows for delete using (auth.uid() = follower_id);

-- emotes
create policy "emotes_select" on public.emotes for select using (
  status = 'approved'
  or exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
);
create policy "emotes_insert_owner" on public.emotes for insert with check (
  exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
);
create policy "emotes_update_owner" on public.emotes for update using (
  exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
);
create policy "emotes_delete_owner" on public.emotes for delete using (
  exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
);

-- messages (chat insert)
create policy "messages_select_all" on public.messages for select using (true);
create policy "messages_insert_authed" on public.messages for insert with check (auth.uid() = user_id);
create policy "messages_delete_owner_or_author" on public.messages for delete using (
  auth.uid() = user_id
  or exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
);
