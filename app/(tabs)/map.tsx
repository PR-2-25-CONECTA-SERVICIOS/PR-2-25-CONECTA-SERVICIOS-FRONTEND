// app/(tabs)/map.tsx
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Navigation,
  X
} from "lucide-react-native";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { WebView } from "react-native-webview";


/* =========================
   API
   ========================= */
// ⚠️ Si pruebas en dispositivo físico, cambia localhost por la IP de tu PC
const API_URL = "https://pr-2-25-conecta-servicios-backend.onrender.com/api/locales";
const CATEGORY_API = "https://pr-2-25-conecta-servicios-backend.onrender.com/api/categorias";

/* =========================
   Tipos
   ========================= */
type CategoryItem = { _id: string; nombre: string };

type ProviderItem = {
  id: string;
  title: string;
  category: string;
  coord: { latitude: number; longitude: number };
  rating: number;
  price: string;
  status: "available" | "unavailable";
  image?: string;
};

/* Mapper DB → UI */
function mapLocalToItem(local: any): ProviderItem {
  const lat = Number(local.lat);
  const lng = Number(local.lng);

  return {
    id: local._id,
    title: local.nombre ?? "Sin nombre",
    category: local.categoria ?? "General",

    coord: {
      latitude: isNaN(lat) ? -17.3835 : lat,
      longitude: isNaN(lng) ? -66.163 : lng,
    },

    // reemplazamos rating por estado de verificación
    rating: local.verificado ? 1 : 0, // solo un marcador booleano

    // mostramos teléfono en price
    price: local.telefono || "Sin teléfono",

    status: local.verificado ? "available" : "unavailable",

    image: local.imagen,
  };
}


/* =========================
   Paleta por tema
   ========================= */
const palette = {
  light: {
    bg: "#F4F6FA",
    card: "#FFFFFF",
    text: "#0f1115",
    sub: "#6B7280",
    border: "#E5E7EB",
    chip: "#FBBF24",
    legendBg: "#FFFFFF",
    legendText: "#0f1115",
    overlay: "rgba(0,0,0,0.4)",
  },
  dark: {
    bg: "#0b0b0b",
    card: "#0f0f10",
    text: "#E5E7EB",
    sub: "#9CA3AF",
    border: "rgba(148,163,184,0.25)",
    chip: "#FBBF24",
    legendBg: "#0f0f10",
    legendText: "#E5E7EB",
    overlay: "rgba(0,0,0,0.6)",
  },
} as const;

/* =========================
   Pantalla principal
   ========================= */
export default function MapScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const t = scheme === "dark" ? palette.dark : palette.light;

const [center] = useState({
  latitude: -17.3835,
  longitude: -66.163,
});

const webRef = useRef<WebView | null>(null);
const [mapReady, setMapReady] = useState(false);

  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [selected, setSelected] = useState<ProviderItem | null>(null);
  const [legendOpen] = useState(true);

  // categorías
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  // --- ubicación y seguimiento ---
  const [userLoc, setUserLoc] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [followMe, setFollowMe] = useState(false);
  const watcher = useRef<Location.LocationSubscription | null>(null);

  // Animación bottom sheet
  const bottom = useRef(new Animated.Value(0)).current;
  const showSheet = () =>
    Animated.timing(bottom, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  const hideSheet = () =>
    Animated.timing(bottom, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();

  // Lista modal (botón "Lista")
  const [listOpen, setListOpen] = useState(false);
  const [search, setSearch] = useState("");

  // ============================
  // Cargar locales desde backend
  // ============================
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const mapped = data.map(mapLocalToItem);
        setProviders(mapped);
      } catch (e) {
        console.log("❌ Error cargando locales:", e);
      }
    })();
  }, []);

  // ============================
  // Cargar categorías
  // ============================
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(CATEGORY_API);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (e) {
        console.log("❌ Error cargando categorías:", e);
      }
    })();
  }, []);

  // ============================
  // Filtro (search + categoría)
  // ============================
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = providers;

    if (selectedCategory !== "Todos") {
      base = base.filter((i) => i.category === selectedCategory);
    }

    if (!q) return base;

    return base.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.price.toLowerCase().includes(q)
    );
  }, [search, providers, selectedCategory]);
useEffect(() => {
  if (!mapReady) return; // esperamos a que el HTML haya cargado

  const js = `
    if (window.addMarkers) window.addMarkers(${JSON.stringify(filtered)});
    true;
  `;
  webRef.current?.injectJavaScript(js);
}, [filtered, mapReady]);

  // ============================
  // Ubicación
  // ============================
  useEffect(() => {
    (async () => {
      if (!followMe) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const curr = await Location.getCurrentPositionAsync({});
      const center = {
        latitude: curr.coords.latitude,
        longitude: curr.coords.longitude,
      };
      setUserLoc(center);
      animateTo(center);

      watcher.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1500,
          distanceInterval: 2,
        },
        ({ coords }) => {
          const c = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
          setUserLoc(c);
          if (followMe) animateTo(c);
        }
      );
    })();

    return () => {
      watcher.current?.remove();
      watcher.current = null;
    };
  }, [followMe]);

const animateTo = (c: { latitude: number; longitude: number }) => {
  if (!mapReady) return;  // opcional pero recomendable

  const js = `
    if (window.moveTo) window.moveTo(${c.latitude}, ${c.longitude});
    if (window.setUserLocation) window.setUserLocation(${c.latitude}, ${c.longitude});
    true;
  `;
  webRef.current?.injectJavaScript(js);
};

const onMarkerPress = (item: ProviderItem) => {
  setSelected(item);
  showSheet();
  animateTo(item.coord);
};



  const s = styles(t);

  const translateY = bottom.interpolate({
    inputRange: [0, 1],
    outputRange: [260, 0],
  });

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        {/* FILA: back + search */}
        <View style={s.headerRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/LocalesScreen")}
            style={s.backBtn}
          >
            <ArrowLeft size={18} color={t.text} />
          </TouchableOpacity>

          <View style={s.searchWrap}>
            <TextInput
              placeholder="Buscar en el mapa..."
              placeholderTextColor={t.sub}
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Acciones (Mi ubicación / Categorías / Lista) */}
        <View style={s.headerActions}>
          <TouchableOpacity
            onPress={() => setFollowMe((v) => !v)}
            activeOpacity={0.9}
            style={[
              chipStyles.chip,
              followMe && { backgroundColor: "#F59E0B" },
            ]}
          >
            <Navigation size={16} color="#111827" />
            <Text style={s.chipText}>
              {followMe ? " Siguiéndote" : " Mi ubicación"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setListOpen(true)}
            activeOpacity={0.9}
            style={chipStyles.chip}
          >
            <Text style={s.chipText}>Lista</Text>
          </TouchableOpacity>
        </View>

        {/* Chips de categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ paddingRight: 4 }}
        >
          <CategoryChip
            label="Todos"
            selected={selectedCategory === "Todos"}
            onPress={() => setSelectedCategory("Todos")}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c._id}
              label={c.nombre}
              selected={selectedCategory === c.nombre}
              onPress={() => setSelectedCategory(c.nombre)}
            />
          ))}
        </ScrollView>
      </View>

      {/* MAPA */}
            {/* MAPA (WebView + Leaflet) */}
      <View
        style={{
          flex: 1,
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          overflow: "hidden",
        }}
      >
<WebView
  ref={webRef}
  originWhitelist={["*"]}
  source={{ html: MAP_HTML }}
  onLoadEnd={() => setMapReady(true)}
  onMessage={(event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      onMarkerPress(data as ProviderItem);
    } catch (e) {
      console.log("Mensaje inválido desde WebView:", e);
    }
  }}
/>

      </View>



      {/* Bottom sheet detalle */}
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12 + (Platform.OS === "ios" ? 8 : 0),
          transform: [{ translateY }],
        }}
      >
        <View
          style={{
            backgroundColor: t.card,
            borderRadius: 16,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.border,
            padding: 14,
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          {selected && (
            <View>
              <View style={s.rowBetween}>
                <View>
                  <Text style={[s.title, { fontSize: 16 }]}>
                    {selected.title}
                  </Text>
                  <Text style={s.sub}>{selected.category}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    hideSheet();
                    setSelected(null);
                  }}
                >
                  <X size={18} color={t.sub} />
                </TouchableOpacity>
              </View>

              <View style={[s.row, { gap: 10, marginTop: 10 }]}>
<View style={[s.row, { gap: 6 }]}>
  <Text style={[s.textStrong, { color: selected.rating === 1 ? "#4ade80" : "#f87171" }]}>
    {selected.rating === 1 ? "Verificado" : "No verificado"}
  </Text>
</View>

                <Text style={[s.textStrong, { marginLeft: "auto" }]}>
                  {selected.price}
                </Text>
              </View>

<TouchableOpacity
  activeOpacity={0.9}
  style={s.primaryBtn}
  onPress={() => router.push(`/BusinessScreen?id=${selected.id}`)}
>
  <Text style={s.primaryBtnText}>Ver detalle</Text>
</TouchableOpacity>

            </View>
          )}
        </View>
      </Animated.View>

      {/* LISTA MODAL */}
      <ListModal
        open={listOpen}
        onClose={() => setListOpen(false)}
        t={t}
        data={filtered}
        onSelect={(item) => {
          setListOpen(false);
          setSelected(item);
          showSheet();
          animateTo(item.coord);
        }}
      />
    </View>
  );
}

/* =========================
   Subcomponentes
   ========================= */
function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginRight: 8,
        backgroundColor: selected ? "#FBBF24" : "rgba(15,15,16,0.9)",
        borderWidth: selected ? 0 : StyleSheet.hairlineWidth,
        borderColor: "rgba(148,163,184,0.4)",
      }}
    >
      <Text
        style={{
          color: selected ? "#111827" : "#E5E7EB",
          fontWeight: "700",
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: color,
          marginRight: 8,
        }}
      />
      <Text style={{ color: "#AEB4BE", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function UserPuck() {
  // Punto central más grande + anillos más pequeños
  const BOX = 80;
  const RING1 = 48;
  const RING2 = 40;

  const ring1 = React.useRef(new Animated.Value(0)).current;
  const ring2 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration: 1400,
          delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      ).start();
    loop(ring1, 0);
    loop(ring2, 400);
  }, [ring1, ring2]);

  const scale1 = ring1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.5],
  });
  const opa1 = ring1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });
  const scale2 = ring2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.6],
  });
  const opa2 = ring2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  return (
    <View
      style={{ width: BOX, height: BOX, alignItems: "center", justifyContent: "center" }}
      pointerEvents="none"
    >
      {/* halo/glow */}
      <View
        style={{
          position: "absolute",
          width: 64,
          height: 64,
          borderRadius: 999,
          backgroundColor: "#F59E0B",
          opacity: 0.18,
        }}
      />
      {/* ring 1 */}
      <Animated.View
        style={{
          position: "absolute",
          width: RING1,
          height: RING1,
          borderRadius: 999,
          backgroundColor: "#F59E0B",
          opacity: opa1,
          transform: [{ scale: scale1 }],
        }}
      />
      {/* ring 2 */}
      <Animated.View
        style={{
          position: "absolute",
          width: RING2,
          height: RING2,
          borderRadius: 999,
          backgroundColor: "#F59E0B",
          opacity: opa2,
          transform: [{ scale: scale2 }],
        }}
      />
      {/* punto central */}
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          backgroundColor: "#FCD34D",
          borderWidth: 4,
          borderColor: "#111827",
        }}
      />
    </View>
  );
}







function ListModal({
  open,
  onClose,
  t,
  data,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  t: typeof palette.light | typeof palette.dark;
  data: ProviderItem[];
  onSelect: (item: ProviderItem) => void;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.overlay }}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: t.card,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.border,
              maxHeight: "65%",
              paddingBottom: Platform.OS === "ios" ? 24 : 12,
            }}
          >
            <View
              style={{
                padding: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: t.text, fontWeight: "800", fontSize: 16 }}>
                Resultados
              </Text>
              <TouchableOpacity onPress={onClose}>
                <X size={20} color={t.sub} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={data}
              keyExtractor={(i) => String(i.id)}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => onSelect(item)}
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: t.card,
                    borderRadius: 12,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: t.border,
                    padding: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <Text style={{ color: t.text, fontWeight: "800" }}>
                        {item.title}
                      </Text>
                      <Text style={{ color: t.sub }}>{item.category}</Text>
                    </View>
                    <Text style={{ color: t.text, fontWeight: "800" }}>
                      {item.price}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
<Text style={{ 
  color: item.rating === 1 ? "#4ade80" : "#f87171", 
  fontWeight: "700" 
}}>
  {item.rating === 1 ? "Verificado" : "No verificado"}
</Text>

                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* =========================
   Estilos base
   ========================= */
const styles = (t: typeof palette.light | typeof palette.dark) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    header: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      zIndex: 2,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    searchWrap: { flex: 1, flexDirection: "row", alignItems: "center" },
    searchInput: {
      flex: 1,
      height: 40,
      borderRadius: 12,
      paddingHorizontal: 12,
      backgroundColor: t.card,
      color: t.text,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      marginRight: 8,
    },
    headerActions: { flexDirection: "row", gap: 10, marginTop: 10 },
    chipText: { color: "#111827", fontWeight: "700", fontSize: 12 },

    row: { flexDirection: "row", alignItems: "center" },
    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    legend: {
      position: "absolute",
      right: 10,
      bottom: 90,
      backgroundColor: t.legendBg,
      borderColor: t.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
      padding: 10,
    },
    legendTitle: { color: t.legendText, fontWeight: "800", marginBottom: 6 },

    title: { color: t.text, fontWeight: "800" },
    sub: { color: t.sub },
    textStrong: { color: t.text, fontWeight: "700" },

    primaryBtn: {
      marginTop: 12,
      backgroundColor: "#FBBF24",
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    primaryBtnText: { color: "#111827", fontWeight: "800" },
  });

const chipStyles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FBBF24",
    flexDirection: "row",
    alignItems: "center",
  },
});

/* =========================
   Estilos de mapa (Google)
   ========================= */
const darkStyle = [
  { elementType: "geometry", stylers: [{ color: "#0b132b" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a9b1c3" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b132b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1c2541" }] },
  { featureType: "poi", elementType: "labels.text", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const lightStyle = [
  { elementType: "geometry", stylers: [{ color: "#eaeef5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "poi", elementType: "labels.text", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet/dist/leaflet.css"
  />
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <style>
    html, body { margin:0; padding:0; }
    #map { width: 100vw; height: 100vh; }
  /* 🔹 Ocultar controles de zoom de Leaflet */
  .leaflet-control-zoom {
    display: none !important;
  }
    /* ==== Estilos del pin (igual que en React Native) ==== */
    .cs-pin-wrapper-outer {
      background: transparent;
      border: none;
    }

    .cs-pin-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .cs-pin {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      border: 3px solid #F59E0B;
      background-color: #F59E0B;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      font-size: 10px;
      font-weight: 700;
      color: #111827;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .cs-pin img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .cs-pin--nofoto {
      /* ya tiene el fondo amarillo y el texto "Sin foto" centrado */
    }

    .cs-pin-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background-color: #F59E0B;
      margin-top: -4px;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    var map = L.map('map').setView([-17.3835, -66.163], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);
    var userMarker = null;

    window.addMarkers = function(data) {
      markersLayer.clearLayers();
      var bounds = [];

      data.forEach(function(item) {
        var lat = item.coord && item.coord.latitude;
        var lng = item.coord && item.coord.longitude;
        if (typeof lat !== "number" || typeof lng !== "number") return;

        bounds.push([lat, lng]);

        var hasImage = item.image && item.image.trim() !== "";
        var html = "";

        if (hasImage) {
          html =
            '<div class="cs-pin-wrapper">' +
              '<div class="cs-pin">' +
                '<img src="' + item.image + '" />' +
              '</div>' +
              '<div class="cs-pin-dot"></div>' +
            '</div>';
        } else {
          html =
            '<div class="cs-pin-wrapper">' +
              '<div class="cs-pin cs-pin--nofoto">Sin foto</div>' +
              '<div class="cs-pin-dot"></div>' +
            '</div>';
        }

        var icon = L.divIcon({
          html: html,
          className: "cs-pin-wrapper-outer",
          iconSize: [42, 56],
          iconAnchor: [21, 46]
        });

        var marker = L.marker([lat, lng], { icon: icon }).addTo(markersLayer);

        marker.on("click", function() {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(item));
          }
        });
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    };

    window.moveTo = function(lat, lng) {
      map.setView([lat, lng], 15);
    };

    window.setUserLocation = function(lat, lng) {
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = L.circleMarker([lat, lng], {
          radius: 6,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.9
        }).addTo(map);
      }
    };
  </script>
</body>
</html>`;
