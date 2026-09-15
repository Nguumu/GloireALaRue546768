import type { ID } from "./common";

export type NewsCategory =
  | "official_announcement"
  | "new_set"
  | "product"
  | "promo"
  | "tournament"
  | "rumor";

export interface NewsPost {
  id: ID;
  gameId: ID | null;
  authorId: ID;
  title: string;
  body: string;
  category: NewsCategory;
  /** True only for `rumor`-adjacent categories flagged as unconfirmed; UI must always badge this distinctly from OFFICIEL. */
  isConfirmed: boolean;
  publishedAt: string;
}
