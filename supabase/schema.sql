create table if not exists public.user_sticker_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sticker_number text not null,
  owned boolean not null default false,
  repeated boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint user_sticker_progress_user_sticker_unique unique (user_id, sticker_number)
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_sticker_progress_updated_at on public.user_sticker_progress;

create trigger set_user_sticker_progress_updated_at
before update on public.user_sticker_progress
for each row
execute function public.set_updated_at();

alter table public.user_sticker_progress enable row level security;

drop policy if exists "Users can select their own sticker progress"
on public.user_sticker_progress;

create policy "Users can select their own sticker progress"
on public.user_sticker_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own sticker progress"
on public.user_sticker_progress;

create policy "Users can insert their own sticker progress"
on public.user_sticker_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sticker progress"
on public.user_sticker_progress;

create policy "Users can update their own sticker progress"
on public.user_sticker_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own sticker progress"
on public.user_sticker_progress;

create policy "Users can delete their own sticker progress"
on public.user_sticker_progress
for delete
using (auth.uid() = user_id);
