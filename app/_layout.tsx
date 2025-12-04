// app/_layout.tsx
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from "../context/AuthContext";

const Dark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0b0d11',
    card: '#0f1115',
    text: '#e5e7eb',
    border: 'transparent',
  },
};

const Light = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    border: 'transparent',
  },
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? Dark : Light;

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <ThemeProvider value={theme}>

            <Stack screenOptions={{ headerShown: false }}>
              {/* Splash arranca primero */}
              <Stack.Screen name="Splash" />

              {/* Pantallas principales */}
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="inicio/LoginScreen" />
            </Stack>

            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} translucent />
          </ThemeProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
