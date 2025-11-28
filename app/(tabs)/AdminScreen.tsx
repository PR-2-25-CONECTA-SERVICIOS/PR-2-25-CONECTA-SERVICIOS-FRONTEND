// --------------- IMPORTS ---------------
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

// ---------------- CONSTANTES ------------------
const API_URL = "http://192.168.0.6:3000/api/locales";
const CATEGORY_URL = "http://192.168.0.6:3000/api/categorias";

// ---------------- TIPOS ------------------
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
  userId: string;   // 👈 NUEVO: ID del usuario que reclama
}


// =======================================================
//                     COMPONENTE PRINCIPAL
// =======================================================
export default function AdminScreen() {
  const { width } = useWindowDimensions();

  // ---------- estados categorías ----------
  const [categoryModal, setCategoryModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // ACORDEÓN
  const [catOpen, setCatOpen] = useState(false);

  // ---------- estados reclamos ----------
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

  // =======================================================
  //            CATEGORÍAS (Backend real)
  // =======================================================
  const loadCategories = async () => {
    try {
      const res = await fetch(CATEGORY_URL);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.log("❌ Error cargando categorías:", err);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`${CATEGORY_URL}/${id}`, { method: "DELETE" });
      loadCategories();
    } catch (err) {
      console.log("❌ Error eliminando categoría:", err);
    }
  };

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCatName(cat.nombre);
    setCatDesc(cat.descripcion || "");
    setCategoryModal(true);
  };

  // =======================================================
  //            RECLAMOS (backend real)
  // =======================================================
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
  loadCategories();

  // 🔁 Auto-refresh cada 5 segundos
  const interval = setInterval(() => {
    loadClaims();
  }, 5000);

  return () => clearInterval(interval);
}, []);


  // Stats KPI
  const stats = useMemo(
    () => ({
      pending: claims.filter((c) => c.estado === "pendiente").length,
      approved: claims.filter((c) => c.estado === "aprobado").length,
      rejected: claims.filter((c) => c.estado === "rechazado").length,
    }),
    [claims]
  );

  // Filtro de reclamos
  const filtered = useMemo(() => {
    const base = claims.filter(
      (r) =>
        r.businessName.toLowerCase().includes(search.toLowerCase()) ||
        r.nombrePropietario.toLowerCase().includes(search.toLowerCase())
    );

    if (tab === "all") return base;
    return base.filter((r) => r.estado === tab);
  }, [search, tab, claims]);

  // Aprobación
const approveClaim = async (item: ClaimItem) => {
  try {
    await fetch(`${API_URL}/${item.localId}/reclamos/${item.claimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado: "aprobado",
        verificado: true,
        userId: item.userId,          // 👈 PASARLO EXPLÍCITO
      }),
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
      body: JSON.stringify({
        estado: "rechazado",
        verificado: false,
        userId: item.userId,          // (opcional pero consistente)
      }),
    });
    setConfirm(null);
    setSelected(null);
    loadClaims();
  } catch (err) {
    console.log("❌ Error rechazando reclamo:", err);
  }
};

  // =======================================================
  //                      RENDER
  // =======================================================

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
    const map: any = {
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
          <Text style={styles.h2}>Gestión de categorías y solicitudes</Text>
        </View>

        <Badge tone="warn">
          <AlertTriangle size={14} color="#fbbf24" />
          <Text style={styles.badgeText}> {stats.pending} pendientes</Text>
        </Badge>
      </View>

      {/* =======================================================
               SCROLLVIEW CONTENIDO
      ======================================================= */}
      <ScrollView style={{ padding: 16 }}>
        {/* =======================================================
                    ACORDEÓN DE CATEGORÍAS
        ======================================================= */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setCatOpen(!catOpen)}
        >
          <Card
            style={{
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.h1}>Administrar Categorías</Text>

            <Text
              style={{
                color: "#fbbf24",
                fontSize: 22,
                transform: [{ rotate: catOpen ? "180deg" : "0deg" }],
              }}
            >
              ▼
            </Text>
          </Card>
        </TouchableOpacity>

        {/* ----- CONTENIDO DESPLEGABLE ----- */}
        {catOpen && (
          <View style={{ marginTop: 16, gap: 16 }}>
            {/* BOTÓN AGREGAR */}
            <Card>
              <View style={{ padding: 14 }}>
                <Btn
                  style={{ width: 150 }}
                  onPress={() => {
                    setEditingCategory(null);
                    setCatName("");
                    setCatDesc("");
                    setCategoryModal(true);
                  }}
                >
                  <Text style={{ color: "#111827", fontWeight: "900" }}>
                    Nueva Categoría
                  </Text>
                </Btn>
              </View>
            </Card>

            {/* LISTA CATEGORÍAS */}
            <Card>
              <View style={{ padding: 14 }}>
                <Text
                  style={{
                    color: "#fbbf24",
                    fontWeight: "900",
                    marginBottom: 10,
                  }}
                >
                  Categorías Registradas
                </Text>

                {categories.length === 0 && (
                  <Text style={{ color: "#6b7280" }}>
                    No hay categorías aún.
                  </Text>
                )}

                {categories.map((cat) => (
                  <View
                    key={cat._id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderColor: "rgba(148,163,184,0.15)",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      {cat.nombre}
                    </Text>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Btn
                        variant="outline"
                        size="sm"
                        onPress={() => openEditCategory(cat)}
                      >
                        <Text style={{ color: "#fbbf24" }}>Editar</Text>
                      </Btn>

                      <Btn
                        variant="outline"
                        size="sm"
                        onPress={() => deleteCategory(cat._id)}
                      >
                        <Text style={{ color: "#f87171" }}>Eliminar</Text>
                      </Btn>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* =======================================================
                      SECCIÓN RECLAMOS
        ======================================================= */}

        <Text style={[styles.h1, { marginTop: 28 }]}>
          Solicitudes de Reclamo
        </Text>
        <Text style={styles.h2}>
          Aprobación y revisión de reclamos enviados
        </Text>

        {/* SEARCH */}
        <View style={{ marginTop: 16 }}>
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

        {/* KPI */}
        <View style={[styles.kpiWrap, { marginTop: 20 }]}>
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
        <View style={{ marginTop: 18 }}>
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
        </View>

        {/* LISTA RECLAMOS */}
        <View style={{ marginTop: 16, gap: 14 }}>
          {filtered.map((r) => {
            const showThumbInline = width >= 520;
            const showThumbAbove = !showThumbInline && !isNarrow;
            const hideThumb = isNarrow;

            return (
              <Card key={r.claimId} style={styles.cardShadow}>
                <View style={{ padding: 16 }}>
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
                            {statusText[r.estado]}
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

                      <View style={[styles.actionWrap, { marginTop: 12 }]}>
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

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* =======================================================
                    MODALES
      ======================================================= */}

      {/* Modal: Detalles de Reclamo */}
      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalOverlay} />
        {selected && (
          <View style={styles.modalCenter}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Detalles de Solicitud</Text>

              <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
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

              <View style={{ marginTop: 14 }}>
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

              <View style={{ marginTop: 12 }}>
                <Text style={styles.subTitle}>Mensaje</Text>
                <Text style={styles.body}>{selected.mensaje}</Text>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.subTitle}>Documentos</Text>

                {selected.documentos.length === 0 && (
                  <Text style={styles.bodySm}>
                    No se adjuntaron documentos.
                  </Text>
                )}

                {selected.documentos.map((d, i) => (
                  <TouchableOpacity
                    key={i}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      backgroundColor: "#111827",
                      borderRadius: 10,
                      marginTop: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    onPress={() => {
                      // Abrirá el documento en otra pestaña (web)
                      window.open(d, "_blank");
                    }}
                  >
                    <Text style={{ color: "#e5e7eb", flex: 1 }}>
                      📄 Documento {i + 1}
                    </Text>

                    <Text
                      style={{
                        color: "#fbbf24",
                        fontWeight: "900",
                        fontSize: 12,
                      }}
                    >
                      Descargar
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Btn
                variant="outline"
                style={{ marginTop: 16 }}
                onPress={() => setSelected(null)}
              >
                <Text style={styles.btnText}>Cerrar</Text>
              </Btn>
            </View>
          </View>
        )}
      </Modal>

      {/* Modal: Confirmación */}
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
                solicitud de:{"\n"}
                <Text style={styles.bold}>{confirm.item.businessName}</Text>?
              </Text>

              <View style={[styles.actionWrap, { marginTop: 16 }]}>
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

      {/* Modal Categoría */}
      <Modal visible={categoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay} />

        <View style={styles.modalCenter}>
          <View style={[styles.modalCard, { maxWidth: 420 }]}>
            <Text style={styles.modalTitle}>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </Text>

            <Text style={styles.subTitle}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={catName}
              onChangeText={setCatName}
              placeholder="Ej: Comida, Belleza, Servicios…"
              placeholderTextColor="#6b7280"
            />

            <Text style={[styles.subTitle, { marginTop: 10 }]}>
              Descripción
            </Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={catDesc}
              onChangeText={setCatDesc}
              placeholder="Descripción breve (opcional)"
              placeholderTextColor="#6b7280"
            />

            <View style={[styles.actionWrap, { marginTop: 18 }]}>
              <Btn
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => {
                  setCategoryModal(false);
                  setEditingCategory(null);
                  setCatName("");
                  setCatDesc("");
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </Btn>

              <Btn
                style={{ flex: 1 }}
                onPress={async () => {
                  if (!catName.trim()) return;

                  try {
                    let endpoint = CATEGORY_URL;
                    let method = "POST";

                    if (editingCategory) {
                      endpoint = `${CATEGORY_URL}/${editingCategory._id}`;
                      method = "PATCH";
                    }

                    await fetch(endpoint, {
                      method,
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        nombre: catName,
                        descripcion: catDesc,
                      }),
                    });

                    await loadCategories();
                    setCategoryModal(false);
                    setEditingCategory(null);
                    setCatName("");
                    setCatDesc("");
                  } catch (err) {
                    console.log("❌ Error guardando categoría:", err);
                  }
                }}
              >
                <Text style={[styles.btnText, { color: "#111827" }]}>
                  Guardar
                </Text>
              </Btn>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =======================================================
//                    COMPONENTES REUSABLES
// =======================================================

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
        <Text style={{ color, fontSize: 24, fontWeight: "900" }}>{value}</Text>
        <Text style={{ color: "#a1a1aa", fontSize: 12 }}>{label}</Text>
      </View>
    </Card>
  );
}

function Badge({ children, tone = "soft" }: any) {
  const colors = {
    soft: { bg: "rgba(148,163,184,0.12)", bd: "rgba(148,163,184,0.2)" },
    ok: { bg: "rgba(52,211,153,0.15)", bd: "rgba(52,211,153,0.35)" },
    danger: { bg: "rgba(248,113,113,0.15)", bd: "rgba(248,113,113,0.35)" },
    warn: { bg: "rgba(251,191,36,0.12)", bd: "rgba(251,191,36,0.35)" },
    outline: { bg: "transparent", bd: "rgba(148,163,184,0.28)" },
  };

  const map = (colors as any)[tone];

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

// =======================================================
//                     STYLES
// =======================================================
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

  input: {
    backgroundColor: "#111827",
    borderColor: "#30363d",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    color: "#e5e7eb",
    marginTop: 6,
  },

  h1: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  h2: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  badgeText: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "900",
  },

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
