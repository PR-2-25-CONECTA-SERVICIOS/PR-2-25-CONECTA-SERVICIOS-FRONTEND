// app/(tabs)/_layout.tsx
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = (colorScheme ?? 'light') === 'dark';
  const tint = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: isDark ? '#98a2b3' : '#64748b',
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,

        // Barra RELATIVE: no tapa contenido, no “tarjeta” de fondo
        tabBarStyle: {
          position: 'relative',
          height: 56,
          paddingTop: 6,
          paddingBottom: 6,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          marginHorizontal: 0,
          marginBottom: 0,
          borderRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          lineHeight: 14,
          includeFontPadding: false as any,
        },
        tabBarItemStyle: {
          minWidth: 86,
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size ?? 24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="LocalesScreen"
        options={{
          title: 'Locales',
          // 👇 Ionicons no tiene storefront: usamos MaterialCommunityIcons
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="storefront-outline" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile-stack"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size ?? 24} color={color} />,
        }}
      />

      {/* Ocultas del TabBar */}
      {[
        'AdminScreen',
        'BusinessScreen',
        'CreateProfileScreen',
        'EditProfileScreen',
        'LoginScreen',
        'ProfileViewScreen',
        'RatingScreen',
        'RegisterScreen',
        'ServiceDetail',
        'ServiceProviderScreen',
        'SplashScreen',
      ].map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
