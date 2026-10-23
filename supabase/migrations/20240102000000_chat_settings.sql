-- Per-channel chat moderation settings (slow mode, emote-only).

create table if not exists public.channel_chat_settings (
  channel_id uuid primary key references public.channels(id) on delete cascade,
  slow_mode boolean not null default false,
  slow_mode_seconds integer not null default 5 check (slow_mode_seconds >= 0),
  emote_only boolean not null default false,
  max_message_length integer not null default 500 check (max_message_length between 1 and 500),
  updated_at timestamptz not null default now()
);

alter table public.channel_chat_settings enable row level security;

create policy "chat_settings_select_all" on public.channel_chat_settings
  for select using (true);

create policy "chat_settings_write_owner" on public.channel_chat_settings
  for all using (
    exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
  );
