create table collection_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);
create index collection_lists_user_id_idx on collection_lists(user_id);

create table collection_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references collection_lists(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  target_quantity integer not null default 1 check (target_quantity >= 0),
  note text,
  unique (list_id, card_id)
);
create index collection_list_items_list_id_idx on collection_list_items(list_id);

create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_printing_id uuid not null references card_printings(id) on delete cascade,
  quantity integer not null default 1 check (quantity >= 1),
  condition_min text not null default 'GOOD'
    check (condition_min in ('MINT','NEAR_MINT','EXCELLENT','GOOD','PLAYED','POOR')),
  price_max_minor integer,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, card_printing_id)
);
create index wishlist_items_user_id_idx on wishlist_items(user_id);

create table price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_printing_id uuid not null references card_printings(id) on delete cascade,
  condition text not null default 'NEAR_MINT'
    check (condition in ('MINT','NEAR_MINT','EXCELLENT','GOOD','PLAYED','POOR')),
  target_price_minor integer not null check (target_price_minor >= 0),
  active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now()
);
create index price_alerts_user_id_idx on price_alerts(user_id);
create index price_alerts_active_idx on price_alerts(active) where active;

alter table collection_lists enable row level security;
alter table collection_list_items enable row level security;
alter table wishlist_items enable row level security;
alter table price_alerts enable row level security;

create policy "owner full access" on collection_lists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner full access via list" on collection_list_items for all
  using (exists (select 1 from collection_lists l where l.id = list_id and l.user_id = auth.uid()))
  with check (exists (select 1 from collection_lists l where l.id = list_id and l.user_id = auth.uid()));
create policy "owner full access" on wishlist_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner full access" on price_alerts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
