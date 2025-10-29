-- Missions and user_mission tracking
create table if not exists public.mission (
  id serial primary key,
  code varchar(100) unique not null,
  title varchar(200) not null,
  description text,
  type varchar(50) not null, -- 'counter' | 'streak' | 'time-window' | 'set-completion'
  target int,
  config jsonb,
  badge_id uuid references public.badge(id)
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

-- Seed sample badges and missions (idempotent)
insert into public.badge (id, badge_image, badge_description)
values
  (gen_random_uuid(), null, 'Primer Sueño: Guarda tu primer sueño'),
  (gen_random_uuid(), null, 'Cinco Sueños: Guarda 5 sueños')
on conflict do nothing;

-- Link mission -> badge using existing rows by description match
with first_badge as (
  select id from public.badge where badge_description like 'Primer Sueño:%' limit 1
), five_badge as (
  select id from public.badge where badge_description like 'Cinco Sueños:%' limit 1
)
insert into public.mission (code, title, description, type, target, badge_id)
values
  ('first_dream', 'Primer Sueño', 'Guarda tu primer sueño', 'counter', 1, (select id from first_badge)),
  ('five_dreams', 'Cinco Sueños', 'Guarda 5 sueños', 'counter', 5, (select id from five_badge))
on conflict (code) do nothing;
