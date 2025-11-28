// app/ServiceProviderScreen.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Eye,
  MessageCircle,
  Star,
  XCircle
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


const API_BASE = "http://localhost:3000";
const SERVICES_API = `${API_BASE}/api/servicios`;

type RequestStatus = "pending" | "accepted" | "completed" | "cancelled";

type Req = {
  id: string;
  client: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: RequestStatus;
  price: string;
  location: string;
  clientAvatar?: string;
  urgent?: boolean;
};

type ProviderData = {
  name: string;
  service: string;
  category: string;

  // ⭐ NUEVOS
  rating: number;         // promedio real
  reviews: number;        // cantidad real
  reviewsList?: Array<{
    usuario: {
      nombre: string;
      avatar?: string;
    };
    comentario: string;
    calificacion: number;
  }>;

  avatar: string;
  verified: boolean;
  active: boolean;
  phone: string;
  experience: string;
  completedJobs: number;
  responseTime: string;
};


const EMPTY_PROVIDER: ProviderData = {
  name: "",
  service: "",
  category: "",
  rating: 0,
  reviews: 0,
  avatar: "",
  verified: false,
  active: true,
  phone: "",
  experience: "",
  completedJobs: 0,
  responseTime: "15 min promedio",
};

const mapEstadoToStatus = (estado: string): RequestStatus => {
  switch (estado) {
    case "pendiente":
      return "pending";
    case "aceptado":
      return "accepted";
    case "finalizado":
      return "completed";
    case "cancelado":
      return "cancelled";
    default:
      return "pending";
  }
};

const mapStatusToEstado = (status: RequestStatus): string => {
  switch (status) {
    case "pending":
      return "pendiente";
    case "accepted":
      return "aceptado";
    case "completed":
      return "finalizado";
    case "cancelled":
      return "cancelado";
    default:
      return "pendiente";
  }
};

const getStatusPill = (status: RequestStatus) => {
  switch (status) {
    case "pending":
      return { text: "Pendiente", color: "#fbbf24", Icon: Clock };
    case "accepted":
      return { text: "Aceptado", color: "#60a5fa", Icon: CheckCircle };
    case "completed":
      return { text: "Completado", color: "#34d399", Icon: CheckCircle };
    case "cancelled":
      return { text: "Cancelado", color: "#f87171", Icon: XCircle };
    default:
      return { text: "Desconocido", color: "#9ca3af", Icon: Clock };
  }
};

export default function ServiceProviderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const serviceId = id as string | undefined;

  const [providerData, setProviderData] =
    useState<ProviderData>(EMPTY_PROVIDER);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [tab, setTab] = useState<"requests" | "profile" | "analytics">(
    "requests"
  );
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------- ACEPTAR: modal + whatsapp ----------
  const [acceptedModalVisible, setAcceptedModalVisible] = useState(false);
  const [acceptedRequest, setAcceptedRequest] = useState<Req | null>(null);

  // ---------- PROGRAMAR: modal + whatsapp ----------
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleRequest, setScheduleRequest] = useState<Req | null>(null);

  const [schedDate, setSchedDate] = useState(""); // YYYY-MM-DD
  const [schedTime, setSchedTime] = useState(""); // HH:mm
  const [schedDuration, setSchedDuration] = useState("2");
  const [schedLocation, setSchedLocation] = useState("");
  const [schedNote, setSchedNote] = useState("");

  // BACK: volver al perfil
  const handleBack = () => {
    router.replace("/ProfileViewScreen");
  };
const [finishModalVisible, setFinishModalVisible] = useState(false);

  // ====================================================
  // CARGAR DETALLE DEL SERVICIO + SOLICITUDES
  // ====================================================
  useFocusEffect(
  useCallback(() => {
    if (!serviceId) return;

    const loadData = async () => {
      try {
        // 1) Detalle del servicio
        const resService = await fetch(`${SERVICES_API}/${serviceId}`);
        const rawService = await resService.text();
        console.log("📥 Detalle servicio:", resService.status, rawService);

        if (!resService.ok) throw new Error("HTTP " + resService.status);
        const s = JSON.parse(rawService);

        const header: ProviderData = {
          name: s.propietario?.nombre || "Proveedor",
          service: s.nombre || "Servicio",
          category: s.categoria || "General",
          rating: s.calificacion || 0,
          reviews: s.reseñas?.length || 0,
          reviewsList: s.reseñas || [],
          avatar: s.propietario?.foto || s.imagen || "",
          verified: true,
          active: s.disponible ?? true,
          phone: s.propietario?.telefono || "Sin teléfono",
          experience: s.propietario?.experiencia || "No especificado",
          completedJobs: s.trabajosCompletados || 0,
          responseTime: "15 min promedio",
        };

        setProviderData(header);
        setIsActive(header.active);

        // 2) Solicitudes
        const resReq = await fetch(`${SERVICES_API}/${serviceId}/solicitudes`);
        const rawReq = await resReq.text();
        console.log("📥 Solicitudes:", resReq.status, rawReq);

        if (resReq.ok) {
          const dataReq = JSON.parse(rawReq);

          const mapped: Req[] = dataReq.map((r: any) => ({
            id: r._id,
            client: r.cliente?.nombre || "Cliente",
            service: r.descripcion || "",
            date:
              r.fechaCita ||
              (r.fechaSolicitud ? String(r.fechaSolicitud).slice(0, 10) : ""),
            time: r.horaCita || "",
            status: mapEstadoToStatus(r.estado),
            price: r.precio || s.precio || "",
            location: r.categoria || "Sin dirección",
            clientAvatar: r.cliente?.foto || "",
            urgent: false,
          }));

          setRequests(mapped);
        } else {
          setRequests([]);
        }
      } catch (err) {
        console.log("❌ Error cargando ServiceProviderScreen:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // cleanup
    return () => {};
  }, [serviceId])
);


useEffect(() => {
  if (!serviceId) return;

  const interval = setInterval(() => {
    fetch(`${SERVICES_API}/${serviceId}/solicitudes`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((r: any) => ({
          id: r._id,
          client: r.cliente?.nombre || "Cliente",
          service: r.descripcion || "",
          date:
            r.fechaCita ||
            (r.fechaSolicitud ? String(r.fechaSolicitud).slice(0, 10) : ""),
          time: r.horaCita || "",
          status: mapEstadoToStatus(r.estado),
          price: r.precio || "",
          location: r.categoria || "Sin dirección",
          clientAvatar: r.cliente?.foto || "",
          urgent: false,
        }));

        setRequests(mapped);
      })
      .catch(() => {});
  }, 4000);

  return () => clearInterval(interval);
}, [serviceId]);


  // ====================================================
  // TOGGLE DISPONIBILIDAD DEL SERVICIO
  // ====================================================
  const handleToggleActive = async () => {
    if (!serviceId) return;
    const next = !isActive;
    setIsActive(next); // optimista

    try {
      const res = await fetch(`${SERVICES_API}/${serviceId}/toggle`, {
        method: "PATCH",
      });
      const raw = await res.text();
      console.log("📥 toggle disponibilidad:", res.status, raw);

      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
    } catch (err) {
      console.log("❌ Error al cambiar disponibilidad:", err);
      // revertir si falla
      setIsActive((prev) => !prev);
    }
  };

  // ====================================================
  // ACEPTAR / RECHAZAR SOLICITUD
  // ====================================================
  const updateRequestStatusBackend = async (
    req: Req,
    status: RequestStatus
  ) => {
    if (!serviceId) return;
    try {
      const res = await fetch(
        `${SERVICES_API}/${serviceId}/solicitudes/${req.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: mapStatusToEstado(status) }),
        }
      );
      const raw = await res.text();
      console.log("📥 update solicitud:", res.status, raw);

      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
    } catch (err) {
      console.log("❌ Error actualizando solicitud:", err);
    }
  };

  const handleAccept = (req: Req) => {
    // actualizar UI
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: "accepted" } : r))
    );

    const accepted = { ...req, status: "accepted" as RequestStatus };
    setAcceptedRequest(accepted);
    setAcceptedModalVisible(true);

    // backend
    updateRequestStatusBackend(req, "accepted");
  };

  const handleReject = (req: Req) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: "cancelled" } : r))
    );
    updateRequestStatusBackend(req, "cancelled");
  };

  const openWhatsAppAcceptance = (req: Req) => {
    const msg = `¡Hola ${req.client}! 👋 Soy ${providerData.name}. Acepté tu solicitud de "${req.service}" para el ${req.date} a las ${req.time} en ${req.location}. ¿Coordinamos detalles por aquí?`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {});
  };

  // ====================================================
  // PROGRAMAR CITA
  // ====================================================
  const openScheduleModal = (req: Req) => {
    setScheduleRequest(req);
    setSchedDate(req.date || "");
    setSchedTime(req.time || "");
    setSchedDuration("2");
    setSchedLocation(req.location || "");
    setSchedNote("");
    setScheduleModalVisible(true);
  };

  const scheduleWhatsAppMessage = useMemo(() => {
    if (!scheduleRequest) return "";
    return `Hola ${
      scheduleRequest.client
    } 👋\n\nTe propongo agendar tu servicio "${
      scheduleRequest.service
    }" para:\n🗓 ${schedDate} a las ${schedTime}\n⏱ Duración aprox: ${schedDuration}h\n📍 Ubicación: ${schedLocation}\n\n${
      schedNote ? `Notas: ${schedNote}\n\n` : ""
    }¿Te parece bien esta hora?`;
  }, [
    scheduleRequest,
    schedDate,
    schedTime,
    schedDuration,
    schedLocation,
    schedNote,
  ]);

  const openWhatsAppSchedule = () => {
    if (!scheduleRequest) return;
    const url = `https://wa.me/?text=${encodeURIComponent(
      scheduleWhatsAppMessage
    )}`;
    Linking.openURL(url).catch(() => {});
  };

  const saveSchedule = async () => {
    if (!scheduleRequest) return;
    try {
      const res = await fetch(
        `${SERVICES_API}/solicitudes/${scheduleRequest.id}/appointment`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fechaCita: schedDate,
            horaCita: schedTime,
          }),
        }
      );
      const raw = await res.text();
      console.log("📥 assign appointment:", res.status, raw);

      if (!res.ok) throw new Error("HTTP " + res.status);

      // actualizar UI
      setRequests((prev) =>
        prev.map((r) =>
          r.id === scheduleRequest.id
            ? { ...r, date: schedDate, time: schedTime, status: "accepted" }
            : r
        )
      );
      setScheduleModalVisible(false);
    } catch (err) {
      console.log("❌ Error guardando cita:", err);
    }
  };

  // ====================================================
  // STATS (a partir de las solicitudes)
  // ====================================================
  const stats = useMemo(() => {
    let completed = 0;
    let income = 0;

    requests.forEach((r) => {
      if (r.status === "completed") {
        completed++;
        const num = parseFloat(r.price.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) income += num;
      }
    });

    return {
      completed,
      income,
    };
  }, [requests]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#e5e7eb" }}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER con Back */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={18} color="#e5e7eb" />
        </TouchableOpacity>

        <View style={styles.avatarWrap}>
          {providerData.avatar ? (
            <Image
              source={{ uri: providerData.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>
                {providerData.name
                  ? providerData.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                  : "SP"}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.rowCenter}>
            <Text style={styles.providerName}>{providerData.name}</Text>
            {providerData.verified && (
              <View style={styles.badgeSecondary}>
                <Text style={styles.badgeSecondaryText}>Verificado</Text>
              </View>
            )}
          </View>
          <Text style={styles.providerSubtitle}>{providerData.service}</Text>

          <View style={[styles.rowCenter, { gap: 14, marginTop: 6 }]}>
            <View style={styles.rowCenter}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.ratingText}>
                {providerData.rating}{" "}
                <Text style={styles.grayText}>({providerData.reviews})</Text>
              </Text>
            </View>
            <Text style={styles.grayText}>
              {providerData.completedJobs} trabajos
            </Text>
          </View>
        </View>
      </View>


      {/* CONTENIDO */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        {/* Stats rápidas */}
        <View style={styles.statsGrid}>
          <View style={[styles.card, styles.cardStat]}>
            <Text style={[styles.statNumber, { color: "#fbbf24" }]}>
              {requests.filter((r) => r.status === "pending").length}
            </Text>
            <Text style={styles.grayTextSmall}>Pendientes</Text>
          </View>
          <View style={[styles.card, styles.cardStat]}>
            <Text style={[styles.statNumber, { color: "#60a5fa" }]}>
              {requests.filter((r) => r.status === "accepted").length}
            </Text>
            <Text style={styles.grayTextSmall}>En progreso</Text>
          </View>
          <View style={[styles.card, styles.cardStat]}>
            <Text style={[styles.statNumber, { color: "#34d399" }]}>
              {requests.filter((r) => r.status === "completed").length}
            </Text>
            <Text style={styles.grayTextSmall}>Completados</Text>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabsList}>
          {(["requests", "analytics"] as const).map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setTab(key)}
              style={[
                styles.tabBtn,
                tab === key && { backgroundColor: "#111827" },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === key && { color: "#fbbf24", fontWeight: "700" },
                ]}
              >
                {key === "requests"
                  ? "Solicitudes"

                  : "Estadísticas"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB: SOLICITUDES */}
        {tab === "requests" && (
          <View style={{ gap: 12 }}>
            {requests.some((r) => r.status === "pending") && (
              <View style={[styles.card, styles.cardWarn]}>
                <View style={styles.rowCenter}>
                  <Bell size={16} color="#fbbf24" />
                  <Text style={[styles.warnText, { marginLeft: 8 }]}>
                    Tienes{" "}
                    {requests.filter((r) => r.status === "pending").length}{" "}
                    solicitudes pendientes
                  </Text>
                </View>
              </View>
            )}

            {requests.map((req) => {
              const pill = getStatusPill(req.status);
              return (
                <View key={req.id} style={styles.card}>
                  <View style={[styles.rowBetween, { marginBottom: 10 }]}>
                    <View style={styles.rowCenter}>
                      <View style={styles.smallAvatar}>
                        <Text style={styles.smallAvatarText}>
                          {req.client.charAt(0)}
                        </Text>
                      </View>

                      <View>
                        <View style={[styles.rowCenter, { gap: 8 }]}>
                          <Text style={styles.title}>{req.client}</Text>
                          {req.urgent && (
                            <View style={styles.badgeDanger}>
                              <Text style={styles.badgeDangerText}>
                                Urgente
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.grayTextSmall}>{req.service}</Text>
                        <Text style={styles.grayTextSmall}>{req.location}</Text>
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          color: "#34d399",
                          fontWeight: "600",
                        }}
                      >
                        {req.price}
                      </Text>

                      <View style={[styles.pill, { borderColor: pill.color }]}>
                        <pill.Icon size={12} color={pill.color} />
                        <Text style={[styles.pillText, { color: pill.color }]}>
                          {pill.text}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Fila inferior: fecha + acciones */}
                  <View style={styles.footerRow}>
                    <Text style={styles.grayTextSmall}>
                      {req.date} • {req.time}
                    </Text>

                    <View style={styles.actionRow}>
                      {req.status === "pending" && (
                        <>
                          <TouchableOpacity
                            style={styles.btnOutlineSm}
                            onPress={() => handleReject(req)}
                          >
                            <Text style={styles.btnOutlineText}>Rechazar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.btnPrimarySm}
                            onPress={() => handleAccept(req)}
                          >
                            <Text style={styles.btnPrimaryText}>Aceptar</Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {req.status === "accepted" && (
                        <TouchableOpacity
                          style={styles.btnOutlineSm}
                          onPress={() => openScheduleModal(req)}
                        >
                          <Calendar size={14} color="#e5e7eb" />
                          <Text style={styles.btnOutlineText}> Programar</Text>
                        </TouchableOpacity>
                      )}

                      {req.status === "completed" && (
                        <TouchableOpacity style={styles.btnOutlineSm}>
                          <Eye size={14} color="#e5e7eb" />
                          <Text style={styles.btnOutlineText}>
                            {" "}
                            Ver detalles
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

       

        {/* TAB: ANALYTICS */}
        {tab === "analytics" && (
          <View style={{ gap: 12 }}>
            <View style={styles.card}>
              <Text style={styles.title}>Rendimiento del Mes</Text>
              <View style={{ marginTop: 10, gap: 10 }}>
                <KV
                  label="Trabajos completados"
                  value={String(stats.completed)}
                />
                <KV
                  label="Ingresos totales"
                  value={
                    stats.income > 0 ? `$${stats.income.toFixed(2)}` : "$0"
                  }
                  valueColor="#34d399"
                />
                <KV
                  label="Tiempo de respuesta promedio"
                  value={providerData.responseTime}
                />
                <KV
                  label="Calificación promedio"
                  value={`${providerData.rating}/5.0`}
                />
              </View>
            </View>

<View style={styles.card}>
  <Text style={styles.title}>Reseñas Recientes</Text>

  <View style={{ gap: 12, marginTop: 10 }}>
    {providerData.reviewsList && providerData.reviewsList.length > 0 ? (
      providerData.reviewsList.map((r, i) => (
        <View key={i} style={styles.row}>
          {/* Avatar */}
          <View style={styles.smallAvatar}>
            {r.usuario?.avatar ? (
              <Image
                source={{ uri: r.usuario.avatar }}
                style={{ width: "100%", height: "100%", borderRadius: 999 }}
              />
            ) : (
              <Text style={styles.smallAvatarText}>
                {r.usuario?.nombre?.charAt(0) || "?"}
              </Text>
            )}
          </View>

          {/* Info */}
          <View style={{ marginLeft: 10, flex: 1 }}>
            <View style={[styles.rowCenter, { gap: 8, marginBottom: 4 }]}>
              <Text style={styles.titleSm}>
                {r.usuario?.nombre || "Usuario"}
              </Text>

              <View style={styles.row}>
                {Array.from({ length: r.calificacion }).map((_, i2) => (
                  <Star
                    key={i2}
                    size={12}
                    color="#fbbf24"
                    fill="#fbbf24"
                  />
                ))}
              </View>
            </View>

            <Text style={styles.grayTextSmall}>
              {r.comentario}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={{ color: "#9ca3af" }}>Aún no hay reseñas.</Text>
    )}
  </View>
</View>


          </View>
        )}
      </ScrollView>

      {/* MODAL: ACEPTADO */}
      <Modal
        visible={acceptedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAcceptedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.modalContainerLg]}>
            <View style={styles.modalHeaderIcon}>
              <CheckCircle2 size={28} color="#34d399" />
            </View>

            <Text style={styles.modalTitle}>¡Felicidades!</Text>
            <Text style={styles.modalSubtitle}>Aceptaste el trabajo</Text>

            {acceptedRequest && (
              <View style={styles.modalDetails}>
                <Row label="Cliente" value={acceptedRequest.client} />
                <Row label="Servicio" value={acceptedRequest.service} />
                <Row
                  label="Cuándo"
                  value={`${acceptedRequest.date} • ${acceptedRequest.time}`}
                />
                <Row label="Ubicación" value={acceptedRequest.location} />
                <Row label="Precio estimado" value={acceptedRequest.price} />
              </View>
            )}

            <Text style={styles.modalHint}>
              Coordina detalles (punto exacto, acceso, materiales) por WhatsApp:
            </Text>

            {acceptedRequest && (
              <TouchableOpacity
                style={styles.btnWhatsapp}
                onPress={() => openWhatsAppAcceptance(acceptedRequest)}
              >
                <MessageCircle size={16} color="#fff" />
                <Text style={styles.btnWhatsappText}>
                  Coordinar por WhatsApp
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.btnGhost}
              onPress={() => setAcceptedModalVisible(false)}
            >
              <Text style={styles.btnGhostText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
{/* MODAL: FINALIZACIÓN DEL SERVICIO */}
<Modal
  visible={finishModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setFinishModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContainer, styles.modalContainerLg]}>
      
      <View style={styles.modalHeaderIcon}>
        <CheckCircle size={32} color="#34d399" />
      </View>

      <Text style={styles.modalTitle}>¡Servicio finalizado!</Text>
      <Text style={styles.modalSubtitle}>
        Esperamos que el trabajo haya salido perfecto. 🎉
      </Text>

      <TouchableOpacity
        style={styles.btnGhost}
        onPress={() => setFinishModalVisible(false)}
      >
        <Text style={styles.btnGhostText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      {/* MODAL: PROGRAMAR */}
      <Modal
        visible={scheduleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.modalContainerLg]}>
            <View style={styles.modalHeaderIcon}>
              <Calendar size={28} color="#60a5fa" />
            </View>

            <Text style={styles.modalTitle}>Programar visita</Text>
            <Text style={styles.modalSubtitle}>
              Propón fecha y hora para coordinar con el cliente
            </Text>

            <View
              style={{
                alignSelf: "stretch",
                gap: 10,
                marginTop: 8,
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="Fecha (YYYY-MM-DD)"
                placeholderTextColor="#9ca3af"
                value={schedDate}
                onChangeText={setSchedDate}
              />
              <TextInput
                style={styles.input}
                placeholder="Hora (HH:mm)"
                placeholderTextColor="#9ca3af"
                value={schedTime}
                onChangeText={setSchedTime}
              />
              <TextInput
                style={styles.input}
                placeholder="Duración (horas) — ej. 2"
                placeholderTextColor="#9ca3af"
                value={schedDuration}
                onChangeText={setSchedDuration}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Ubicación"
                placeholderTextColor="#9ca3af"
                value={schedLocation}
                onChangeText={setSchedLocation}
              />
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: "top" }]}
                placeholder="Nota opcional para el cliente (materiales, acceso, referencias...)"
                placeholderTextColor="#9ca3af"
                multiline
                value={schedNote}
                onChangeText={setSchedNote}
              />
            </View>

            <TouchableOpacity
              style={[styles.btnWhatsapp, { marginTop: 12 }]}
              onPress={openWhatsAppSchedule}
            >
              <MessageCircle size={16} color="#fff" />
              <Text style={styles.btnWhatsappText}>Proponer por WhatsApp</Text>
            </TouchableOpacity>

{/* GUARDAR la programación */}
<TouchableOpacity style={styles.btnGhost} onPress={saveSchedule}>
  <Text style={styles.btnGhostText}>Guardar programación</Text>
</TouchableOpacity>

{/* FINALIZAR SERVICIO */}
<TouchableOpacity
  style={[styles.btnWhatsapp, { backgroundColor: "#34d399", marginTop: 4 }]}
  onPress={() => {
    updateRequestStatusBackend(scheduleRequest!, "completed");
    setScheduleModalVisible(false);
    setFinishModalVisible(true);
  }}
>
  <CheckCircle size={16} color="#fff" />
  <Text style={styles.btnWhatsappText}>Dar por finalizado</Text>
</TouchableOpacity>

            <TouchableOpacity
              style={styles.btnGhost}
              onPress={() => setScheduleModalVisible(false)}
            >
              <Text style={styles.btnGhostText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------- SUBCOMPONENTES ----------
function Field({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function KV({
  label,
  value,
  valueColor = "#e5e7eb",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.rowBetween}>
      <Text style={styles.grayText}>{label}</Text>
      <Text style={[styles.fieldValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rowLine}>
      <Text style={styles.rowLineLabel}>{label}</Text>
      <Text style={styles.rowLineValue}>{value}</Text>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0b0b0b" },

  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#0f0f10",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(251,191,36,0.2)",
  },

  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.25)",
    backgroundColor: "#111113",
    marginRight: 4,
  },

  avatarWrap: { width: 64, height: 64, borderRadius: 999, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: {
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: { color: "#e5e7eb", fontWeight: "700" },

  providerName: { color: "white", fontWeight: "700", fontSize: 16 },
  providerSubtitle: { color: "#9ca3af", fontSize: 13 },

  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: { flexDirection: "row", alignItems: "center" },

  ratingText: {
    color: "#e5e7eb",
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 12,
  },
  grayText: { color: "#9ca3af" },
  grayTextSmall: { color: "#9ca3af", fontSize: 12 },

  badgeSecondary: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(251,191,36,0.15)",
  },
  badgeSecondaryText: {
    color: "#fbbf24",
    fontSize: 10,
    fontWeight: "700",
  },

  btnOutlineSm: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.4)",
    backgroundColor: "transparent",
    borderRadius: 10,
    flexDirection: "row",
  },
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  btnOutlineText: { color: "#e5e7eb", fontWeight: "600", fontSize: 12 },

  statusCard: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#0f0f10",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(251,191,36,0.2)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusTitle: { color: "#e5e7eb", fontWeight: "700" },

  switchBase: {
    width: 42,
    height: 24,
    borderRadius: 999,
    padding: 2,
    justifyContent: "center",
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#111827",
  },

  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 12 },

  card: {
    backgroundColor: "#0f0f10",
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.2)",
    alignSelf: "stretch",
    paddingBottom: 14,
  },
  cardStat: { flex: 1 },
  statNumber: { fontSize: 22, fontWeight: "800" },

  tabsList: {
    flexDirection: "row",
    backgroundColor: "#0f0f10",
    borderRadius: 999,
    padding: 4,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.2)",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  tabText: { color: "#e5e7eb", fontWeight: "600" },

  cardWarn: {
    borderColor: "rgba(251,191,36,0.4)",
    backgroundColor: "rgba(251,191,36,0.06)",
  },
  warnText: { color: "#fbbf24", fontWeight: "600" },

  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  smallAvatarText: { color: "#e5e7eb", fontWeight: "700" },

  title: { color: "#e5e7eb", fontWeight: "700" },
  titleSm: { color: "#e5e7eb", fontWeight: "700", fontSize: 13 },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
    borderWidth: 1,
  },
  pillText: { fontSize: 11, fontWeight: "700" },

  btnPrimarySm: {
    backgroundColor: "#fbbf24",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnPrimaryText: { color: "#111827", fontWeight: "700", fontSize: 12 },

  footerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 8,
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },

  badgeDanger: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeDangerText: { color: "white", fontSize: 10, fontWeight: "700" },

  fieldLabel: { color: "#9ca3af", fontSize: 12 },
  fieldValue: { color: "#e5e7eb", fontWeight: "600", marginTop: 2 },

  badgeWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  badgeChip: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeChipText: { color: "#e5e7eb", fontSize: 12 },

  // ------- Modales -------
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 18,
  },
  modalContainer: {
    backgroundColor: "#1b1b1b",
    padding: 20,
    borderRadius: 16,
    width: "86%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24,
    elevation: 10,
  },
  modalContainerLg: {
    gap: 10,
  },
  modalHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  modalSubtitle: { color: "#cbd5e1", fontSize: 13, marginTop: -6 },
  modalHint: {
    color: "#cbd5e1",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },

  modalDetails: {
    alignSelf: "stretch",
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  rowLine: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLineLabel: { color: "#9ca3af", fontSize: 12 },
  rowLineValue: { color: "#e5e7eb", fontWeight: "700", fontSize: 13 },

  // Botón WhatsApp verde
  btnWhatsapp: {
    alignSelf: "stretch",
    marginTop: 6,
    backgroundColor: "#25D366",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnWhatsappText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.2,
  },

  // Botón ghost
  btnGhost: {
    alignSelf: "stretch",
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostText: { color: "#e5e7eb", fontWeight: "700" },

  // Inputs modal
  input: {
    width: "100%",
    height: 48,
    borderColor: "#2b2b2b",
    borderWidth: 1,
    color: "#fff",
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 15,
    backgroundColor: "#151515",
  },
});
