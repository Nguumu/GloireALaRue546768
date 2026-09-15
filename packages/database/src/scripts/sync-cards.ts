import { Pool } from "pg";
import type { CardDataProvider } from "@tcg/tcg-core";

/**
 * Upserts a CardDataProvider's catalog into Postgres (section 51 — cards
 * and sets live locally, the app never calls an external API per page
 * view). Connects directly via DATABASE_URL rather than through
 * supabase-js/PostgREST: bulk admin writes are simpler and faster over a
 * direct connection, and this script never runs in the browser so RLS
 * bypass here is expected, not a leak.
 *
 * Idempotent: safe to re-run. Run with `pnpm db:seed` (see package.json).
 */
export async function syncCards(provider: CardDataProvider, databaseUrl: string): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const games = await provider.fetchGames();
    for (const game of games) {
      await pool.query(
        `insert into games (code, name) values ($1, $2)
         on conflict (code) do update set name = excluded.name`,
        [game.code, game.name],
      );
    }

    for (const game of games) {
      const gameRow = await pool.query<{ id: string }>(`select id from games where code = $1`, [game.code]);
      const gameId = gameRow.rows[0]?.id;
      if (!gameId) continue;

      const sets = await provider.fetchSets(game.code);
      for (const set of sets) {
        await pool.query(
          `insert into sets (game_id, code, name, release_date, image_url, language, set_type)
           values ($1, $2, $3, $4, $5, $6, $7)
           on conflict (game_id, code, language) do update
             set name = excluded.name, release_date = excluded.release_date,
                 image_url = excluded.image_url, set_type = excluded.set_type`,
          [gameId, set.code, set.name, set.releaseDate, set.imageUrl, set.language, set.setType],
        );
      }

      const setIdByCode = new Map<string, string>();
      const setRows = await pool.query<{ id: string; code: string }>(
        `select id, code from sets where game_id = $1`,
        [gameId],
      );
      for (const row of setRows.rows) setIdByCode.set(row.code, row.id);

      const cards = await provider.fetchCards(game.code);
      for (const card of cards) {
        const primarySetId = card.primarySetCode ? setIdByCode.get(card.primarySetCode) ?? null : null;
        await pool.query(
          `insert into cards (game_id, card_number, name, character, colors, category, rarity,
             cost, power, counter, attribute, traits, text, is_leader, primary_set_id, metadata)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
           on conflict (game_id, card_number) do update set
             name = excluded.name, character = excluded.character, colors = excluded.colors,
             category = excluded.category, rarity = excluded.rarity, cost = excluded.cost,
             power = excluded.power, counter = excluded.counter, attribute = excluded.attribute,
             traits = excluded.traits, text = excluded.text, is_leader = excluded.is_leader,
             primary_set_id = excluded.primary_set_id, metadata = excluded.metadata`,
          [
            gameId,
            card.cardNumber,
            card.name,
            card.character,
            card.colors,
            card.category,
            card.rarity,
            card.cost,
            card.power,
            card.counter,
            card.attribute,
            card.traits,
            card.text,
            card.isLeader,
            primarySetId,
            JSON.stringify(card.metadata),
          ],
        );
      }

      const cardIdByNumber = new Map<string, string>();
      const cardRows = await pool.query<{ id: string; card_number: string }>(
        `select id, card_number from cards where game_id = $1`,
        [gameId],
      );
      for (const row of cardRows.rows) cardIdByNumber.set(row.card_number, row.id);

      const printings = await provider.fetchPrintings(game.code);
      for (const printing of printings) {
        const cardId = cardIdByNumber.get(printing.cardNumber);
        const setId = setIdByCode.get(printing.setCode);
        if (!cardId || !setId) continue;
        await pool.query(
          `insert into card_printings (card_id, set_id, language, illustration_label, is_foil,
             is_parallel, is_alternate_art, is_promo, collector_number,
             image_small_url, image_medium_url, image_large_url)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           on conflict (card_id, set_id, language, collector_number) do update set
             illustration_label = excluded.illustration_label, is_foil = excluded.is_foil,
             is_parallel = excluded.is_parallel, is_alternate_art = excluded.is_alternate_art,
             is_promo = excluded.is_promo,
             image_small_url = excluded.image_small_url, image_medium_url = excluded.image_medium_url,
             image_large_url = excluded.image_large_url`,
          [
            cardId,
            setId,
            printing.language,
            printing.illustrationLabel,
            printing.isFoil,
            printing.isParallel,
            printing.isAlternateArt,
            printing.isPromo,
            printing.collectorNumber,
            printing.imageSmallUrl,
            printing.imageMediumUrl,
            printing.imageLargeUrl,
          ],
        );
      }

      const products = await provider.fetchProducts(game.code);
      for (const product of products) {
        const setId = product.setCode ? setIdByCode.get(product.setCode) ?? null : null;
        const productRow = await pool.query<{ id: string }>(
          `insert into products (game_id, name, product_type, set_id, release_date, image_url)
           values ($1,$2,$3,$4,$5,$6)
           on conflict (game_id, name) do update set
             product_type = excluded.product_type, set_id = excluded.set_id,
             release_date = excluded.release_date, image_url = excluded.image_url
           returning id`,
          [gameId, product.name, product.productType, setId, product.releaseDate, product.imageUrl],
        );
        const productId = productRow.rows[0]?.id;
        if (!productId) continue;

        for (const cardNumber of product.cardNumbers) {
          const cardId = cardIdByNumber.get(cardNumber);
          if (!cardId) continue;
          const printingRows = await pool.query<{ id: string }>(
            `select id from card_printings where card_id = $1`,
            [cardId],
          );
          for (const { id: printingId } of printingRows.rows) {
            await pool.query(
              `insert into card_printing_product_sources (card_printing_id, product_id)
               values ($1, $2) on conflict (card_printing_id, product_id) do nothing`,
              [printingId, productId],
            );
          }
        }
      }
    }
  } finally {
    await pool.end();
  }
}
