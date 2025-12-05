// app/(tabs)/_layout.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { loadUserSession } from "@/utils/secureStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { useEffect, useState } from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = (colorScheme ?? "light") === "dark";
  const tint = Colors[colorScheme ?? "light"].tint;

  const pathname = usePathname();
  const [role, setRole] = useState<string>("usuario");

  // Recargar el rol al cambiar de ruta
  useEffect(() => {
    const load = async () => {
      const session = await loadUserSession();
      console.log("SESSION EN LAYOUT:", session);
      setRole(session?.rol || "usuario");
    };
    load();
  }, [pathname]);

  const isAdmin = role === "admin";

  // Rutas donde no debe aparecer la TabBar
  const HIDE_SET = new Set([

    "/inicio/LoginScreen",
    "/inicio/RegisterScreen",
    "/inicio/SplashScreen",
  ]);

  const hideTabs = HIDE_SET.has(pathname) || pathname.startsWith("/Login");

  const baseTabBarStyle = {
    position: "relative" as const,
    height: 56,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 0,
  };

  // -------------------------
  // 🚫 RUTAS OCULTAS DINÁMICAS
  // -------------------------
  const HIDDEN_ROUTES = [
    "BusinessScreen",
    "CreateProfileScreen",
    "EditProfileScreen",
    "ProfileViewScreen",
    "RatingScreen",
    "ServiceDetail",
    "ServiceProviderScreen",
    "map",
    "explore",
    "Splash",
    "map-add",
    "profile-stack",
    "inicio",

    // LOGIN

        "inicio/LoginScreen",
    "inicio/RegisterScreen",
    "inicio/SplashScreen",
  ];

  // 👉 si NO ES admin, ocultamos también AdminScreen
  if (!isAdmin) HIDDEN_ROUTES.push("AdminScreen");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: isDark ? "#98a2b3" : "#64748b",
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: hideTabs ? { display: "none" } : baseTabBarStyle,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          lineHeight: 14,
          includeFontPadding: false as any,
        },
        tabBarItemStyle: { minWidth: 86, paddingVertical: 4 },
      }}
    >

      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* LOCALES */}
      <Tabs.Screen
        name="LocalesScreen"
        options={{
          title: "Locales",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="storefront-outline"
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />

      {/* HISTORIAL */}
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* ADMIN SOLO SI ES ADMIN */}
      {isAdmin && (
        <Tabs.Screen
          name="AdminScreen"
          options={{
            title: "Panel Admin",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size ?? 24} color={color} />
            ),
          }}
        />
      )}

      {/* RUTAS OCULTAS */}
      {HIDDEN_ROUTES.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
