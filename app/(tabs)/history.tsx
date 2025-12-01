// app/(tabs)/history.tsx
import { useFocusEffect } from "@react-navigation/native";
import {
  CheckCircle,
  Clock,
  Star,
  XCircle
} from "lucide-react-native";
import { useCallback } from "react";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";

import { loadUserSession } from "../../utils/secureStore";

// 📌 Ruta correcta (solo para solicitudes)
const USER_API = "http://192.168.1.71:3000/api/usuarios";

// Tipos
type Status = "finalizado" | "pendiente" | "cancelado" | "aceptado";

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

// Badge de estado
const statusPill = (s: string) => {
  switch (s) {
    case "finalizado":
      return { text: "Finalizado", color: "#34D399", Icon: CheckCircle };
    case "pendiente":
      return { text: "Pendiente", color: "#F59E0B", Icon: Clock };
    case "aceptado":
      return { text: "Aceptado", color: "#3B82F6", Icon: Clock };
    default:
      return { text: "Cancelado", color: "#EF4444", Icon: XCircle };
  }
};

const TABS = ["Todos", "Aceptados", "Pendientes", "Cancelados"] as const;

// Tema
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
};

export default function HistoryScreen() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? palette.dark : palette.light;
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const [tab, setTab] = useState<(typeof TABS)[number]>("Todos");
  const [history, setHistory] = useState<HistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal rating
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<HistItem | null>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingText, setRatingText] = useState("");

  const [session, setSession] = useState<any>(null);

  // -------------------
  // 🔥 CARGAR HISTORIAL
  // -------------------
const loadHistory = async (userId: string) => {
  try {
    const res = await fetch(`${USER_API}/${userId}/solicitudes`);
    const data = await res.json();

    const adapted: HistItem[] = data.map((req: any) => ({
      id: req._id,
      title: req.servicio?.nombre || "Servicio",
      category: req.servicio?.categoria || "General",
      subtitle: req.servicio?.descripcion || "",
      date: `${req.fechaSolicitud?.split("T")[0]}`,
      price: `$${req.servicio?.precio || 0}`,
      status: req.estado,
      rating: req.calificacion,
      image: req.servicio?.imagen,
    }));

    setHistory(adapted);
  } catch (err) {
    console.log("❌ Error cargando historial:", err);
  } finally {
    setLoading(false);
  }
};


useFocusEffect(
  useCallback(() => {
    let active = true;

    (async () => {
      const data = await loadUserSession();

      if (!active) return;

      setSession(data);
      await loadHistory(data.id);
    })();

    return () => {
      active = false;
    };
  }, [])
);
// 🔄 Actualización automática cada 4 segundos
useEffect(() => {
  if (!session?.id) return;

  const interval = setInterval(() => {
    loadHistory(session.id);
  }, 4000); // cada 4 segundos

  return () => clearInterval(interval);
}, [session?.id]);


  // Filtrado por tabs
  const filtered = useMemo(() => {
    if (tab === "Todos") return history;
    return history.filter((i) => i.status === tab.toLowerCase());
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
        <Text style={s.headerSub}>Revisa tus servicios contratados</Text>

        <View style={s.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              activeOpacity={0.9}
              style={[s.tabBtn, tab === t && s.tabBtnActive]}
            >
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* LISTA */}
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 26 }}>
        {loading ? (
          <Text style={{ color: theme.text, marginTop: 20 }}>
            Cargando historial...
          </Text>
        ) : (
          <View style={{ gap: 12 }}>
            {filtered.map((item, idx) => (
              <AnimatedCard key={item.id} index={idx}>
                <HistoryCard
                  item={item}
                  s={s}
                  theme={theme}
                  onPressCalificar={() => {
                    setRatingTarget(item);
                    setRatingModalVisible(true);
                  }}
                />
              </AnimatedCard>
            ))}
          </View>
        )}

        {/* RESUMEN */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Resumen</Text>
          <View style={s.summaryRow}>
            <SummaryBox s={s} label="Finalizados" value={counts.fin} color="#34D399" />
            <SummaryBox s={s} label="Pendientes" value={counts.pen} color="#F59E0B" />
            <SummaryBox s={s} label="Cancelados" value={counts.can} color="#EF4444" />
          </View>
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <Text style={s.modalTitle}>Calificar servicio</Text>

            {ratingTarget && (
              <Text style={s.modalSubtitle}>
                Ahora puedes calificar el servicio de{" "}
                <Text style={{ fontWeight: "700", color: "#fff" }}>
                  {ratingTarget.title}
                </Text>
              </Text>
            )}

            {/* ESTRELLAS */}
            <View style={s.starRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setRatingStars(n)}
                >
                  <Star
                    size={36}
                    color={n <= ratingStars ? "#fbbf24" : "#6b7280"}
                    fill={n <= ratingStars ? "#fbbf24" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Escribe una reseña (opcional)"
              placeholderTextColor="#9ca3af"
              value={ratingText}
              onChangeText={setRatingText}
              multiline
              style={s.reviewInput}
            />

            {/* ENVIAR RESEÑA */}
            <TouchableOpacity
              style={s.btnSubmit}
              onPress={async () => {
                if (!ratingTarget) return;

await fetch(
  `http://192.168.0.6:3000/api/usuarios/${session.id}/solicitudes/${ratingTarget.id}/calificar`,
  {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      calificacion: ratingStars,
      reseña: ratingText,
    }),
  }
);


                setRatingModalVisible(false);
                setRatingStars(0);
                setRatingText("");
if (session) {
  await loadHistory(session.id);
}
              }}
            >
              <CheckCircle size={16} color="#fff" />
              <Text style={s.btnSubmitText}>Enviar calificación</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.btnCancel}
              onPress={() => setRatingModalVisible(false)}
            >
              <Text style={s.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ------------------ COMPONENTES ------------------

function AnimatedCard({ children, index }: any) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

function HistoryCard({ item, s, onPressCalificar }: any) {
  const pill = statusPill(item.status);
  return (
    <View style={s.card}>
      <View style={{ flexDirection: "row" }}>
        <View style={s.thumbWrap}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={s.thumb} />
          ) : (
            <View style={[s.thumb, s.thumbFallback]} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={s.title}>{item.title}</Text>
          <Text style={s.category}>{item.category}</Text>
          <Text style={s.subtitle}>{item.subtitle}</Text>
          <Text style={s.metaText}>{item.date}</Text>
        </View>

        <View style={s.rightCol}>
          <Text style={s.price}>{item.price}</Text>

          <View style={[s.pill, { borderColor: pill.color }]}>
            <pill.Icon size={12} color={pill.color} />
            <Text style={[s.pillText, { color: pill.color }]}>
              {pill.text}
            </Text>
          </View>

{item.status === "finalizado" && !item.rating && (
  <TouchableOpacity style={s.rateBtn} onPress={onPressCalificar}>
    <Star size={14} color="#fbbf24" fill="#fbbf24" />
    <Text style={s.rateBtnText}>Calificar</Text>
  </TouchableOpacity>
)}

        </View>
      </View>
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

// -------- ESTILOS --------
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

    rateBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 8,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: "rgba(251,191,36,0.1)",
      borderWidth: 1,
      borderColor: "#fbbf24",
    },
    rateBtnText: {
      color: "#fbbf24",
      fontWeight: "700",
      fontSize: 11,
    },

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

    // Modal rating
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    modalContainer: {
      width: "90%",
      backgroundColor: "#111316",
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },

    modalTitle: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 20,
      marginBottom: 4,
    },

    modalSubtitle: {
      color: "#9ca3af",
      textAlign: "center",
      fontSize: 13,
      marginBottom: 16,
      lineHeight: 18,
    },

    starRow: {
      flexDirection: "row",
      marginBottom: 16,
      marginTop: 6,
    },

    reviewInput: {
      width: "100%",
      minHeight: 90,
      backgroundColor: "#1b1c20",
      color: "#fff",
      borderRadius: 12,
      padding: 12,
      textAlignVertical: "top",
      borderWidth: 1,
      borderColor: "#333",
    },

    btnSubmit: {
      width: "100%",
      backgroundColor: "#34D399",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginTop: 16,
    },
    btnSubmitText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 14,
    },

    btnCancel: {
      width: "100%",
      paddingVertical: 10,
      marginTop: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      alignItems: "center",
    },
    btnCancelText: {
      color: "#9ca3af",
      fontWeight: "700",
    },
  });
