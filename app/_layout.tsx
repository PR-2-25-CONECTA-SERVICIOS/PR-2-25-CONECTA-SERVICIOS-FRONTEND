// app/_layout.tsx
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export const unstable_settings = { anchor: '(tabs)' };

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
    <SafeAreaProvider>
      {/* Respetamos el safe area en top/left/right (bottom lo maneja el TabBar) */}
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'left', 'right']}>
        <ThemeProvider value={theme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>

          {/* No translucente para que la app no se “meta” bajo la status bar */}
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} translucent={false} />
        </ThemeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
