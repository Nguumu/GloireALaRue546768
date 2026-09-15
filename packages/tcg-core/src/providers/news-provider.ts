import type { NewsCategory } from "@tcg/types";

export interface NormalizedNewsItem {
  gameCode: string | null;
  title: string;
  body: string;
  category: NewsCategory;
  isConfirmed: boolean;
  publishedAt: string;
  sourceUrl: string | null;
}

/**
 * Optional aggregator hook (section 40). The MVP ships a manual admin
 * editor for news_posts instead — no implementation is required for
 * launch, but any future feed just needs to satisfy this shape.
 */
export interface NewsProvider {
  readonly sourceName: string;
  fetchLatest(gameCode: string): Promise<NormalizedNewsItem[]>;
}
