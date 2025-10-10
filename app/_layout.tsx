import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

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
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>

      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
