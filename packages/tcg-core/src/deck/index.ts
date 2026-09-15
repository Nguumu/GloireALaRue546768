import { DeckExporterRegistry } from "./deck-exporter";
import { textDeckExporter } from "./formats/text-exporter";

export * from "./deck-exporter";

export const deckExporterRegistry = new DeckExporterRegistry();
deckExporterRegistry.register(textDeckExporter);

// No public, documented API or file format exists for Bandai TCG+ import,
// and no simulator publishes an official spec at time of writing — per
// section 32/33 we do not reverse-engineer either. When one is published,
// implement it as a DeckExporter and register it here; callers already
// iterate `deckExporterRegistry.list()` so the UI picks it up automatically.
