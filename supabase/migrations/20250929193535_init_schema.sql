-- ============================================================
-- ONIRIA: SCRIPT COMPLETO
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
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

-- Activar Row Level Security en profile
alter table public.profile enable row level security;

-- Crear políticas para profile
drop policy if exists profile_select_own on public.profile;
drop policy if exists profile_insert_own on public.profile;
drop policy if exists profile_update_own on public.profile;

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
-- EMOTION (USAR UUIDs EN LUGAR DE SERIAL)
-- ============================================================
create table if not exists public.emotion (
    id uuid primary key default gen_random_uuid(),
    emotion varchar(100) not null,
    color varchar(50) not null
);

-- ============================================================
-- PRIVACY (UUID)
-- ============================================================
create table if not exists public.dream_privacy (
    id uuid primary key default gen_random_uuid(),
    privacy_description varchar(100) not null
);

-- ============================================================
-- STATE (UUID)
-- ============================================================
create table if not exists public.dream_state (
    id uuid primary key default gen_random_uuid(),
    state_description varchar(100) not null
);

-- ============================================================
-- DREAM NODE (USAR dream_description)
-- ============================================================
create table if not exists public.dream_node (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.profile(id) on delete cascade,
    title varchar(200) not null,
    dream_description text not null,
    interpretation text,
    creation_date timestamp default now(),
    privacy_id uuid references public.dream_privacy(id),
    state_id uuid references public.dream_state(id),
    emotion_id uuid references public.emotion(id)
);

-- ============================================================
-- BADGE & TIER (UUIDs)
-- ============================================================
create table if not exists public.badge (
    id uuid primary key default gen_random_uuid(),
    badge_image text,
    badge_description text
);

create table if not exists public.tier (
    id uuid primary key default gen_random_uuid(),
    tier_name varchar(100) not null,
    coin int not null
);

create table if not exists public.badge_tier (
    badge_id uuid references public.badge(id) on delete cascade,
    tier_id uuid references public.tier(id) on delete cascade,
    primary key (badge_id, tier_id)
);

create table if not exists public.user_badge (
    profile_id uuid references public.profile(id) on delete cascade,
    badge_id uuid references public.badge(id) on delete cascade,
    primary key (profile_id, badge_id)
);

-- ============================================================
-- ROOMS AND SKINS
-- ============================================================
create table if not exists public.rooms (
    id              VARCHAR(100) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    
    image_url       VARCHAR(500),
    preview_light   VARCHAR(500),
    preview_dark    VARCHAR(500),
    model_url       VARCHAR(500),
    
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    
    price           NUMERIC(10,2),
    included_in_plan VARCHAR(50),
    ownership_status VARCHAR(50) NOT NULL,
    
    compatible_skins TEXT[],  
    
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

create table if not exists public.skins (
    id              VARCHAR(100) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    
    image_url       VARCHAR(500),
    preview_light   VARCHAR(500),
    preview_dark    VARCHAR(500),
    
    supports_themes BOOLEAN NOT NULL,
    
    objects_light   VARCHAR(500),
    objects_dark    VARCHAR(500),
    walls_light     VARCHAR(500),
    walls_dark      VARCHAR(500),
    
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    price           NUMERIC(10,2),
    included_in_plan VARCHAR(50),
    ownership_status VARCHAR(50) NOT NULL,
    
    compatible_rooms TEXT[],  
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

create table if not exists public.user_items (
    user_id         UUID REFERENCES public.profile(id) ON DELETE CASCADE,
    item_id         VARCHAR(100) NOT NULL,
    item_type       VARCHAR(10) NOT NULL CHECK (item_type IN ('room', 'skin')),
    ownership_type  VARCHAR(50) NOT NULL,
    purchased_at    TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, item_id)
);

create index if not exists idx_rooms_is_default on public.rooms(is_default);
create index if not exists idx_rooms_included_in_plan on public.rooms(included_in_plan);
create index if not exists idx_skins_is_default on public.skins(is_default);
create index if not exists idx_skins_included_in_plan on public.skins(included_in_plan);
create index if not exists idx_user_items_item_type on public.user_items(item_type);
create index if not exists idx_user_items_ownership on public.user_items(ownership_type);


-- ============================================================
-- SETTINGS
-- ============================================================
create table if not exists public.setting (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.profile(id) on delete cascade,
    setting_name varchar(100) not null
);

-- ============================================================
-- JUNCTION TABLES: DREAM <-> CONTEXT (UUID refs)
-- ============================================================
create table if not exists public.dream_theme (
    dream_id uuid references public.dream_node(id) on delete cascade,
    theme_id uuid references public.profile_theme(id) on delete cascade,
    primary key (dream_id, theme_id)
);

create table if not exists public.dream_person (
    dream_id uuid references public.dream_node(id) on delete cascade,
    person_id uuid references public.profile_person(id) on delete cascade,
    primary key (dream_id, person_id)
);

create table if not exists public.dream_emotion_context (
    dream_id uuid references public.dream_node(id) on delete cascade,
    emotion_context_id uuid references public.profile_emotion_context(id) on delete cascade,
    primary key (dream_id, emotion_context_id)
);

create table if not exists public.dream_location (
    dream_id uuid references public.dream_node(id) on delete cascade,
    location_id uuid references public.profile_location(id) on delete cascade,
    primary key (dream_id, location_id)
);

-- ============================================================
-- RLS POLICIES PARA JUNCTION TABLES
-- ============================================================

alter table public.dream_theme enable row level security;
alter table public.dream_person enable row level security;
alter table public.dream_emotion_context enable row level security;
alter table public.dream_location enable row level security;

-- ============================================================
-- Policies para dream_theme
-- ============================================================
drop policy if exists "Users can view own dream themes" on public.dream_theme;
create policy "Users can view own dream themes"
  on public.dream_theme for select
  to authenticated
  using (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_theme.dream_id
        and dn.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own dream themes" on public.dream_theme;
create policy "Users can insert own dream themes"
  on public.dream_theme for insert
  to authenticated
  with check (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_theme.dream_id
        and dn.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own dream themes" on public.dream_theme;
create policy "Users can delete own dream themes"
  on public.dream_theme for delete
  to authenticated
  using (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_theme.dream_id
        and dn.profile_id = auth.uid()
    )
  );

-- ============================================================
-- Policies para dream_person
-- ============================================================
drop policy if exists "Users can view own dream people" on public.dream_person;
create policy "Users can view own dream people"
  on public.dream_person for select
  to authenticated
  using (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_person.dream_id
        and dn.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own dream people" on public.dream_person;
create policy "Users can insert own dream people"
  on public.dream_person for insert
  to authenticated
  with check (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_person.dream_id
        and dn.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own dream people" on public.dream_person;
create policy "Users can delete own dream people"
  on public.dream_person for delete
  to authenticated
  using (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_person.dream_id
        and dn.profile_id = auth.uid()
    )
  );

-- ============================================================
-- Policies para dream_emotion_context
-- ============================================================
drop policy if exists "Users can view own dream emotions" on public.dream_emotion_context;
create policy "Users can view own dream emotions"
  on public.dream_emotion_context for select
  to authenticated
  using (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_emotion_context.dream_id
        and dn.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own dream emotions" on public.dream_emotion_context;
create policy "Users can insert own dream emotions"
  on public.dream_emotion_context for insert
  to authenticated
  with check (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_emotion_context.dream_id
        and dn.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own dream emotions" on public.dream_emotion_context;
create policy "Users can delete own dream emotions"
  on public.dream_emotion_context for delete
  to authenticated
  using (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_emotion_context.dream_id
        and dn.profile_id = auth.uid()
    )
  );

-- ============================================================
-- Policies para dream_location
-- ============================================================
drop policy if exists "Users can view own dream locations" on public.dream_location;
create policy "Users can view own dream locations"
  on public.dream_location for select
  to authenticated
  using (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_location.dream_id
        and dn.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own dream locations" on public.dream_location;
create policy "Users can insert own dream locations"
  on public.dream_location for insert
  to authenticated
  with check (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_location.dream_id
        and dn.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can delete own dream locations" on public.dream_location;
create policy "Users can delete own dream locations"
  on public.dream_location for delete
  to authenticated
  using (
    exists (
      select 1 from public.dream_node dn
      where dn.id = dream_location.dream_id
        and dn.profile_id = auth.uid()
    )
  );

-- ============================================================
-- DATOS DE PRUEBA (inserts iniciales)
-- ============================================================
-- Emotions (HEX colors)
insert into public.emotion (emotion, color)
values
  ('Felicidad', '#FFFF00'),
  ('Tristeza', '#0000FF'),
  ('Miedo', '#800080'),
  ('Enojo', '#FF0000')
on conflict do nothing;

-- Privacy
insert into public.dream_privacy (privacy_description)
values
  ('Publico'),
  ('Privado'),
  ('Anonimo')
on conflict do nothing;

-- State
insert into public.dream_state (state_description)
values
  ('Activo'),
  ('Archivado')
on conflict do nothing;

-- ============================================================
-- FUNCIÓN PARA OBTENER CONTEXTO DEL USUARIO CON CONTADORES
-- ============================================================
create or replace function public.get_user_context(params jsonb)
returns json
language plpgsql
security definer
as $$
declare
  user_id uuid;
begin
  user_id := (params->>'user_id')::uuid;

  return json_build_object(
    'themes', (
      select coalesce(json_agg(theme_data order by (theme_data->>'count')::int desc), '[]'::json)
      from (
        select json_build_object(
          'label', pt.label,
          'count', count(dt.dream_id)
        ) as theme_data
        from public.profile_theme pt
        left join public.dream_theme dt on dt.theme_id = pt.id
        and dt.dream_id in (
          select id from public.dream_node
          where profile_id = user_id
          order by creation_date desc
          limit 20
        )
        where pt.profile_id = user_id
        group by pt.id, pt.label, pt.last_updated
        having count(dt.dream_id) > 0
      ) themes_subquery
    ),
    'people', (
      select coalesce(json_agg(people_data order by (people_data->>'count')::int desc), '[]'::json)
      from (
        select json_build_object(
          'label', pp.label,
          'count', count(dp.dream_id)
        ) as people_data
        from public.profile_person pp
        left join public.dream_person dp on dp.person_id = pp.id
        and dp.dream_id in (
          select id from public.dream_node
          where profile_id = user_id
          order by creation_date desc
          limit 20
        )
        where pp.profile_id = user_id
        group by pp.id, pp.label, pp.last_updated
        having count(dp.dream_id) > 0
      ) people_subquery
    ),
    'emotions', (
      select coalesce(json_agg(emotion_data order by (emotion_data->>'count')::int desc), '[]'::json)
      from (
        select json_build_object(
          'label', pec.label,
          'count', count(de.dream_id)
        ) as emotion_data
        from public.profile_emotion_context pec
        left join public.dream_emotion_context de on de.emotion_context_id = pec.id
        and de.dream_id in (
          select id from public.dream_node
          where profile_id = user_id
          order by creation_date desc
          limit 20
        )
        where pec.profile_id = user_id
        group by pec.id, pec.label, pec.last_updated
        having count(de.dream_id) > 0
      ) emotions_subquery
    ),
    'locations', (
      select coalesce(json_agg(location_data order by (location_data->>'count')::int desc), '[]'::json)
      from (
        select json_build_object(
          'label', pl.label,
          'count', count(dl.dream_id)
        ) as location_data
        from public.profile_location pl
        left join public.dream_location dl on dl.location_id = pl.id
        and dl.dream_id in (
          select id from public.dream_node
          where profile_id = user_id
          order by creation_date desc
          limit 20
        )
        where pl.profile_id = user_id
        group by pl.id, pl.label, pl.last_updated
        having count(dl.dream_id) > 0
      ) locations_subquery
    )
  );
end;
$$;

grant execute on function public.get_user_context(jsonb) to authenticated;

