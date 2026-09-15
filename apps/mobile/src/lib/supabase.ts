import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@tcg/database";

/**
 * The web app uses @supabase/ssr (cookie-based sessions); React Native has
 * no cookies, so the session is persisted in AsyncStorage instead. Every
 * query builder call after this (searchCards, getCardDetail, ...) is the
 * exact same @tcg/database code the web app uses — only this client
 * bootstrap differs per platform.
 */
export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
