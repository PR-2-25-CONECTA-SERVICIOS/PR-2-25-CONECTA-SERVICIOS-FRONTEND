// app/_layout.tsx
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from "../context/AuthContext";

const Dark = { ...DarkTheme, colors:{...DarkTheme.colors,background:'#0b0d11'} };
const Light = { ...DefaultTheme, colors:{...DefaultTheme.colors,background:'#ffffff'} };

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate/>
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? Dark : Light;

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      setShowSplash(false);

      if (user) router.replace("/(tabs)");
      else router.replace("/Login/LoginScreen");

    }, 2500);

    return () => clearTimeout(timer);
  }, [loading, user]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex:1, backgroundColor:theme.colors.background }}>
        <ThemeProvider value={theme}>
          <Stack screenOptions={{ headerShown:false }}>
            {showSplash && <Stack.Screen name="Splash" />}
            {/* Las demás rutas ya no se cargan hasta que splash termine */}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="Login/LoginScreen"/>
            <Stack.Screen name="Login/RegisterScreen"/>
          </Stack>
          <StatusBar style={scheme==="dark"?"light":"dark"}/>
        </ThemeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
