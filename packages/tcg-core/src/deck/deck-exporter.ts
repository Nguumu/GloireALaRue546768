import type { DeckList } from "../adapters/tcg-adapter";

/**
 * A named decklist serialization format (section 33/34). Register one per
 * output target: our own copy/paste format, and — once a game publishes a
 * public, documented format/API for it — a specific simulator or TCG+.
 * We never reverse-engineer or bypass a private format (section 32).
 */
export interface DeckExporter {
  readonly format: string;
  readonly label: string;
  export(deck: DeckList): string;
}

export class DeckExporterRegistry {
  private readonly exporters = new Map<string, DeckExporter>();

  register(exporter: DeckExporter): void {
    this.exporters.set(exporter.format, exporter);
  }

  get(format: string): DeckExporter | undefined {
    return this.exporters.get(format);
  }

  list(): DeckExporter[] {
    return [...this.exporters.values()];
  }
}
