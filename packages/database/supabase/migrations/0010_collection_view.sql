-- Flattens collection_entries + their printing/card/set/location into plain
-- top-level columns, so the app can filter/sort/paginate (extension,
-- character, rarity, color, quantity, recently added — section 12) with
-- native PostgREST query params instead of nested embeds, which neither
-- order reliably across two join levels nor type well against a
-- hand-written Database type (see database.types.ts header).
--
-- `security_invoker = true` is required (Postgres 15+): without it the view
-- would run as its owner and bypass every RLS policy below it, leaking
-- every user's collection. With it, collection_entries' own
-- "auth.uid() = user_id" policy still applies to whoever queries the view.
create view collection_entries_detailed
with (security_invoker = true)
as
select
  ce.id,
  ce.user_id,
  ce.card_printing_id,
  ce.quantity,
  ce.keep_quantity,
  (ce.quantity - ce.keep_quantity) as surplus,
  ce.condition,
  ce.purchase_price_minor,
  ce.purchase_date,
  ce.storage_location_id,
  ce.note,
  ce.available_for_trade,
  ce.created_at,
  ce.updated_at,
  cp.card_id,
  cp.set_id,
  cp.language as printing_language,
  cp.illustration_label,
  cp.is_foil,
  cp.is_parallel,
  cp.is_alternate_art,
  cp.is_promo,
  cp.collector_number,
  cp.image_small_url,
  cp.image_medium_url,
  cp.image_large_url,
  c.game_id,
  c.card_number,
  c.name as card_name,
  c.character,
  c.colors,
  c.category,
  c.rarity,
  c.cost,
  c.power,
  c.counter,
  c.attribute,
  c.traits,
  c.text as card_text,
  c.is_leader,
  s.code as set_code,
  s.name as set_name,
  sl.name as storage_location_name
from collection_entries ce
join card_printings cp on cp.id = ce.card_printing_id
join cards c on c.id = cp.card_id
join sets s on s.id = cp.set_id
left join storage_locations sl on sl.id = ce.storage_location_id;

-- Explicit grant: Supabase's own project bootstrap grants SELECT on new
-- public tables to `authenticated` via ALTER DEFAULT PRIVILEGES, and this
-- covers views too — but making it explicit here means this migration
-- doesn't silently depend on that default surviving unchanged.
grant select on collection_entries_detailed to authenticated;

-- Dashboard aggregate (section 28). No user-id parameter on purpose: it
-- always reads auth.uid(), so there is no argument to misuse to read
-- someone else's stats — and being `security invoker`, a mismatched id
-- would just see zero rows under RLS anyway, but this removes even that
-- question. One round trip instead of pulling every row client-side to sum.
create function public.get_my_collection_stats()
returns table (
  total_cards bigint,
  unique_printings bigint,
  total_purchase_price_minor bigint,
  doubles_count bigint,
  graded_cards_count bigint,
  sealed_products_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(sum(ce.quantity), 0)::bigint,
    count(*)::bigint,
    sum(ce.purchase_price_minor)::bigint,
    coalesce(sum(case when ce.quantity > ce.keep_quantity then 1 else 0 end), 0)::bigint,
    (select count(*) from graded_cards where user_id = auth.uid())::bigint,
    (select coalesce(sum(quantity), 0) from sealed_product_entries where user_id = auth.uid())::bigint
  from collection_entries ce
  where ce.user_id = auth.uid();
$$;

grant execute on function public.get_my_collection_stats() to authenticated;
