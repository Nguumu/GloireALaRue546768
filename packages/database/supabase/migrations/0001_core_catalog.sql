-- Core, game-agnostic card catalog: games, sets, cards, printings, products.
-- This is the read-mostly data synced by packages/database/src/scripts/sync-cards.ts
-- from a CardDataProvider (see @tcg/tcg-core). Public read access; writes are
-- restricted to service_role (admin/sync jobs), never end users.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- to_tsvector(regconfig, text) is only STABLE (config lookup can depend on
-- search_path), which Postgres refuses for a generated column. 'simple' is
-- hardcoded and never varies, so this thin wrapper is safe to mark IMMUTABLE.
create function public.immutable_simple_tsvector(input text)
returns tsvector
language sql
immutable
parallel safe
as $$
  select to_tsvector('pg_catalog.simple', coalesce(input, ''));
$$;

-- array_to_string() is only STABLE in core Postgres (locale-dependent output
-- for some element types in general); safe to mark IMMUTABLE here since we
-- only ever call it on text[] traits, where formatting never varies.
create function public.immutable_text_array_join(input text[], sep text)
returns text
language sql
immutable
parallel safe
as $$
  select array_to_string(input, sep);
$$;

create table games (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table sets (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  code text not null,
  name text not null,
  release_date date,
  image_url text,
  language text not null check (language in ('EN','FR','JP','DE','IT','ES')),
  set_type text not null check (set_type in ('booster','starter_deck','promo','premium','event','special')),
  created_at timestamptz not null default now(),
  unique (game_id, code, language)
);
create index sets_game_id_idx on sets(game_id);

create table cards (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  card_number text not null,
  name text not null,
  character text,
  colors text[] not null default '{}',
  category text not null check (category in ('LEADER','CHARACTER','EVENT','STAGE','OTHER')),
  rarity text not null,
  cost integer,
  power integer,
  counter integer,
  attribute text,
  traits text[] not null default '{}',
  text text,
  is_leader boolean not null default false,
  primary_set_id uuid references sets(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  search_vector tsvector generated always as (
    setweight(public.immutable_simple_tsvector(name), 'A') ||
    setweight(public.immutable_simple_tsvector(character), 'B') ||
    setweight(public.immutable_simple_tsvector(card_number), 'A') ||
    setweight(public.immutable_simple_tsvector(public.immutable_text_array_join(traits, ' ')), 'C') ||
    setweight(public.immutable_simple_tsvector(text), 'D')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, card_number)
);
create index cards_game_id_idx on cards(game_id);
create index cards_name_idx on cards using gin (name gin_trgm_ops);
create index cards_search_vector_idx on cards using gin (search_vector);
create index cards_rarity_idx on cards(rarity);
create index cards_colors_idx on cards using gin (colors);
create index cards_character_idx on cards(character);

create table card_printings (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards(id) on delete cascade,
  set_id uuid not null references sets(id) on delete cascade,
  language text not null check (language in ('EN','FR','JP','DE','IT','ES')),
  illustration_label text,
  is_foil boolean not null default false,
  is_parallel boolean not null default false,
  is_alternate_art boolean not null default false,
  is_promo boolean not null default false,
  collector_number text,
  image_small_url text,
  image_medium_url text,
  image_large_url text,
  created_at timestamptz not null default now(),
  unique (card_id, set_id, language, collector_number)
);
create index card_printings_card_id_idx on card_printings(card_id);
create index card_printings_set_id_idx on card_printings(set_id);

create table products (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  name text not null,
  product_type text not null check (product_type in
    ('booster','display','starter_deck','premium_collection','gift_collection','tournament_pack','promo','magazine','coffret')),
  set_id uuid references sets(id) on delete set null,
  release_date date,
  image_url text,
  created_at timestamptz not null default now(),
  unique (game_id, name)
);
create index products_game_id_idx on products(game_id);

create table card_printing_product_sources (
  id uuid primary key default gen_random_uuid(),
  card_printing_id uuid not null references card_printings(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  unique (card_printing_id, product_id)
);
create index cpps_printing_idx on card_printing_product_sources(card_printing_id);
create index cpps_product_idx on card_printing_product_sources(product_id);

-- RLS: catalog is public read, service-role-only write.
alter table games enable row level security;
alter table sets enable row level security;
alter table cards enable row level security;
alter table card_printings enable row level security;
alter table products enable row level security;
alter table card_printing_product_sources enable row level security;

create policy "games are publicly readable" on games for select using (true);
create policy "sets are publicly readable" on sets for select using (true);
create policy "cards are publicly readable" on cards for select using (true);
create policy "card_printings are publicly readable" on card_printings for select using (true);
create policy "products are publicly readable" on products for select using (true);
create policy "card_printing_product_sources are publicly readable" on card_printing_product_sources for select using (true);
