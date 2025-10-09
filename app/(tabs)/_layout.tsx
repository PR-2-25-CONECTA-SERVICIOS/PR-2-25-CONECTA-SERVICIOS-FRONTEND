import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false, // Desactivamos el header por ahora
        tabBarButton: HapticTab, // Añadimos la funcionalidad de haptic feedback
      }}>
      
      {/* Pantalla Home */}
      <Tabs.Screen
        name="index" // Asegúrate de que esta pantalla esté en la carpeta 'app/tabs/'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      {/* Pantalla Explore */}
      <Tabs.Screen
        name="explore" // Asegúrate de que esta pantalla esté en la carpeta 'app/tabs/'
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      
      {/* Agrega más pantallas aquí */}
      <Tabs.Screen
        name="history" // Similar a las anteriores
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      
      {/* Otras pantallas */}
      <Tabs.Screen
        name="profile" // Asegúrate de que esta pantalla esté en la carpeta 'app/tabs/'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
