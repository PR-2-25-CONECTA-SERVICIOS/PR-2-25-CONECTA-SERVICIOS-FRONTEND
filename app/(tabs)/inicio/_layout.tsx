import { Stack } from "expo-router";

export default function InicioLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* si no declaras screens manualmente, Expo los detecta automáticamente */}
    </Stack>
  );
}
