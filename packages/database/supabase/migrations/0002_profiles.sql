-- One profile row per auth.users row, auto-created on sign up.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_url text,
  locale text not null default 'fr' check (locale in ('fr','en')),
  currency text not null default 'EUR' check (currency in ('EUR','USD','GBP','JPY')),
  followed_game_ids uuid[] not null default '{}',
  role text not null default 'USER' check (role in ('USER','MODERATOR','ADMIN')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are publicly readable" on profiles for select using (true);
create policy "users can update their own profile" on profiles for update using (auth.uid() = id);

-- Auto-provision a profile (with a generated username) whenever a new auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
