-- ============================================================
-- SCRIPT DE DESARROLLO LOCAL ONIRIA
-- Levantar con Supabase en Docker desde cero
-- ============================================================

-- Habilitar extensión para gen_random_uuid
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILE (igual que en producción)
-- ============================================================
create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  date_of_birth date,
  coin_amount int default 0
);

-- Crear función para manejar nuevos usuarios
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profile (id, date_of_birth, coin_amount)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'date_of_birth', '')::date,
    0
  );
  return new;
end;
$$ language plpgsql security definer;

-- Eliminar trigger si existe y recrearlo
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Activar Row Level Security
alter table public.profile enable row level security;

-- Eliminar políticas si existían
drop policy if exists profile_select_own on public.profile;
drop policy if exists profile_insert_own on public.profile;
drop policy if exists profile_update_own on public.profile;

-- Crear políticas
create policy "profile_select_own"
  on public.profile
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profile_insert_own"
  on public.profile
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profile_update_own"
  on public.profile
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- DREAM CONTEXT: THEMES, PEOPLE, EMOTIONS, LOCATIONS
-- ============================================================
create table if not exists public.profile_theme (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profile(id) on delete cascade,
    label text not null,
    last_updated timestamp with time zone default now()
);

create unique index if not exists unique_theme_per_profile 
on public.profile_theme(profile_id, lower(label));

create table if not exists public.profile_person (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profile(id) on delete cascade,
    label text not null,
    last_updated timestamp with time zone default now()
);

create unique index if not exists unique_person_per_profile 
on public.profile_person(profile_id, lower(label));

create table if not exists public.profile_emotion_context (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profile(id) on delete cascade,
    label text not null,
    last_updated timestamp with time zone default now()
);

create unique index if not exists unique_emotion_per_profile 
on public.profile_emotion_context(profile_id, lower(label));

create table if not exists public.profile_location (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profile(id) on delete cascade,
    label text not null,
    last_updated timestamp with time zone default now()
);

create unique index if not exists unique_location_per_profile 
on public.profile_location(profile_id, lower(label));

-- ============================================================
-- EMOTION COLOR
-- ============================================================
create table if not exists public.emotion (
    id serial primary key,
    emotion varchar(100) not null,
    color varchar(50) not null
);

-- ============================================================
-- PRIVACY
-- ============================================================
create table if not exists public.dream_privacy (
    id serial primary key,
    description varchar(100) not null
);

-- ============================================================
-- STATE
-- ============================================================
create table if not exists public.dream_state (
    id serial primary key,
    description varchar(100) not null
);

-- ============================================================
-- DREAM
-- ============================================================
create table if not exists public.dream_node (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.profile(id) on delete cascade,
    title varchar(200) not null,
    description text not null,
    interpretation text not null,
    creation_date timestamp,
    privacy_id int references public.dream_privacy(id) not null,
    state_id int references public.dream_state(id) not null,
    emotion_id int references public.emotion(id) not null
);

-- ============================================================
-- BADGE & TIER
-- ============================================================
create table if not exists public.badge (
    id uuid primary key default gen_random_uuid(),
    badge_image text,
    badge_description text
);

create table if not exists public.tier (
    id serial primary key,
    tier_name varchar(100) not null,
    coin int not null
);

create table if not exists public.badge_tier (
    badge_id uuid references public.badge(id) on delete cascade,
    tier_id int references public.tier(id) on delete cascade,
    primary key (badge_id, tier_id)
);

create table if not exists public.user_badge (
    profile_id uuid references public.profile(id) on delete cascade,
    badge_id uuid references public.badge(id) on delete cascade,
    primary key (profile_id, badge_id)
);

-- ============================================================
-- ROOM & SKIN
-- ============================================================
create table if not exists public.room (
    id uuid primary key default gen_random_uuid(),
    room_url text not null
);

create table if not exists public.user_room (
    profile_id uuid references public.profile(id) on delete cascade,
    room_id uuid references public.room(id) on delete cascade
);

create table if not exists public.skin (
    id uuid primary key default gen_random_uuid(),
    skin_url text not null
);

create table if not exists public.user_skin (
    profile_id uuid references public.profile(id) on delete cascade,
    skin_id uuid references public.skin(id) on delete cascade
);

-- ============================================================
-- SETTINGS
-- ============================================================
create table if not exists public.setting (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.profile(id) on delete cascade,
    setting_name varchar(100) not null
);

-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================
insert into public.emotion (id, emotion, color) values
(1, 'Felicidad', 'Yellow'),
(2, 'Tristeza', 'Blue'),
(3, 'Miedo', 'Purple'),
(4, 'Enojo', 'Red')
on conflict (id) do nothing;

insert into public.dream_privacy (id, description) values
(1, 'Publico'),
(2, 'Privado'),
(3, 'Anonimo')
on conflict (id) do nothing;

insert into public.dream_state (id, description) values
(1, 'Activo'),
(2, 'Archivado')
on conflict (id) do nothing;