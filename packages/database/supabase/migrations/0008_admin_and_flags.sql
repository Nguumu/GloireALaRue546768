-- Admin write access to the catalog (section 41) and a minimal feature-flag
-- table (section 53) — a config row per flag, no external SaaS needed.

create function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('ADMIN','MODERATOR')
  );
$$;

create policy "admins can manage games" on games for all using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage sets" on sets for all using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage cards" on cards for all using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage card_printings" on card_printings for all using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage products" on products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage card_printing_product_sources" on card_printing_product_sources for all using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage grading_companies" on grading_companies for all using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage news" on news_posts for all using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage market_prices" on market_prices for all using (public.is_admin()) with check (public.is_admin());

create policy "admins can moderate trade_listings" on trade_listings for update using (public.is_admin());
create policy "admins can moderate decks" on decks for update using (public.is_admin());

create table feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);
alter table feature_flags enable row level security;
create policy "feature flags are publicly readable" on feature_flags for select using (true);
create policy "admins can manage feature flags" on feature_flags for all
  using (public.is_admin()) with check (public.is_admin());

insert into feature_flags (key, enabled, description) values
  ('ENABLE_BINDER_SCAN', false, 'Experimental full binder-page scan & card segmentation'),
  ('ENABLE_AUTO_DECK_BUILDER', false, 'Rule-based deck suggestions from the user''s collection'),
  ('ENABLE_MARKETPLACE', false, 'Community sell/buy/trade listings (no payments)'),
  ('ENABLE_CHAT', false, 'Private messaging between users');
