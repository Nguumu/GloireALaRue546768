import type { CurrencyCode, ID, Locale, UserRole } from "./common";

export interface Profile {
  id: ID; // == auth.users.id
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  locale: Locale;
  currency: CurrencyCode;
  followedGameIds: ID[];
  role: UserRole;
}
