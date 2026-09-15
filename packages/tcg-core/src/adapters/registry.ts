import type { TCGAdapter } from "./tcg-adapter";
import { onePieceAdapter } from "./one-piece/adapter";

/**
 * Only "one-piece" is registered in the MVP (section 29/49). Adding a game
 * later is: write a PokemonAdapter/MagicAdapter implementing TCGAdapter,
 * register it here, and add its rows to the `games` table — no other code
 * in the app references OnePieceAdapter directly, it always goes through
 * this registry.
 */
const adapters = new Map<string, TCGAdapter>([[onePieceAdapter.gameCode, onePieceAdapter]]);

export function getTCGAdapter(gameCode: string): TCGAdapter {
  const adapter = adapters.get(gameCode);
  if (!adapter) {
    throw new Error(`No TCGAdapter registered for game "${gameCode}"`);
  }
  return adapter;
}

export function listSupportedGameCodes(): string[] {
  return [...adapters.keys()];
}
