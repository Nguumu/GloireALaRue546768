create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cards_set_updated_at before update on cards
  for each row execute procedure public.set_updated_at();
create trigger collection_entries_set_updated_at before update on collection_entries
  for each row execute procedure public.set_updated_at();
create trigger decks_set_updated_at before update on decks
  for each row execute procedure public.set_updated_at();
create trigger deck_guides_set_updated_at before update on deck_guides
  for each row execute procedure public.set_updated_at();
