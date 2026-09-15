import { exportOnePieceDeckList } from "../../adapters/one-piece/decklist-format";
import type { DeckExporter } from "../deck-exporter";

/** Our own copy/paste format — see parseOnePieceDeckList for the matching reader. */
export const textDeckExporter: DeckExporter = {
  format: "text",
  label: "Texte (copier/coller)",
  export: exportOnePieceDeckList,
};
