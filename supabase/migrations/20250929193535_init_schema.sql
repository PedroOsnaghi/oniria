---ESTE SCRIPT SE USA EN DESARROLLO LOCAL CON DOCKER Y SUPABASE---
---CUANDO SE HAGA DEPLOY A PRODUCCION, SE DEBE USAR EL SCRIPT
---"oniriaScriptProduction.sql" QUE NO INCLUYE LA TABLA PUBLIC.USERS---

--USERS (USADO POR SUPABASE AUTH)
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) unique not null,
    encrypted_password text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
-- PROFILE
create table if not exists public.profile (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    date_of_birth date,
    coin_amount int default 0
);

-- EMOTION COLOR
create table if not exists public.emotion (
    id serial primary key,
    emotion varchar(100) not null,
    color varchar(50) not null
);

-- PRIVACY
create table if not exists public.dream_privacy (
    id serial primary key,
    description varchar(100) not null
);

-- STATE
create table if not exists public.dream_state (
     id serial primary key,
    description varchar(100) not null
);
-- DREAM
create table if not exists public.dream_node (
    id uuid primary key,
    profile_id uuid not null references profile(id) on delete cascade,
    title varchar(200) not null,
    description text not null,
    interpretation text not null,
    creation_date timestamp,
    privacy_id int references "dream_privacy"(id) not null,
    state_id int references "dream_state"(id) not null,
    emotion_id int references "emotion"(id) not null
);

-- BADGE
create table if not exists public.badge (
    id uuid primary key default gen_random_uuid(),
    badge_image text,
    badge_description text
);

-- TIER
create table if not exists public.tier (
    id serial primary key,
    tier_name varchar(100) not null,
    coin int not null
);

-- RELATION Badge ↔ Tier (N:M)
create table if not exists public.badge_tier (
    badge_id uuid references "badge"(id) on delete cascade,
    tier_id int references "tier"(id) on delete cascade,
    primary key (badge_id, tier_id)
);

-- RELATION User ↔ Badge (N:M)
create table if not exists public.user_badge (
    profile_id uuid references "profile"(id) on delete cascade,
    badge_id uuid references "badge"(id) on delete cascade,
    primary key (profile_id, badge_id)
);

-- ROOM
create table if not exists public.room (
    id uuid primary key default gen_random_uuid(),
    room_url text not null
);

--USER ROOM
create table if not exists public.user_room (
    profile_id uuid references "profile"(id) on delete cascade,
    room_id uuid references "room"(id) on delete cascade
);

-- SKIN
create table if not exists public.skin (
    id uuid primary key default gen_random_uuid(),
    skin_url text not null
);

-- USER SKIN
create table if not exists public.user_skin (
    profile_id uuid references "profile"(id) on delete cascade,
    skin_id uuid references "skin"(id) on delete cascade
);

-- SETTINGS
create table if not exists public.setting (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references "profile"(id) on delete cascade,
    setting_name varchar(100) not null
);


insert into public.emotion (id, emotion, color) values
(1, 'Felicidad', 'Yellow'),
(2, 'Tristeza', 'Blue'),
(3, 'Miedo', 'Purple'),
(4, 'Enojo', 'Red');

insert into public.dream_privacy (id, description) values
(1, 'Publico'),
(2, 'Privado'),
(3, 'Anonimo');

insert into public.dream_state (id, description) values
(1, 'Activo'),
(2, 'Archivado');


-- INSERTAR UN USUARIO EN public.users
INSERT INTO public.users (id, email, encrypted_password)
VALUES (
    gen_random_uuid(),
    'usuario@example.com',
    'hash_de_password_aqui'
);

-- INSERTAR UN PROFILE ASOCIADO AL USUARIO
INSERT INTO public.profile (id, user_id, date_of_birth, coin_amount)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM public.users WHERE email = 'usuario@example.com'),
    '1995-09-29',
    100
);

-- INSERTAR UN DREAM_NODE ASOCIADO AL PROFILE
INSERT INTO public.dream_node (
    id,
    profile_id,
    title,
    description,
    interpretation,
    creation_date,
    privacy_id,
    state_id,
    emotion_id
)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM profile WHERE user_id = (SELECT id FROM public.users WHERE email = 'usuario@example.com')),
    'Sueño de volar',
    'Soñé que podía volar sobre la ciudad',
    'Deseo de libertad',
    '2025-09-29',
    1,  -- privacy_id de ejemplo
    2,  -- state_id de ejemplo
    1   -- emotion_id de ejemplo
);
