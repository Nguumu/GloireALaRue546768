import { LocalJsonCardDataProvider } from "@tcg/tcg-core";
import { syncCards } from "./sync-cards";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required, e.g. postgresql://postgres:postgres@127.0.0.1:5432/tcg_dev");
  process.exit(1);
}

await syncCards(new LocalJsonCardDataProvider(), databaseUrl);
console.log("Seed complete: One Piece / OP01 fixture catalog synced.");
