// app/(tabs)/BusinessScreen.tsx
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Clock,
  MapPin,
  Send,
  Star,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://localhost:3000/api/locales";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/deqxfxbaa/raw/upload";
const CLOUDINARY_PRESET = "imagescloudexp";

// ------------------------------
//     TYPES
// ------------------------------
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

  lat?: number;
  lng?: number;
  url?: string;

  fotos?: string[];
  servicios?: string[];
  tagsEspeciales?: string[];

  reclamos?: any[];

  verificado: boolean;
  destacado: boolean;

  horas?: {
    mon?: IHours;
    tue?: IHours;
    wed?: IHours;
    thu?: IHours;
    fri?: IHours;
    sat?: IHours;
    sun?: IHours;
  };

  direccion?: string;
  creadoPor?: any;
}

// ------------------------------
//     DOCUMENT TYPE
// ------------------------------
type DocFile = {
  name: string;
  type: string;
  base64: string;
  uploading: boolean;
};

// ======================================
// 🔥 FUNCIÓN UNIVERSAL PARA LEER BASE64
// Compatible con ANDROID + IOS + WEB
// ======================================
const getBase64 = async (uri: string) => {
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

  // 📱 Android / iOS
  return await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });
};

// ======================================
// ======================================
//             MAIN COMPONENT
// ======================================
// ======================================

export default function BusinessScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [local, setLocal] = useState<ILocal | null>(null);
  const [open, setOpen] = useState(false);

  // FORM STATE RECLAMO
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [msg, setMsg] = useState("");
  const [docs, setDocs] = useState<DocFile[]>([]);

  const canSubmit = msg.trim() !== "";

  // ------------------------------
  //     CARGAR LOCAL
  // ------------------------------
  useFocusEffect(
    useCallback(() => {
      if (id) loadLocal();
    }, [id])
  );
  const getBase64 = async (uri: string) => {
    // 📌 WEB
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

    // 📌 ANDROID / iOS
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  };
  const loadLocal = async () => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const json = await res.json();
      setLocal(json);
    } catch (err) {
      console.log("❌ Error cargando local:", err);
    }
  };

  // ------------------------------
  //     SUBIR DOC A CLOUDINARY
  // ------------------------------
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

      if (!res.ok) {
        console.log("❌ Error Cloudinary:", json);
        return null;
      }

      return json.secure_url;
    } catch (err) {
      console.log("❌ Error subiendo documento:", err);
      return null;
    }
  };

  // ------------------------------
  //     ENVIAR RECLAMO
  // ------------------------------
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
          nombrePropietario: ownerName,
          correo: email,
          telefono: tel,
          mensaje: msg,
          documentos: uploadedDocs,
        }),
      });

      const json = await res.json();
      console.log("📩 Reclamo enviado:", json);

      await loadLocal();
      setOpen(false);
      setOwnerName("");
      setEmail("");
      setTel("");
      setMsg("");
      setDocs([]);
    } catch (err) {
      console.log("❌ Error enviando reclamo:", err);
    }
  };

  if (!local) {
    return (
      <View style={styles.loadCenter}>
        <Text style={{ color: "#fff" }}>Cargando local...</Text>
      </View>
    );
  }

  const alreadyClaimed =
    local.reclamos &&
    Array.isArray(local.reclamos) &&
    local.reclamos.length > 0;

  // ======================================
  //               UI
  // ======================================

  return (
    <View style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      {/* HERO */}
      <View style={{ height: 190, backgroundColor: "#111827" }}>
        <Image
          source={{ uri: local.imagen }}
          style={{ width: "100%", height: "100%" }}
        />

        <View style={{ position: "absolute", top: 12, left: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/LocalesScreen")}
            style={styles.backBtn}
          >
            <ArrowLeft size={18} color="#e5e7eb" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{local.nombre}</Text>
          <Text style={styles.heroSubtitle}>{local.categoria}</Text>
        </View>
      </View>

      {/* SCROLLVIEW */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* INFO */}
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

            <RowIcon icon={<Clock size={16} color="#9ca3af" />}>
              {local.horas?.mon
                ? `${local.horas.mon.open} - ${local.horas.mon.close}`
                : "Horario no disponible"}
            </RowIcon>
          </View>
        </Card>

        {/* RECLAMAR NEGOCIO */}
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

              {!local.verificado && !alreadyClaimed && (
                <Btn
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setOwnerName(local.creadoPor?.nombre || "");
                    setEmail(local.creadoPor?.correo || "");
                    setTel(local.telefono || "");
                    setOpen(true);
                  }}
                >
                  <AlertTriangle size={14} color="#e5e7eb" />
                  <Text
                    style={[
                      styles.textStrong,
                      { color: "#e5e7eb", fontSize: 12 },
                    ]}
                  >
                    {"  "}Reclamar negocio
                  </Text>
                </Btn>
              )}
            </View>
          </View>
        </Card>

        {/* ADVERTENCIA */}
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
      </ScrollView>

      {/* ============================
            MODAL RECLAMO
      ============================ */}
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalOverlay} />
        <View style={styles.modalCenter}>
          <View style={styles.claimModalCard}>
            <Text style={styles.claimTitle}>Reclamar Negocio</Text>
            <Text style={styles.claimSubtitle}>
              Completa los datos para verificar que eres el propietario.
            </Text>

            {/* CAMPOS */}
            {/* Nombre — autocompletado y bloqueado */}
            <Field label="Nombre completo">
              <Input
                value={ownerName}
                editable={false}
                selectTextOnFocus={false}
                style={{ backgroundColor: "#1f2937", opacity: 0.7 }}
              />
            </Field>

            {/* Correo — autocompletado y bloqueado */}
            <Field label="Correo">
              <Input
                value={email}
                editable={false}
                selectTextOnFocus={false}
                style={{ backgroundColor: "#1f2937", opacity: 0.7 }}
              />
            </Field>

            {/* Teléfono — autocompletado y bloqueado */}
            <Field label="Teléfono">
              <Input
                value={tel}
                editable={false}
                selectTextOnFocus={false}
                style={{ backgroundColor: "#1f2937", opacity: 0.7 }}
              />
            </Field>

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

                    const base64 = await getBase64(asset.uri);
                    let fileName = asset.name;

                    // Si no existe nombre, generamos uno con extensión según el tipo MIME
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
                  console.log("❌ Error seleccionando documento:", err);
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
                  {doc.uploading
                    ? "📤 Subiendo documento..."
                    : `📄 ${doc.name} (${doc.type})`}
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
                <Text
                  style={[
                    styles.textStrong,
                    { color: "#e5e7eb", fontSize: 12 },
                  ]}
                >
                  Cancelar
                </Text>
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

/* ==============================
          ELEMENTOS UI
============================== */

function Card({ children, style }: any) {
  return (
    <View
      style={[
        {
          backgroundColor: "#0f0f10",
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
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

function Field({ label, children }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      {children}
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

/* ==============================
              STYLES
============================== */
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

  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,24,39,0.85)",
  },

  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroTitle: { color: "#fff", fontWeight: "800", fontSize: 20 },
  heroSubtitle: { color: "rgba(255,255,255,0.9)", marginTop: 2 },

  inputLabel: {
    color: "#e5e7eb",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },

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

  uploadDocText: { color: "#fbbf24", fontWeight: "700" },

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

  sendBtn: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
  },
  sendBtnText: { color: "#111827", fontWeight: "900" },
});
