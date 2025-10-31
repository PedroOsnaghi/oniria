-- Missions and user_mission tracking
create table if not exists public.mission (
  id serial primary key,
  code varchar(100) unique not null,
  title varchar(200) not null,
  description text,
  type varchar(50) not null, -- 'counter' | 'streak' | 'time-window' | 'set-completion'
  target int,
  config jsonb
);

create table if not exists public.user_mission (
  profile_id uuid references public.profile(id) on delete cascade,
  mission_id int references public.mission(id) on delete cascade,
  progress int not null default 0,
  completed_at timestamp,
  last_event_at timestamp,
  data jsonb,
  primary key (profile_id, mission_id)
);

alter table public.badge add column if not exists mission_id int references public.mission(id);
create unique index if not exists badge_mission_unique on public.badge (mission_id) where mission_id is not null;

insert into public.badge (id, badge_image, badge_description) values
  (gen_random_uuid(), null, 'Primer Sueño: Guarda tu primer sueño'),
  (gen_random_uuid(), null, 'Cinco Sueños: Guarda 5 sueños'),
  (gen_random_uuid(), null, 'Soñador dedicado: Guarda 10 sueños'),
  (gen_random_uuid(), null, 'Explorador Onírico: Guarda 25 sueños'),
  (gen_random_uuid(), null, 'Maestro de los sueños: Guarda 50 sueños'),
  (gen_random_uuid(), null, 'Soñador constante: Guarda sueños 3 días seguidos'),
  (gen_random_uuid(), null, 'Rutina onírica: Guarda sueños 7 días seguidos'),
  (gen_random_uuid(), null, 'Diario de Ensueño: Guarda sueños 30 días seguidos'),
  (gen_random_uuid(), null, 'Intérprete reflexivo: Reinterpreta 3 sueños diferentes')
on conflict do nothing;

with
  badge1 as (select id from public.badge where badge_description like 'Primer Sueño:%' limit 1),
  badge2 as (select id from public.badge where badge_description like 'Cinco Sueños:%' limit 1),
  badge3 as (select id from public.badge where badge_description like 'Soñador dedicado:%' limit 1),
  badge4 as (select id from public.badge where badge_description like 'Explorador Onírico:%' limit 1),
  badge5 as (select id from public.badge where badge_description like 'Maestro de los sueños:%' limit 1),
  badge6 as (select id from public.badge where badge_description like 'Soñador constante:%' limit 1),
  badge7 as (select id from public.badge where badge_description like 'Rutina onírica:%' limit 1),
  badge8 as (select id from public.badge where badge_description like 'Diario de Ensueño:%' limit 1),
  badge9 as (select id from public.badge where badge_description like 'Intérprete reflexivo:%' limit 1)
insert into public.mission (code, title, description, type, target) values
  ('first_dream', 'Primer Sueño', 'Guarda tu primer sueño', 'counter', 1),
  ('five_dreams', 'Cinco Sueños', 'Guarda 5 sueños', 'counter', 5),
  ('dedicated_dreamer', 'Soñador dedicado', 'Guarda 10 sueños', 'counter', 10),
  ('dream_explorer', 'Explorador Onírico', 'Guarda 25 sueños', 'counter', 25),
  ('dream_master', 'Maestro de los sueños', 'Guarda 50 sueños', 'counter', 50),
  ('constant_dreamer', 'Soñador constante', 'Guarda sueños 3 días seguidos', 'streak', 3),
  ('dream_routine', 'Rutina onírica', 'Guarda sueños 7 días seguidos', 'streak', 7),
  ('dream_diary', 'Diario de Ensueño', 'Guarda sueños 30 días seguidos', 'streak', 30),
  ('reflective_interpreter', 'Intérprete reflexivo', 'Reinterpreta 3 sueños diferentes', 'counter', 3)
on conflict (code) do nothing;

-- Backfill badge.mission_id linking by mission code and badge description pattern
with mapping as (
  select 'first_dream' as code, 'Primer Sueño:%' as pattern union all
  select 'five_dreams', 'Cinco Sueños:%' union all
  select 'dedicated_dreamer', 'Soñador dedicado:%' union all
  select 'dream_explorer', 'Explorador Onírico:%' union all
  select 'dream_master', 'Maestro de los sueños:%' union all
  select 'constant_dreamer', 'Soñador constante:%' union all
  select 'dream_routine', 'Rutina onírica:%' union all
  select 'dream_diary', 'Diario de Ensueño:%' union all
  select 'reflective_interpreter', 'Intérprete reflexivo:%'
)
update public.badge b
set mission_id = m.id
from mapping mp
join public.mission m on m.code = mp.code
where b.badge_description like mp.pattern and b.mission_id is null;
