-- Per-user collection data. Every table here is owner-only via RLS: a user
-- can never read or write another user's rows (section 46).

create table storage_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  parent_id uuid references storage_locations(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index storage_locations_user_id_idx on storage_locations(user_id);

create table collection_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_printing_id uuid not null references card_printings(id) on delete cascade,
  quantity integer not null default 1 check (quantity >= 0),
  keep_quantity integer not null default 1 check (keep_quantity >= 0),
  condition text not null default 'NEAR_MINT'
    check (condition in ('MINT','NEAR_MINT','EXCELLENT','GOOD','PLAYED','POOR')),
  purchase_price_minor integer,
  purchase_date date,
  storage_location_id uuid references storage_locations(id) on delete set null,
  note text,
  available_for_trade boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, card_printing_id, condition)
);
create index collection_entries_user_id_idx on collection_entries(user_id);
create index collection_entries_printing_id_idx on collection_entries(card_printing_id);
create index collection_entries_trade_idx on collection_entries(available_for_trade) where available_for_trade;

create table grading_companies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null
);
alter table grading_companies enable row level security;
create policy "grading companies are publicly readable" on grading_companies for select using (true);
insert into grading_companies (code, name) values
  ('PSA', 'Professional Sports Authenticator'),
  ('BGS', 'Beckett Grading Services'),
  ('CGC', 'Certified Guaranty Company'),
  ('PCA', 'Pristine Card Authority');

create table graded_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_printing_id uuid not null references card_printings(id) on delete cascade,
  grading_company_id uuid not null references grading_companies(id),
  grade text not null,
  certification_number text,
  purchase_price_minor integer,
  estimated_value_minor integer,
  graded_date date,
  created_at timestamptz not null default now()
);
create index graded_cards_user_id_idx on graded_cards(user_id);

create table sealed_product_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity >= 0),
  language text not null check (language in ('EN','FR','JP','DE','IT','ES')),
  condition text not null default 'MINT'
    check (condition in ('MINT','NEAR_MINT','EXCELLENT','GOOD','PLAYED','POOR')),
  purchase_price_minor integer,
  current_price_minor integer,
  purchase_date date,
  note text,
  created_at timestamptz not null default now()
);
create index sealed_product_entries_user_id_idx on sealed_product_entries(user_id);

alter table storage_locations enable row level security;
alter table collection_entries enable row level security;
alter table graded_cards enable row level security;
alter table sealed_product_entries enable row level security;

create policy "owner full access" on storage_locations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner full access" on collection_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner full access" on graded_cards for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner full access" on sealed_product_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
