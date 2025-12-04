// app/_layout.tsx
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";

const Dark = { ...DarkTheme, colors:{...DarkTheme.colors,background:"#0b0d11"} };
const Light = { ...DefaultTheme, colors:{...DefaultTheme.colors,background:"#ffffff"} };

// --------------------------
export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate/>
    </AuthProvider>
  );
}
// --------------------------

function AuthGate() {
  const { user, loading } = useAuth();   // ← lee sesión
  const scheme = useColorScheme();
  const theme = scheme==="dark" ? Dark : Light;

  const [splash, setSplash] = useState(true);

  useEffect(() => {
    if (loading) return;       // espera SecureStore

    setTimeout(() => setSplash(false), 2000); //Tiempo de splash
  }, [loading]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex:1,backgroundColor:theme.colors.background }}>
        <ThemeProvider value={theme}>

          <Stack screenOptions={{ headerShown:false }}>

            {splash && <Stack.Screen name="Splash" />}          {/* muestra splash primero */}

            {!splash && user && <Stack.Screen name="(tabs)" />} {/* si loggeado → home */}

            {!splash && !user && (
              <Stack.Screen name="Login/LoginScreen" />         
            )}

          </Stack>

          <StatusBar style={scheme==="dark"?"light":"dark"}/>
        </ThemeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
