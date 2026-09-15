import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { searchCards } from "@tcg/database";
import type { CardWithPrimaryPrinting } from "@tcg/types";
import { supabase } from "@/lib/supabase";

const GAME_CODE = "one-piece"; // Only game wired for the MVP (section 1).

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardWithPrimaryPrinting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchCards(supabase, { gameCode: GAME_CODE, q: query, page: 1, pageSize: 24 });
        setCards(result.items);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Rechercher une carte…"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Aucune carte trouvée.</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cardNumber}>{item.cardNumber}</Text>
            <Text style={styles.cardName}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  cardNumber: { color: "#64748b", width: 90 },
  cardName: { fontWeight: "600", color: "#0f172a", flexShrink: 1 },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 24 },
});
