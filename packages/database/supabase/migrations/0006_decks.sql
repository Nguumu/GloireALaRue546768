create table decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references games(id) on delete cascade,
  leader_card_id uuid references cards(id) on delete set null,
  name text not null,
  description text,
  format text,
  is_public boolean not null default false,
  tags text[] not null default '{}',
  like_count integer not null default 0,
  view_count integer not null default 0,
  tournament_result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index decks_user_id_idx on decks(user_id);
create index decks_public_idx on decks(is_public) where is_public;
create index decks_leader_idx on decks(leader_card_id);

create table deck_cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references decks(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  quantity integer not null default 1 check (quantity >= 1),
  unique (deck_id, card_id)
);
create index deck_cards_deck_id_idx on deck_cards(deck_id);
create index deck_cards_card_id_idx on deck_cards(card_id);

create table deck_guides (
  deck_id uuid primary key references decks(id) on delete cascade,
  content_markdown text not null default '',
  updated_at timestamptz not null default now()
);

alter table decks enable row level security;
alter table deck_cards enable row level security;
alter table deck_guides enable row level security;

create policy "public decks are readable by anyone, private by owner" on decks
  for select using (is_public or auth.uid() = user_id);
create policy "owner can insert decks" on decks for insert with check (auth.uid() = user_id);
create policy "owner can update decks" on decks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner can delete decks" on decks for delete using (auth.uid() = user_id);

create policy "deck cards follow deck visibility" on deck_cards
  for select using (exists (select 1 from decks d where d.id = deck_id and (d.is_public or d.user_id = auth.uid())));
create policy "owner manages deck cards" on deck_cards for all
  using (exists (select 1 from decks d where d.id = deck_id and d.user_id = auth.uid()))
  with check (exists (select 1 from decks d where d.id = deck_id and d.user_id = auth.uid()));

create policy "deck guide follows deck visibility" on deck_guides
  for select using (exists (select 1 from decks d where d.id = deck_id and (d.is_public or d.user_id = auth.uid())));
create policy "owner manages deck guide" on deck_guides for all
  using (exists (select 1 from decks d where d.id = deck_id and d.user_id = auth.uid()))
  with check (exists (select 1 from decks d where d.id = deck_id and d.user_id = auth.uid()));
