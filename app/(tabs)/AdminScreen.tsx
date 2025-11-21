import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Eye,
  Search,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const API_URL = "http://localhost:3000/api/locales"; // 🔥 CAMBIA ESTO

/* ================== TIPOS ================== */
type Status = "pendiente" | "aprobado" | "rechazado";

interface ClaimItem {
  claimId: string;
  localId: string;

  businessName: string;
  category: string;
  businessImage: string;

  nombrePropietario: string;
  correo: string;
  telefono: string;
  mensaje: string;
  documentos: string[];

  estado: Status;
  fecha: string;
}

/* ================== PANTALLA ================== */
export default function AdminScreen() {
  const { width } = useWindowDimensions();

  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<ClaimItem | null>(null);
  const [confirm, setConfirm] = useState<{
    type: "approve" | "reject";
    item: ClaimItem | null;
  } | null>(null);

  const isNarrow = width < 380;
  const kpiBasis = width >= 900 ? "33%" : width >= 520 ? "48%" : "100%";

  /* ============================================================
     🔥 1. Cargar reclamos reales desde backend
  ============================================================ */
  const loadClaims = async () => {
    try {
      const res = await fetch(`${API_URL}/reclamos/todos`);
      const data = await res.json();
      setClaims(data);
    } catch (err) {
      console.log("❌ Error cargando reclamos:", err);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  /* ============================================================
     📊 2. Stats
  ============================================================ */
  const stats = useMemo(() => {
    return {
      pending: claims.filter((c) => c.estado === "pendiente").length,
      approved: claims.filter((c) => c.estado === "aprobado").length,
      rejected: claims.filter((c) => c.estado === "rechazado").length,
    };
  }, [claims]);

  /* ============================================================
     🔎 3. Filtrar lista
  ============================================================ */
  const filtered = useMemo(() => {
    const base = claims.filter(
      (r) =>
        r.businessName.toLowerCase().includes(search.toLowerCase()) ||
        r.nombrePropietario.toLowerCase().includes(search.toLowerCase())
    );
    if (tab === "all") return base;
    return base.filter((r) => r.estado === tab);
  }, [search, tab, claims]);

  /* ============================================================
     🟢 4. Aprobar / Rechazar reclamo
  ============================================================ */
  const approveClaim = async (item: ClaimItem) => {
    try {
      await fetch(`${API_URL}/${item.localId}/reclamos/${item.claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "aprobado" }),
      });
      setConfirm(null);
      setSelected(null);
      loadClaims();
    } catch (err) {
      console.log("❌ Error aprobando reclamo:", err);
    }
  };

  const rejectClaim = async (item: ClaimItem) => {
    try {
      await fetch(`${API_URL}/${item.localId}/reclamos/${item.claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "rechazado" }),
      });
      setConfirm(null);
      setSelected(null);
      loadClaims();
    } catch (err) {
      console.log("❌ Error rechazando reclamo:", err);
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  const statusText = {
    pendiente: "Pendiente",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
  };

  const statusTone: Record<
    "pending" | "approved" | "rejected",
    "soft" | "ok" | "danger"
  > = {
    pending: "soft",
    approved: "ok",
    rejected: "danger",
  };

  const normalizeStatus = (
    estado: string
  ): "pending" | "approved" | "rejected" => {
    const map: Record<string, "pending" | "approved" | "rejected"> = {
      pendiente: "pending",
      aprobado: "approved",
      rechazado: "rejected",
    };

    return map[estado] ?? "pending";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>Panel de Administración</Text>
          <Text style={styles.h2}>Gestión de solicitudes de reclamo</Text>
        </View>

        <Badge tone="warn">
          <AlertTriangle size={14} color="#fbbf24" />
          <Text style={styles.badgeText}> {stats.pending} pendientes</Text>
        </Badge>
      </View>

      {/* SEARCH */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View style={styles.searchWrap}>
          <Search size={16} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por negocio o solicitante…"
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* LISTA */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
          rowGap: 10,
        }}
      >
        {/* STATS */}
        <View style={styles.kpiWrap}>
          <KpiCard
            label="Pendientes"
            value={stats.pending}
            color="#fbbf24"
            basis={kpiBasis}
          />
          <KpiCard
            label="Aprobados"
            value={stats.approved}
            color="#34d399"
            basis={kpiBasis}
          />
          <KpiCard
            label="Rechazados"
            value={stats.rejected}
            color="#f87171"
            basis={kpiBasis}
          />
        </View>

        {/* TABS */}
        <Segmented
          value={tab}
          onChange={setTab}
          items={[
            { key: "all", label: "Todos" },
            { key: "pendiente", label: "Pendientes" },
            { key: "aprobado", label: "Aprobados" },
            { key: "rechazado", label: "Rechazados" },
          ]}
        />

        {/* CARDS */}
        <View style={{ marginTop: 12, gap: 12 }}>
          {filtered.map((r) => {
            const showThumbInline = width >= 520;
            const showThumbAbove = !showThumbInline && !isNarrow;
            const hideThumb = isNarrow;

            return (
              <Card key={r.claimId} style={styles.cardShadow}>
                <View style={{ padding: 14 }}>
                  {showThumbAbove && (
                    <ImageWithFallback
                      src={r.businessImage}
                      style={styles.thumbTop}
                    />
                  )}

                  <View
                    style={[
                      { flexDirection: "row", columnGap: 12 },
                      (hideThumb || showThumbAbove) && {
                        flexDirection: "column",
                      },
                    ]}
                  >
                    {showThumbInline && (
                      <ImageWithFallback
                        src={r.businessImage}
                        style={styles.thumb}
                      />
                    )}

                    <View style={{ flex: 1 }}>
                      <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.title}>{r.businessName}</Text>
                          <Text style={styles.muted}>
                            {r.nombrePropietario}
                          </Text>
                          <Text style={styles.muted}>{r.correo}</Text>
                        </View>

                        <Badge tone={statusTone[normalizeStatus(r.estado)]}>
                          <Text style={styles.badgeText}>
                            <Text style={styles.badgeText}>
                              {statusText[r.estado]}
                            </Text>
                          </Text>
                        </Badge>
                      </View>

                      <Text style={styles.body} numberOfLines={2}>
                        {r.mensaje}
                      </Text>

                      <View style={[styles.footerMeta, { marginTop: 10 }]}>
                        <Calendar size={12} color="#9ca3af" />
                        <Text style={styles.metaText}>
                          {" "}
                          {new Date(r.fecha).toLocaleDateString("es-ES")}
                        </Text>
                      </View>

                      {/* BOTONES */}
                      <View style={[styles.actionWrap, { marginTop: 10 }]}>
                        <Btn
                          variant="outline"
                          size="sm"
                          onPress={() => setSelected(r)}
                        >
                          <Eye size={12} color="#e5e7eb" />
                          <Text style={styles.btnText}> Ver</Text>
                        </Btn>

                        {r.estado === "pendiente" && (
                          <>
                            <Btn
                              variant="outline"
                              size="sm"
                              onPress={() =>
                                setConfirm({ type: "reject", item: r })
                              }
                            >
                              <XCircle size={12} color="#e5e7eb" />
                              <Text style={styles.btnText}> Rechazar</Text>
                            </Btn>

                            <Btn
                              size="sm"
                              onPress={() =>
                                setConfirm({ type: "approve", item: r })
                              }
                            >
                              <CheckCircle size={12} color="#111827" />
                              <Text
                                style={[styles.btnText, { color: "#111827" }]}
                              >
                                {" "}
                                Aprobar
                              </Text>
                            </Btn>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* MODAL DETALLE */}
      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalOverlay} />
        {selected && (
          <View style={styles.modalCenter}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Detalles de Solicitud</Text>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <ImageWithFallback
                  src={selected.businessImage}
                  style={styles.thumbLg}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{selected.businessName}</Text>
                  <Text style={styles.muted}>{selected.category}</Text>
                  <Badge tone={statusTone[normalizeStatus(selected.estado)]}>
                    <Text style={styles.badgeText}>
                      {statusText[selected.estado]}
                    </Text>
                  </Badge>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.subTitle}>Información del solicitante</Text>
                <Text style={styles.bodySm}>
                  <Text style={styles.bold}>Nombre: </Text>
                  {selected.nombrePropietario}
                </Text>
                <Text style={styles.bodySm}>
                  <Text style={styles.bold}>Email: </Text>
                  {selected.correo}
                </Text>
                <Text style={styles.bodySm}>
                  <Text style={styles.bold}>Teléfono: </Text>
                  {selected.telefono}
                </Text>
              </View>

              <View style={{ marginTop: 10 }}>
                <Text style={styles.subTitle}>Mensaje</Text>
                <Text style={styles.body}>{selected.mensaje}</Text>
              </View>

              <View style={{ marginTop: 10 }}>
                <Text style={styles.subTitle}>Documentos</Text>
                {selected.documentos.map((d, i) => (
                  <Text key={i} style={styles.bodySm}>
                    📄 {d}
                  </Text>
                ))}
              </View>

              <Btn
                variant="outline"
                style={{ marginTop: 14 }}
                onPress={() => setSelected(null)}
              >
                <Text style={styles.btnText}>Cerrar</Text>
              </Btn>
            </View>
          </View>
        )}
      </Modal>

      {/* MODAL CONFIRMACIÓN */}
      <Modal visible={!!confirm} transparent animationType="fade">
        <View style={styles.modalOverlay} />
        {confirm?.item && (
          <View style={styles.modalCenter}>
            <View style={[styles.modalCard, { maxWidth: 420 }]}>
              <Text style={styles.modalTitle}>
                {confirm.type === "approve"
                  ? "Aprobar solicitud"
                  : "Rechazar solicitud"}
              </Text>
              <Text style={styles.modalDesc}>
                ¿Seguro que deseas{" "}
                {confirm.type === "approve" ? "aprobar" : "rechazar"} la
                solicitud de:
                {"\n"}
                <Text style={styles.bold}>{confirm.item.businessName}</Text>?
              </Text>

              <View style={[styles.actionWrap, { marginTop: 14 }]}>
                <Btn
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={() => setConfirm(null)}
                >
                  <Text style={styles.btnText}>Cancelar</Text>
                </Btn>

                <Btn
                  style={{
                    flex: 1,
                    backgroundColor:
                      confirm.type === "approve" ? "#34d399" : "#f87171",
                  }}
                  onPress={() =>
                    confirm.type === "approve"
                      ? approveClaim(confirm.item!)
                      : rejectClaim(confirm.item!)
                  }
                >
                  {confirm.type === "approve" ? (
                    <CheckCircle size={14} color="#111827" />
                  ) : (
                    <XCircle size={14} color="#111827" />
                  )}
                  <Text style={[styles.btnText, { color: "#111827" }]}>
                    Confirmar
                  </Text>
                </Btn>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

/* ============================================================
   COMPONENTES REUSABLES
============================================================ */

function Card({ children, style }: any) {
  return (
    <View
      style={[
        {
          backgroundColor: "#0f0f10",
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "rgba(148,163,184,0.18)",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function KpiCard({ label, value, color, basis }: any) {
  return (
    <Card style={{ flexBasis: basis, flexGrow: 1 }}>
      <View style={styles.kpiCard}>
        <Text
          style={{ color, fontSize: 24, fontWeight: "900", letterSpacing: 0.2 }}
        >
          {value}
        </Text>
        <Text style={{ color: "#a1a1aa", fontSize: 12 }}>{label}</Text>
      </View>
    </Card>
  );
}

function Badge({
  children,
  tone = "soft",
}: {
  children: React.ReactNode;
  tone?: "soft" | "ok" | "danger" | "warn" | "outline";
}) {
  const colors: Record<
    "soft" | "ok" | "danger" | "warn" | "outline",
    { bg: string; bd: string }
  > = {
    soft: { bg: "rgba(148,163,184,0.12)", bd: "rgba(148,163,184,0.2)" },
    ok: { bg: "rgba(52,211,153,0.15)", bd: "rgba(52,211,153,0.35)" },
    danger: { bg: "rgba(248,113,113,0.15)", bd: "rgba(248,113,113,0.35)" },
    warn: { bg: "rgba(251,191,36,0.12)", bd: "rgba(251,191,36,0.35)" },
    outline: { bg: "transparent", bd: "rgba(148,163,184,0.28)" },
  };

  const map = colors[tone];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: map.bg,
        borderColor: map.bd,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
      }}
    >
      {children}
    </View>
  );
}

function Segmented({ value, onChange, items }: any) {
  return (
    <View style={styles.tabs}>
      {items.map((it: any) => (
        <TouchableOpacity
          key={it.key}
          onPress={() => onChange(it.key)}
          style={[
            styles.tabBtn,
            value === it.key && {
              backgroundColor: "#111827",
              borderColor: "rgba(148,163,184,0.25)",
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              value === it.key && { color: "#fbbf24", fontWeight: "900" },
            ]}
          >
            {it.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Btn({
  children,
  style,
  onPress,
  variant = "default",
  size = "md",
}: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          paddingVertical: size === "sm" ? 8 : 11,
          paddingHorizontal: size === "sm" ? 12 : 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        },
        variant === "default"
          ? { backgroundColor: "#fbbf24", borderColor: "#fbbf24" }
          : { backgroundColor: "transparent", borderColor: "#3f3f46" },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={styles.btnText}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

function ImageWithFallback({ src, style }: any) {
  const [err, setErr] = useState(false);
  if (err || !src)
    return <View style={[{ backgroundColor: "#1f2937" }, style]} />;

  return (
    <Image source={{ uri: src }} style={style} onError={() => setErr(true)} />
  );
}

/* ================== STYLES ================== */
const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#0f0f10",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(148,163,184,0.18)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  h1: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  h2: { color: "#9ca3af", fontSize: 12 },

  badgeText: { color: "#e5e7eb", fontSize: 12, fontWeight: "900" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  searchInput: { color: "#e5e7eb", flex: 1, padding: 0 },

  kpiWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  kpiCard: { padding: 14, alignItems: "center", width: "100%" },

  tabs: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#0f0f10",
    borderRadius: 999,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.2)",
  },

  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  tabText: { color: "#e5e7eb", fontWeight: "700" },

  cardShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  thumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  thumbTop: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: "#111827",
    marginBottom: 10,
  },
  thumbLg: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: "#111827",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  title: {
    color: "#f3f4f6",
    fontWeight: "900",
    fontSize: 16,
  },

  muted: { color: "#9ca3af" },
  body: { color: "#d1d5db", marginTop: 4, lineHeight: 20 },
  bodySm: { color: "#cbd5e1", fontSize: 13 },
  subTitle: { color: "#e5e7eb", fontWeight: "800", marginBottom: 4 },
  bold: { fontWeight: "800", color: "#e5e7eb" },

  footerMeta: { flexDirection: "row", alignItems: "center" },
  metaText: { color: "#9ca3af", fontSize: 12 },
  metaDot: { color: "#6b7280", fontSize: 12 },

  actionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  modalCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#0f0f10",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.25)",
    padding: 16,
  },

  modalTitle: {
    color: "#f3f4f6",
    fontWeight: "900",
    fontSize: 18,
  },
  modalDesc: { color: "#a1a1aa", marginTop: 6, lineHeight: 20 },

  btnText: {
    fontWeight: "800",
    color: "#e5e7eb",
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
