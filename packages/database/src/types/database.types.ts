/**
 * Hand-written Supabase `Database` type mirroring the SQL migrations under
 * supabase/migrations. Regenerate against a real project once one exists:
 *   supabase gen types typescript --project-id <ref> > src/types/database.types.ts
 * (this repo's sandbox has no Docker daemon, so `supabase gen types` against
 * a local db isn't available here — this file was written by hand from the
 * migrations and kept in sync manually until then.)
 *
 * Relationships are intentionally left as `[]` on every table: supabase-js
 * 2.116's type-level select parser resolves `.select('*, foo(...)')` embeds
 * by walking every table's Relationships entries as part of constructing
 * `SupabaseClient<Database>` itself, so one malformed hand-written entry
 * degrades every query in the file to `never`, not just the embed using it
 * (verified empirically — see git history for the repro). A real embed
 * (searchCards' `sets(...)`, getProductsForPrintings' `products(...)`) is
 * cast through `unknown` at the call site instead; the runtime shape is
 * correct, only its static type is a `SelectQueryError` placeholder.
 * `supabase gen types` fills Relationships in correctly — safe to adopt once
 * available.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

interface Table<Row, Insert, Update = Partial<Insert>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      games: Table<
        { id: string; code: string; name: string; is_active: boolean; created_at: string },
        { id?: string; code: string; name: string; is_active?: boolean; created_at?: string }
      >;
      sets: Table<
        {
          id: string;
          game_id: string;
          code: string;
          name: string;
          release_date: string | null;
          image_url: string | null;
          language: string;
          set_type: string;
          created_at: string;
        },
        {
          id?: string;
          game_id: string;
          code: string;
          name: string;
          release_date?: string | null;
          image_url?: string | null;
          language: string;
          set_type: string;
          created_at?: string;
        }
      >;
      cards: Table<
        {
          id: string;
          game_id: string;
          card_number: string;
          name: string;
          character: string | null;
          colors: string[];
          category: string;
          rarity: string;
          cost: number | null;
          power: number | null;
          counter: number | null;
          attribute: string | null;
          traits: string[];
          text: string | null;
          is_leader: boolean;
          primary_set_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          game_id: string;
          card_number: string;
          name: string;
          character?: string | null;
          colors?: string[];
          category: string;
          rarity: string;
          cost?: number | null;
          power?: number | null;
          counter?: number | null;
          attribute?: string | null;
          traits?: string[];
          text?: string | null;
          is_leader?: boolean;
          primary_set_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      card_printings: Table<
        {
          id: string;
          card_id: string;
          set_id: string;
          language: string;
          illustration_label: string | null;
          is_foil: boolean;
          is_parallel: boolean;
          is_alternate_art: boolean;
          is_promo: boolean;
          collector_number: string | null;
          image_small_url: string | null;
          image_medium_url: string | null;
          image_large_url: string | null;
          created_at: string;
        },
        {
          id?: string;
          card_id: string;
          set_id: string;
          language: string;
          illustration_label?: string | null;
          is_foil?: boolean;
          is_parallel?: boolean;
          is_alternate_art?: boolean;
          is_promo?: boolean;
          collector_number?: string | null;
          image_small_url?: string | null;
          image_medium_url?: string | null;
          image_large_url?: string | null;
          created_at?: string;
        }
      >;
      products: Table<
        {
          id: string;
          game_id: string;
          name: string;
          product_type: string;
          set_id: string | null;
          release_date: string | null;
          image_url: string | null;
          created_at: string;
        },
        {
          id?: string;
          game_id: string;
          name: string;
          product_type: string;
          set_id?: string | null;
          release_date?: string | null;
          image_url?: string | null;
          created_at?: string;
        }
      >;
      card_printing_product_sources: Table<
        { id: string; card_printing_id: string; product_id: string },
        { id?: string; card_printing_id: string; product_id: string }
      >;
      profiles: Table<
        {
          id: string;
          username: string;
          avatar_url: string | null;
          locale: string;
          currency: string;
          followed_game_ids: string[];
          role: string;
          created_at: string;
        },
        {
          id: string;
          username: string;
          avatar_url?: string | null;
          locale?: string;
          currency?: string;
          followed_game_ids?: string[];
          role?: string;
          created_at?: string;
        }
      >;
      storage_locations: Table<
        { id: string; user_id: string; name: string; parent_id: string | null; created_at: string },
        { id?: string; user_id: string; name: string; parent_id?: string | null; created_at?: string }
      >;
      collection_entries: Table<
        {
          id: string;
          user_id: string;
          card_printing_id: string;
          quantity: number;
          keep_quantity: number;
          condition: string;
          purchase_price_minor: number | null;
          purchase_date: string | null;
          storage_location_id: string | null;
          note: string | null;
          available_for_trade: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          card_printing_id: string;
          quantity?: number;
          keep_quantity?: number;
          condition?: string;
          purchase_price_minor?: number | null;
          purchase_date?: string | null;
          storage_location_id?: string | null;
          note?: string | null;
          available_for_trade?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      grading_companies: Table<
        { id: string; code: string; name: string },
        { id?: string; code: string; name: string }
      >;
      graded_cards: Table<
        {
          id: string;
          user_id: string;
          card_printing_id: string;
          grading_company_id: string;
          grade: string;
          certification_number: string | null;
          purchase_price_minor: number | null;
          estimated_value_minor: number | null;
          graded_date: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          card_printing_id: string;
          grading_company_id: string;
          grade: string;
          certification_number?: string | null;
          purchase_price_minor?: number | null;
          estimated_value_minor?: number | null;
          graded_date?: string | null;
          created_at?: string;
        }
      >;
      sealed_product_entries: Table<
        {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          language: string;
          condition: string;
          purchase_price_minor: number | null;
          current_price_minor: number | null;
          purchase_date: string | null;
          note: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          language: string;
          condition?: string;
          purchase_price_minor?: number | null;
          current_price_minor?: number | null;
          purchase_date?: string | null;
          note?: string | null;
          created_at?: string;
        }
      >;
      collection_lists: Table<
        { id: string; user_id: string; name: string; description: string | null; created_at: string },
        { id?: string; user_id: string; name: string; description?: string | null; created_at?: string }
      >;
      collection_list_items: Table<
        { id: string; list_id: string; card_id: string; target_quantity: number; note: string | null },
        { id?: string; list_id: string; card_id: string; target_quantity?: number; note?: string | null }
      >;
      wishlist_items: Table<
        {
          id: string;
          user_id: string;
          card_printing_id: string;
          quantity: number;
          condition_min: string;
          price_max_minor: number | null;
          note: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          card_printing_id: string;
          quantity?: number;
          condition_min?: string;
          price_max_minor?: number | null;
          note?: string | null;
          created_at?: string;
        }
      >;
      price_alerts: Table<
        {
          id: string;
          user_id: string;
          card_printing_id: string;
          condition: string;
          target_price_minor: number;
          active: boolean;
          last_triggered_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          card_printing_id: string;
          condition?: string;
          target_price_minor: number;
          active?: boolean;
          last_triggered_at?: string | null;
          created_at?: string;
        }
      >;
      market_prices: Table<
        {
          id: string;
          card_printing_id: string;
          marketplace: string;
          language: string;
          condition: string;
          price_minor: number;
          currency: string;
          captured_at: string;
        },
        {
          id?: string;
          card_printing_id: string;
          marketplace: string;
          language: string;
          condition: string;
          price_minor: number;
          currency: string;
          captured_at?: string;
        }
      >;
      trade_listings: Table<
        {
          id: string;
          user_id: string;
          card_printing_id: string;
          type: string;
          quantity: number;
          condition: string;
          language: string;
          price_minor: number | null;
          comment: string | null;
          status: string;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          card_printing_id: string;
          type: string;
          quantity?: number;
          condition: string;
          language: string;
          price_minor?: number | null;
          comment?: string | null;
          status?: string;
          created_at?: string;
        }
      >;
      decks: Table<
        {
          id: string;
          user_id: string;
          game_id: string;
          leader_card_id: string | null;
          name: string;
          description: string | null;
          format: string | null;
          is_public: boolean;
          tags: string[];
          like_count: number;
          view_count: number;
          tournament_result: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          game_id: string;
          leader_card_id?: string | null;
          name: string;
          description?: string | null;
          format?: string | null;
          is_public?: boolean;
          tags?: string[];
          like_count?: number;
          view_count?: number;
          tournament_result?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      deck_cards: Table<
        { id: string; deck_id: string; card_id: string; quantity: number },
        { id?: string; deck_id: string; card_id: string; quantity?: number }
      >;
      deck_guides: Table<
        { deck_id: string; content_markdown: string; updated_at: string },
        { deck_id: string; content_markdown?: string; updated_at?: string }
      >;
      conversations: Table<
        { id: string; participant_one: string; participant_two: string; created_at: string },
        { id?: string; participant_one: string; participant_two: string; created_at?: string }
      >;
      chat_messages: Table<
        {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        }
      >;
      blocked_users: Table<
        { blocker_id: string; blocked_id: string; created_at: string },
        { blocker_id: string; blocked_id: string; created_at?: string }
      >;
      news_posts: Table<
        {
          id: string;
          game_id: string | null;
          author_id: string;
          title: string;
          body: string;
          category: string;
          is_confirmed: boolean;
          published_at: string;
        },
        {
          id?: string;
          game_id?: string | null;
          author_id: string;
          title: string;
          body: string;
          category: string;
          is_confirmed?: boolean;
          published_at?: string;
        }
      >;
      feature_flags: Table<
        { key: string; enabled: boolean; description: string | null; updated_at: string },
        { key: string; enabled?: boolean; description?: string | null; updated_at?: string }
      >;
    };
    // `{ [_ in never]: never }` (not `Record<string, never>`) — an index
    // signature here intersects into every Tables row and collapses all of
    // them to `never`, which is exactly the generated-types convention this
    // avoids.
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
