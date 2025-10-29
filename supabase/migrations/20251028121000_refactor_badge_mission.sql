-- Add mission_id to badge and backfill from mission.badge_id, then drop mission.badge_id
alter table public.badge add column if not exists mission_id int references public.mission(id);

-- Backfill mission_id using mission.badge_id mapping
update public.badge b
set mission_id = m.id
from public.mission m
where m.badge_id = b.id and b.mission_id is null;

-- Ensure unique 1:1 relation (optional but recommended)
create unique index if not exists badge_mission_unique on public.badge (mission_id) where mission_id is not null;

-- Drop old link from mission to badge to keep single source of truth
alter table public.mission drop column if exists badge_id;
