alter table public.user_sticker_progress
add column if not exists repeated_count integer not null default 0;

update public.user_sticker_progress
set repeated_count = case
  when repeated = true and repeated_count = 0 then 1
  else repeated_count
end;
