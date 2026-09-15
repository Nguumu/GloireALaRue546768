import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2563eb" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="index" options={{ title: "TCG Collection" }} />
      <Stack.Screen name="login" options={{ title: "Connexion" }} />
      <Stack.Screen name="search" options={{ title: "Recherche" }} />
    </Stack>
  );
}
