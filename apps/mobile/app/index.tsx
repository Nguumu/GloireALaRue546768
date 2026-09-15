import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Votre collection TCG</Text>
      <Text style={styles.subtitle}>
        Recherchez des cartes, suivez votre collection et vos decks One Piece Card Game.
      </Text>
      <Link href="/search" style={styles.link}>
        Rechercher une carte →
      </Link>
      <Link href="/login" style={styles.link}>
        Connexion →
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16, backgroundColor: "#f8fafc" },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#475569" },
  link: { fontSize: 16, fontWeight: "600", color: "#2563eb", marginTop: 8 },
});
