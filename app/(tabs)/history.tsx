// app/(tabs)/history.tsx
import {
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react-native";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";

import { loadUserSession } from "../../utils/secureStore";

// ---------------------
// 🔥 TU BACKEND REAL
// ---------------------
const API_URL = "http://192.168.0.6:3000/api/usuarios";

type Status = "finalizado" | "pendiente" | "cancelado";

type HistItem = {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  date: string;
  price: string;
  status: Status;
  rating?: number;
  image?: string;
};

const statusPill = (s: Status) => {
  switch (s) {
    case "finalizado":
      return { text: "Finalizado", color: "#34D399", Icon: CheckCircle };
    case "pendiente":
      return { text: "Pendiente", color: "#F59E0B", Icon: Clock };
    case "cancelado":
      return { text: "Cancelado", color: "#EF4444", Icon: XCircle };
  }
};

const TABS = ["Todos", "Finalizados", "Pendientes", "Cancelados"] as const;

// ---------- theme tokens ----------
const palette = {
  light: {
    bg: "#F4F6FA",
    card: "#FFFFFF",
    text: "#111827",
    sub: "#6B7280",
    border: "#E5E7EB",
    ghost: "#F3F4F6",
    headerBg: "#0C1221",
    headerSub: "rgba(255,255,255,0.75)",
    tabTrack: "#0F1A33",
    tabActiveBg: "#FFFFFF",
    tabActiveText: "#0C1221",
    shadow: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
  },
  dark: {
    bg: "#0b0b0b",
    card: "#0f0f10",
    text: "#e5e7eb",
    sub: "#9ca3af",
    border: "rgba(148,163,184,0.2)",
    ghost: "#111827",
    headerBg: "#0f0f10",
    headerSub: "rgba(255,255,255,0.75)",
    tabTrack: "#111827",
    tabActiveBg: "#e5e7eb",
    tabActiveText: "#0b0b0b",
    shadow: {
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
  },
} as const;

export default function HistoryScreen() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? palette.dark : palette.light;
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const [tab, setTab] =
    useState<(typeof TABS)[number]>("Todos");

  const [history, setHistory] = useState<HistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // 🔥 Cargar historial REAL del backend
  // ----------------------------------------------------------
  const loadHistory = async () => {
    try {
      const session = await loadUserSession();

      const res = await fetch(
        `${API_URL}/${session.id}/solicitudes`
      );
      const data = await res.json();

      console.log("📥 HISTORIAL:", data);

      const adapted: HistItem[] = data.map((req: any) => ({
        id: req._id,
        title: req.servicio?.nombre || "Servicio",
        category: req.servicio?.categoria || "General",
        subtitle: req.servicio?.descripcion || "",
        date: `${req.fecha || "2025-01-01"} • ${req.hora || "12:00"}`,
        price: `$${req.servicio?.precio || 0}`,
        status:
          req.estado === "completada"
            ? "finalizado"
            : req.estado === "pendiente"
            ? "pendiente"
            : "cancelado",
        rating: req.calificacion || undefined,
        image: req.servicio?.imagen,
      }));

      setHistory(adapted);
    } catch (err) {
      console.log("❌ Error cargando historial:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // ----------------------------------------------------------
  // 📌 Filtrado por tabs
  // ----------------------------------------------------------
  const filtered = useMemo(() => {
    if (tab === "Todos") return history;
    if (tab === "Finalizados")
      return history.filter((i) => i.status === "finalizado");
    if (tab === "Pendientes")
      return history.filter((i) => i.status === "pendiente");

    return history.filter((i) => i.status === "cancelado");
  }, [tab, history]);

  const counts = useMemo(
    () => ({
      fin: history.filter((i) => i.status === "finalizado").length,
      pen: history.filter((i) => i.status === "pendiente").length,
      can: history.filter((i) => i.status === "cancelado").length,
    }),
    [history]
  );

  const s = styles(theme, isSmall);

  return (
    <View style={s.screen}>
      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Mi Historial</Text>
        <Text style={s.headerSub}>
          Revisa tus servicios contratados
        </Text>

        <View style={s.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              activeOpacity={0.9}
              style={[s.tabBtn, tab === t && s.tabBtnActive]}
            >
              <Text
                style={[
                  s.tabText,
                  tab === t && s.tabTextActive,
                ]}
                numberOfLines={1}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* BODY */}
      <ScrollView
        contentContainerStyle={{
          padding: 14,
          paddingBottom: 26,
        }}
      >
        {loading ? (
          <Text style={{ color: theme.text, marginTop: 20 }}>
            Cargando historial...
          </Text>
        ) : (
          <View style={{ gap: 12 }}>
            {filtered.map((item, idx) => (
              <AnimatedCard key={item.id} index={idx}>
                <HistoryCard item={item} s={s} theme={theme} />
              </AnimatedCard>
            ))}
          </View>
        )}

        {/* Resumen */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Resumen</Text>
          <View style={s.summaryRow}>
            <SummaryBox
              s={s}
              label="Completados"
              value={counts.fin}
              color="#34D399"
            />
            <SummaryBox
              s={s}
              label="Pendientes"
              value={counts.pen}
              color="#F59E0B"
            />
            <SummaryBox
              s={s}
              label="Cancelados"
              value={counts.can}
              color="#EF4444"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function AnimatedCard({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const a = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 350,
      delay: index * 70,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: a,
        transform: [
          {
            translateY: a.interpolate({
              inputRange: [0, 1],
              outputRange: [14, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function HistoryCard({
  item,
  s,
  theme,
}: {
  item: HistItem;
  s: ReturnType<typeof styles>;
  theme: any;
}) {
  const pill = statusPill(item.status);

  return (
    <View style={s.card}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={{ flexDirection: "row" }}
      >
        {/* IMG */}
        <View style={s.thumbWrap}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={s.thumb} />
          ) : (
            <View style={[s.thumb, s.thumbFallback]} />
          )}
        </View>

        {/* INFO */}
        <View style={{ flex: 1 }}>
          <Text
            style={s.title}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text style={s.category}>{item.category}</Text>
          <Text style={s.subtitle}>{item.subtitle}</Text>

          <Text style={s.metaText}>{item.date}</Text>
        </View>

        {/* RIGHT */}
        <View style={s.rightCol}>
          <Text style={s.price}>{item.price}</Text>
          <View style={[s.pill, { borderColor: pill.color }]}>
            <pill.Icon size={12} color={pill.color} />
            <Text style={[s.pillText, { color: pill.color }]}>
              {pill.text}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function SummaryBox({ s, label, value, color }: any) {
  return (
    <View style={s.sumBox}>
      <Text style={[s.sumValue, { color }]}>{value}</Text>
      <Text style={s.sumLabel}>{label}</Text>
    </View>
  );
}

// ---------- ESTILOS (IGUAL QUE TU DISEÑO) ----------
const styles = (t: any, small: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },

    header: {
      backgroundColor: t.headerBg,
      paddingTop: small ? 14 : 18,
      paddingHorizontal: 16,
      paddingBottom: small ? 10 : 12,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
    },

    headerTitle: {
      color: "#fff",
      fontWeight: "800",
      fontSize: small ? 16 : 18,
    },

    headerSub: {
      color: t.headerSub,
      marginTop: 2,
      marginBottom: 10,
      fontSize: small ? 12 : 13,
    },

    tabs: {
      flexDirection: "row",
      backgroundColor: t.tabTrack,
      borderRadius: 999,
      padding: 4,
      gap: 6,
    },

    tabBtn: {
      flex: 1,
      paddingVertical: small ? 6 : 8,
      borderRadius: 999,
      alignItems: "center",
    },

    tabBtnActive: { backgroundColor: t.tabActiveBg },

    tabText: {
      color: "rgba(255,255,255,0.85)",
      fontWeight: "700",
      fontSize: small ? 11 : 12,
    },

    tabTextActive: { color: t.tabActiveText },

    // Tarjetas
    card: {
      backgroundColor: t.card,
      borderRadius: 14,
      padding: small ? 10 : 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      ...t.shadow,
    },

    thumbWrap: {
      width: small ? 50 : 56,
      height: small ? 50 : 56,
      marginRight: 10,
      borderRadius: 10,
      overflow: "hidden",
    },

    thumb: { width: "100%", height: "100%" },
    thumbFallback: { backgroundColor: t.ghost },

    title: {
      fontWeight: "800",
      color: t.text,
      fontSize: small ? 14 : 15,
    },

    category: { color: t.sub, fontSize: 12 },
    subtitle: { color: t.sub, fontSize: 12 },

    metaText: {
      marginTop: 6,
      color: t.sub,
      fontSize: 12,
    },

    rightCol: {
      alignItems: "flex-end",
      justifyContent: "center",
      minWidth: 90,
    },

    price: {
      color: t.text,
      fontWeight: "900",
      fontSize: 15,
      marginBottom: 5,
    },

    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
    },

    pillText: { fontSize: 11, fontWeight: "800" },

    summaryCard: {
      marginTop: 14,
      backgroundColor: t.card,
      borderRadius: 14,
      padding: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      ...t.shadow,
    },

    summaryTitle: {
      fontWeight: "800",
      color: t.text,
      marginBottom: 8,
    },

    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },

    sumBox: { alignItems: "center", flex: 1 },
    sumValue: { fontSize: 22, fontWeight: "900" },
    sumLabel: { color: t.sub, fontSize: 13 },
  });
