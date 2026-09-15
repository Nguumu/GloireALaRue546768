-- One row per (printing, marketplace, language, condition, day) — a daily
-- snapshot is enough for the price history charts (section 26); we do not
-- store tick-level data.
create table market_prices (
  id uuid primary key default gen_random_uuid(),
  card_printing_id uuid not null references card_printings(id) on delete cascade,
  marketplace text not null,
  language text not null check (language in ('EN','FR','JP','DE','IT','ES')),
  condition text not null check (condition in ('MINT','NEAR_MINT','EXCELLENT','GOOD','PLAYED','POOR')),
  price_minor integer not null check (price_minor >= 0),
  currency text not null check (currency in ('EUR','USD','GBP','JPY')),
  captured_at date not null default current_date,
  unique (card_printing_id, marketplace, language, condition, captured_at)
);
create index market_prices_printing_idx on market_prices(card_printing_id, captured_at desc);

alter table market_prices enable row level security;
create policy "market prices are publicly readable" on market_prices for select using (true);

create table trade_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_printing_id uuid not null references card_printings(id) on delete cascade,
  type text not null check (type in ('SELL','BUY','TRADE')),
  quantity integer not null default 1 check (quantity >= 1),
  condition text not null check (condition in ('MINT','NEAR_MINT','EXCELLENT','GOOD','PLAYED','POOR')),
  language text not null check (language in ('EN','FR','JP','DE','IT','ES')),
  price_minor integer,
  comment text,
  status text not null default 'OPEN' check (status in ('OPEN','CLOSED')),
  created_at timestamptz not null default now()
);
create index trade_listings_printing_idx on trade_listings(card_printing_id);
create index trade_listings_status_idx on trade_listings(status) where status = 'OPEN';

alter table trade_listings enable row level security;
create policy "open listings are publicly readable" on trade_listings
  for select using (status = 'OPEN' or auth.uid() = user_id);
create policy "owner full access" on trade_listings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
