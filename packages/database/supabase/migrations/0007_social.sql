create table conversations (
  id uuid primary key default gen_random_uuid(),
  participant_one uuid not null references auth.users(id) on delete cascade,
  participant_two uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (participant_one <> participant_two),
  unique (participant_one, participant_two)
);
create index conversations_participant_one_idx on conversations(participant_one);
create index conversations_participant_two_idx on conversations(participant_two);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index chat_messages_conversation_idx on chat_messages(conversation_id, created_at);

create table blocked_users (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table news_posts (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete set null,
  author_id uuid not null references auth.users(id),
  title text not null,
  body text not null,
  category text not null check (category in
    ('official_announcement','new_set','product','promo','tournament','rumor')),
  is_confirmed boolean not null default true,
  published_at timestamptz not null default now()
);
create index news_posts_published_idx on news_posts(published_at desc);
create index news_posts_game_idx on news_posts(game_id);

alter table conversations enable row level security;
alter table chat_messages enable row level security;
alter table blocked_users enable row level security;
alter table news_posts enable row level security;

create policy "participants can read their conversation" on conversations
  for select using (auth.uid() in (participant_one, participant_two));
create policy "participants can start a conversation" on conversations
  for insert with check (auth.uid() in (participant_one, participant_two));

create policy "participants can read messages" on chat_messages
  for select using (exists (
    select 1 from conversations c
    where c.id = conversation_id and auth.uid() in (c.participant_one, c.participant_two)
  ));
create policy "participants can send messages" on chat_messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = conversation_id and auth.uid() in (c.participant_one, c.participant_two)
    )
  );
create policy "sender can mark own message read state" on chat_messages
  for update using (exists (
    select 1 from conversations c
    where c.id = conversation_id and auth.uid() in (c.participant_one, c.participant_two)
  ));

create policy "owner manages own blocks" on blocked_users for all
  using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

create policy "news is publicly readable" on news_posts for select using (true);
