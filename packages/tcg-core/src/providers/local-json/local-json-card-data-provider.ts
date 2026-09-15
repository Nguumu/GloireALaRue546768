import type {
  CardDataProvider,
  NormalizedCard,
  NormalizedCardPrinting,
  NormalizedGame,
  NormalizedProduct,
  NormalizedSet,
} from "../card-data-provider";
import fixtureData from "./one-piece-op01.json";

interface FixtureFile {
  game: NormalizedGame;
  sets: NormalizedSet[];
  cards: NormalizedCard[];
  printings: NormalizedCardPrinting[];
  products: NormalizedProduct[];
}

const fixture = fixtureData as unknown as FixtureFile;

/**
 * Illustrative MVP data source: a small hand-curated OP01 sample bundled as
 * JSON, used to seed the local database (see sync-cards.ts) without a paid
 * external API. Swap this for a real CardDataProvider implementation
 * (licensed API, official CSV export, etc.) once one is available — nothing
 * else in the app depends on this class directly, only on the interface.
 */
export class LocalJsonCardDataProvider implements CardDataProvider {
  readonly sourceName = "local-json-fixture";

  async fetchGames(): Promise<NormalizedGame[]> {
    return [fixture.game];
  }

  async fetchSets(gameCode: string): Promise<NormalizedSet[]> {
    return fixture.sets.filter((s) => s.gameCode === gameCode);
  }

  async fetchCards(gameCode: string, setCode?: string): Promise<NormalizedCard[]> {
    return fixture.cards.filter(
      (c) => c.gameCode === gameCode && (!setCode || c.primarySetCode === setCode),
    );
  }

  async fetchPrintings(_gameCode: string, setCode?: string): Promise<NormalizedCardPrinting[]> {
    return fixture.printings.filter((p) => !setCode || p.setCode === setCode);
  }

  async fetchProducts(gameCode: string): Promise<NormalizedProduct[]> {
    return fixture.products.filter((p) => p.gameCode === gameCode);
  }
}
