// app/(tabs)/BusinessScreen.tsx
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  MapPin,
  Send,
  Star
} from "lucide-react-native";

import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";

// =====================
// CONFIG
// =====================
const API_URL = "http://192.168.0.6:3000/api/locales";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/deqxfxbaa/raw/upload";
const CLOUDINARY_PRESET = "imagescloudexp";

// =====================
// TYPES
// =====================
interface IHours {
  open: string;
  close: string;
}

interface ILocal {
  _id: string;
  nombre: string;
  categoria: string;
  calificacion: number;
  reseñas: number;
  distancia?: string;
  imagen?: string;

  telefono?: string;
  direccion?: string;

  lat?: number;
  lng?: number;

  url?: string;
  fotos?: string[];
  servicios?: string[];
  tagsEspeciales?: string[];

  reclamos?: any[];
  verificado: boolean;
  destacado: boolean;

  creadoPor?: any;
  horas?: {
    mon?: IHours;
    tue?: IHours;
    wed?: IHours;
    thu?: IHours;
    fri?: IHours;
    sat?: IHours;
    sun?: IHours;
  };
}

type DocFile = {
  name: string;
  type: string;
  base64: string;
  uploading: boolean;
};

// =====================
// UNIVERSAL BASE64
// =====================
const getBase64Universal = async (uri: string) => {
  if (Platform.OS === "web") {
    return await new Promise((resolve, reject) => {
      fetch(uri)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result?.toString().split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  }

  return await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });
};

// =====================
// MAIN COMPONENT
// =====================
export default function BusinessScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [local, setLocal] = useState<ILocal | null>(null);

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const [docs, setDocs] = useState<DocFile[]>([]);
  const canSubmit = msg.trim() !== "";

  const myClaim =
    local?.reclamos?.find((r: any) => r.userId === user._id) || null;

  // ==========================
  // LOAD USER PROFILE
  // ==========================
  useEffect(() => {
    if (!user || !user._id) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(
          `http://192.168.0.6:3000/api/usuarios/${user._id}`
        );
        const data = await res.json();
        setProfile({
          name: data.nombre,
          email: data.correo,
          phone: data.telefono || "",
        });
      } catch (err) {
        console.log("❌ Error cargando perfil:", err);
      }
    };

    loadProfile();
  }, [user]);

  // ==========================
  // LOAD LOCAL
  // ==========================
  useFocusEffect(
    useCallback(() => {
      if (id) loadLocal();
    }, [id])
  );

  const loadLocal = async () => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const json = await res.json();
      setLocal(json);
    } catch (err) {
      console.log("❌ Error cargando local:", err);
    }
  };

  // ==========================
  // UPLOAD DOC TO CLOUDINARY
  // ==========================
  const uploadDocumentToCloudinary = async (doc: DocFile) => {
    try {
      const data = new FormData();
      const file64 = `data:${doc.type};base64,${doc.base64}`;

      data.append("file", file64);
      data.append("upload_preset", CLOUDINARY_PRESET);
      data.append("resource_type", "raw");

      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) return null;

      return json.secure_url;
    } catch (err) {
      console.log("❌ Error subiendo documento:", err);
      return null;
    }
  };

  // ==========================
  // SUBMIT CLAIM
  // ==========================
  const submitClaim = async () => {
    try {
      const uploadedDocs: string[] = [];

      for (const doc of docs) {
        const url = await uploadDocumentToCloudinary(doc);
        if (url) uploadedDocs.push(url);
      }

      const res = await fetch(`${API_URL}/${id}/reclamar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          nombrePropietario: profile?.name,
          correo: profile?.email,
          telefono: profile?.phone,
          mensaje: msg,
          documentos: uploadedDocs,
        }),
      });

      await res.json();
      await loadLocal();

      setOpen(false);
      setMsg("");
      setDocs([]);
    } catch (err) {
      console.log("❌ Error enviando reclamo:", err);
    }
  };

  // ==========================
  // LOADING
  // ==========================
  if (!local || !profile) {
    return (
      <View style={styles.loadCenter}>
        <Text style={{ color: "#fff" }}>Cargando...</Text>
      </View>
    );
  }

  // ======================================
  // UI
  // ======================================
  return (
    <View style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      {/* HERO */}
      <View style={{ height: 190, backgroundColor: "#111827" }}>
        <Image
          source={{ uri: local.imagen }}
          style={{ width: "100%", height: "100%" }}
        />

        <TouchableOpacity
          onPress={() => router.push("/LocalesScreen")}
          style={styles.backBtn}
        >
          <ArrowLeft size={18} color="#e5e7eb" />
        </TouchableOpacity>

        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{local.nombre}</Text>
          <Text style={styles.heroSubtitle}>{local.categoria}</Text>
        </View>
      </View>

      {/* SCROLLVIEW */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* ==================== */}
        {/* INFO PRINCIPAL */}
        {/* ==================== */}
        <Card>
          <View style={{ padding: 12 }}>
            <View style={[styles.row, { gap: 6, marginBottom: 10 }]}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.textStrong}>{local.calificacion}</Text>
              <Text style={styles.textMuted}>({local.reseñas} reseñas)</Text>
            </View>

            <RowIcon icon={<MapPin size={16} color="#9ca3af" />}>
              {local.direccion || "Dirección no definida"}
            </RowIcon>
          </View>
        </Card>

        {/* =============================================== */}
        {/* MINI MAPA — SOLO SI VERIFICADO */}
        {/* =============================================== */}
        {local.verificado && local.lat && local.lng && (
          <Card>
            <View style={{ padding: 0 }}>
              <Image
                style={{
                  width: "100%",
                  height: 150,
                  borderTopLeftRadius: 14,
                  borderTopRightRadius: 14,
                }}
                source={{
                  uri: `https://maps.locationiq.com/v3/staticmap?key=pk.7c9595e54972eac7089fd1495d8002d0&center=${local.lat},${local.lng}&zoom=15&size=600x300&markers=${local.lat},${local.lng}`,
                }}
                resizeMode="cover"
              />

              <View style={{ padding: 12 }}>
                <Text style={styles.textStrong}>
                  {local.direccion || "Dirección no disponible"}
                </Text>
                <Text style={[styles.textMuted, { marginTop: 2 }]}>
                  La ubicación es aproximada
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* =============================================== */}
        {/* PROPIETARIO + BOTÓN DE RECLAMO */}
        {/* =============================================== */}
        <Card>
          <View style={{ padding: 12 }}>
            <View style={[styles.rowBetween, { marginBottom: 8 }]}>
              <View style={styles.row}>
                <Avatar initials={"D"} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.textStrong}>
                    {local.creadoPor?.nombre || "Propietario desconocido"}
                  </Text>
                  <Text style={styles.textMuted}>
                    {local.verificado ? "Verificado" : "No verificado"}
                  </Text>
                </View>
              </View>

              {/* Lógica final del botón */}
              {!local.verificado && (
                <>
                  {myClaim && myClaim.estado === "pendiente" && (
                    <BadgePending />
                  )}

                  {myClaim && myClaim.estado === "rechazado" && (
                    <Btn
                      variant="outline"
                      size="sm"
                      onPress={() => setOpen(true)}
                    >
                      <AlertTriangle size={14} color="#e5e7eb" />
                      <Text style={{ color: "#e5e7eb" }}>
                        {"  "}Reclamar negocio
                      </Text>
                    </Btn>
                  )}

                  {!myClaim && (
                    <Btn
                      variant="outline"
                      size="sm"
                      onPress={() => setOpen(true)}
                    >
                      <AlertTriangle size={14} color="#e5e7eb" />
                      <Text style={{ color: "#e5e7eb" }}>
                        {"  "}Reclamar negocio
                      </Text>
                    </Btn>
                  )}
                </>
              )}
            </View>
          </View>
        </Card>

        {/* =============================================== */}
        {/* ADVERTENCIA */}
        {/* =============================================== */}
        {!local.verificado && (
          <Card
            style={{
              borderColor: "rgba(251,191,36,0.35)",
              backgroundColor: "rgba(251,191,36,0.06)",
            }}
          >
            <View style={{ padding: 12 }}>
              <View style={[styles.row, { alignItems: "flex-start", gap: 8 }]}>
                <AlertTriangle size={18} color="#fbbf24" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fbbf24", fontWeight: "700" }}>
                    Negocio no verificado
                  </Text>
                  <Text
                    style={{ color: "#eab308", marginTop: 2, fontSize: 13 }}
                  >
                    El propietario aún no ha reclamado este negocio.
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* =============================================== */}
        {/* EXTRAS (solo si verificado) */}
        {/* =============================================== */}
        {local.verificado && (
          <>
            {/* SITIO WEB */}
            {local.url && (
              <Card>
                <View style={{ padding: 12 }}>
                  <Text style={styles.textStrong}>Sitio web oficial</Text>
                  <TouchableOpacity
                    onPress={() => {
                      let link = local.url!;
                      if (!link.startsWith("http")) {
                        link = "https://" + link;
                      }
                      Linking.openURL(link).catch(() => {});
                    }}
                  >
                    <Text
                      style={{
                        color: "#60a5fa",
                        textDecorationLine: "underline",
                        marginTop: 6,
                      }}
                    >
                      {local.url}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            {/* SERVICIOS */}
            {local.servicios && local.servicios.length > 0 && (
              <Card>
                <View style={{ padding: 12 }}>
                  <Text style={styles.textStrong}>Servicios que ofrece</Text>
                  <View style={[styles.grid2gap, { marginTop: 8 }]}>
                    {local.servicios.map((srv, idx) => (
                      <BadgeSecondary key={idx}>{srv}</BadgeSecondary>
                    ))}
                  </View>
                </View>
              </Card>
            )}

            {/* GALERÍA */}
            {local.fotos && local.fotos.length > 0 && (
              <Card>
                <View style={{ padding: 12 }}>
                  <Text style={styles.textStrong}>Galería del local</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {local.fotos.map((f, idx) => (
                      <ImageWithFallback
                        key={idx}
                        src={f}
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 12,
                          backgroundColor: "#1f2937",
                        }}
                      />
                    ))}
                  </View>
                </View>
              </Card>
            )}

            {/* TAGS */}
            {local.tagsEspeciales && local.tagsEspeciales.length > 0 && (
              <Card>
                <View style={{ padding: 12 }}>
                  <Text style={styles.textStrong}>Hashtags especiales</Text>
                  <View style={[styles.grid2gap, { marginTop: 8 }]}>
                    {local.tagsEspeciales.map((tag, idx) => (
                      <BadgeSecondary key={idx} small>
                        {tag}
                      </BadgeSecondary>
                    ))}
                  </View>
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      {/* ====================== */}
      {/* MODAL DE RECLAMO */}
      {/* ====================== */}
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalOverlay} />

        <View style={styles.modalCenter}>
          <View style={styles.claimModalCard}>
            <Text style={styles.claimTitle}>Reclamar Negocio</Text>
            <Text style={styles.claimSubtitle}>
              Completa los datos para verificar tu identidad.
            </Text>

            {/* CAMPOS (solo lectura) */}
            <Field label="Nombre completo">
              <Input
                value={profile.name}
                editable={false}
                style={{ backgroundColor: "#1f2937", opacity: 0.7 }}
              />
            </Field>

            <Field label="Correo">
              <Input
                value={profile.email}
                editable={false}
                style={{ backgroundColor: "#1f2937", opacity: 0.7 }}
              />
            </Field>

            <Field label="Teléfono">
              <Input
                value={profile.phone || "Sin número"}
                editable={false}
                style={{ backgroundColor: "#1f2937", opacity: 0.7 }}
              />
            </Field>

            {/* MENSAJE */}
            <Field label="Mensaje">
              <Textarea value={msg} onChangeText={setMsg} />
            </Field>

            {/* SUBIR DOCUMENTO */}
            <TouchableOpacity
              style={styles.uploadDocBtn}
              onPress={async () => {
                try {
                  const res = await DocumentPicker.getDocumentAsync({
                    copyToCacheDirectory: true,
                    multiple: false,
                  });

                  if (!res.canceled) {
                    const asset = res.assets[0];
                    const base64 = await getBase64Universal(asset.uri);

                    let fileName = asset.name;
                    if (!fileName) {
                      const ext = asset.mimeType?.split("/")[1] || "pdf";
                      fileName = `documento_${Date.now()}.${ext}`;
                    }

                    setDocs((prev) => [
                      ...prev,
                      {
                        name: fileName,
                        type: asset.mimeType,
                        base64,
                        uploading: false,
                      },
                    ]);
                  }
                } catch (err) {
                  console.log("❌ Error docs:", err);
                }
              }}
            >
              <Camera size={18} color="#fbbf24" />
              <Text style={styles.uploadDocText}> Subir documento</Text>
            </TouchableOpacity>

            {/* LISTA DOCS */}
            <View style={{ marginTop: 14 }}>
              {docs.map((doc, i) => (
                <Text key={i} style={styles.docItem}>
                  📄 {doc.name}
                </Text>
              ))}
            </View>

            {/* BOTONES */}
            <View style={styles.modalBtnRow}>
              <Btn
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => setOpen(false)}
              >
                <Text style={{ color: "#e5e7eb" }}>Cancelar</Text>
              </Btn>

              <Btn
                style={[
                  styles.sendBtn,
                  { flex: 1, opacity: canSubmit ? 1 : 0.5 },
                ]}
                disabled={!canSubmit}
                onPress={submitClaim}
              >
                <Send size={16} color="#111827" />
                <Text style={styles.sendBtnText}> Enviar</Text>
              </Btn>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =====================
// COMPONENTES UI
// =====================

function BadgePending() {
  return (
    <View
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "rgba(251,191,36,0.15)",
        borderColor: "#fbbf24",
        borderWidth: 1,
        borderRadius: 10,
      }}
    >
      <Text style={{ color: "#fbbf24", fontWeight: "700" }}>
        Tu solicitud está en revisión
      </Text>
    </View>
  );
}

function Card({ children, style }: any) {
  return (
    <View
      style={[
        {
          backgroundColor: "#0f0f10",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(148,163,184,0.2)",
          marginBottom: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function BadgeSecondary({ children, small }: any) {
  return (
    <View
      style={{
        backgroundColor: "rgba(148,163,184,0.12)",
        borderColor: "rgba(148,163,184,0.25)",
        borderWidth: 1,
        paddingHorizontal: small ? 8 : 10,
        paddingVertical: small ? 2 : 4,
        borderRadius: 999,
      }}
    >
      <Text
        style={{
          color: "#e5e7eb",
          fontWeight: "700",
          fontSize: small ? 10 : 12,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

function Input(props: any) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#6b7280"
      style={[styles.inputBase, props.style]}
    />
  );
}

function Textarea(props: any) {
  return (
    <TextInput
      {...props}
      multiline
      placeholderTextColor="#6b7280"
      style={[styles.textareaBase, props.style]}
    />
  );
}

function Field({ label, children }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Avatar({ initials }: any) {
  return (
    <View style={styles.avatar}>
      <Text style={{ color: "#e5e7eb", fontWeight: "700" }}>{initials}</Text>
    </View>
  );
}

function RowIcon({ icon, children }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {icon}
      <Text style={styles.textBody}> {children}</Text>
    </View>
  );
}

function Btn({ children, onPress, variant, style, disabled }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btnBase,
        variant === "outline" ? styles.btnOutline : styles.btnDefault,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {children}
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

// =====================
// STYLES
// =====================
const styles = StyleSheet.create({
  loadCenter: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    alignItems: "center",
    justifyContent: "center",
  },

  textStrong: { color: "#e5e7eb", fontWeight: "700" },
  textMuted: { color: "#9ca3af" },
  textBody: { color: "#d1d5db" },

  /* AÑADE ESTO ⬇⬇⬇⬇ */
  inputLabel: {
    color: "#e5e7eb",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  /* AÑADE ESTO ⬆⬆⬆⬆ */

  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,24,39,0.85)",
  },

  heroOverlay: {
    position: "absolute",
    bottom: 0,
    padding: 12,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  heroTitle: { color: "#fff", fontWeight: "800", fontSize: 20 },
  heroSubtitle: { color: "#fff", opacity: 0.9, marginTop: 2 },

  inputBase: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#e5e7eb",
  },

  textareaBase: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 90,
    textAlignVertical: "top",
    color: "#e5e7eb",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },

  uploadDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251,191,36,0.1)",
    borderWidth: 1,
    borderColor: "#fbbf24",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 4,
  },

  uploadDocText: {
    color: "#fbbf24",
    fontWeight: "700",
  },

  docItem: { color: "#9ca3af", marginTop: 4 },

  modalOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
  },

  modalCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  claimModalCard: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
  },

  claimTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  claimSubtitle: { color: "#9ca3af", marginBottom: 16 },

  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  btnBase: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  btnDefault: { backgroundColor: "#111827", borderColor: "#111827" },
  btnOutline: { backgroundColor: "transparent", borderColor: "#374151" },

  sendBtn: { backgroundColor: "#fbbf24", borderColor: "#fbbf24" },
  sendBtnText: { color: "#111827", fontWeight: "900" },

  grid2gap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
