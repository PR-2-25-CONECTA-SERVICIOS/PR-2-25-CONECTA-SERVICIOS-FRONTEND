// app/(tabs)/BusinessScreen.tsx
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Clock,
  MapPin,
  Send,
  Star
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

const API_URL = "http://192.168.1.68:3000/api/locales";

// --------------------------
// 🔥 Types basados en tu modelo
// --------------------------
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
  reclamos?: any[];   // 👈 AGREGAR ESTO

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

export default function BusinessScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [local, setLocal] = useState<ILocal | null>(null);
  const [open, setOpen] = useState(false);

  // Formulario reclamo
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [msg, setMsg] = useState("");
  const [docs, setDocs] = useState<string[]>([]);

  const canSubmit = ownerName.trim() && email.trim();

  // --------------------------
  // 🔥 Cargar local desde backend
  // --------------------------
  useEffect(() => {
    if (id) loadLocal();
  }, [id]);

  const loadLocal = async () => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const json = await res.json();
      setLocal(json);
    } catch (err) {
      console.log("❌ Error cargando local:", err);
    }
  };

  // --------------------------
  // 📤 Enviar reclamo de negocio
  // --------------------------
  const submitClaim = async () => {
    try {
      const res = await fetch(`${API_URL}/${id}/reclamar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombrePropietario: ownerName,
          correo: email,
          telefono: tel,
          mensaje: msg,
          documentos: docs,
        }),
      });

      const json = await res.json();
      console.log("📩 Reclamo enviado:", json);

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

  const callNow = () => {
    const phone = local?.telefono || "00000000";
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  if (!local) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b0b0b", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff" }}>Cargando local...</Text>
      </View>
    );
  }
const alreadyClaimed = local.reclamos && local.reclamos.length > 0;

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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* INFO */}
        <Card>
          <View style={{ padding: 12 }}>
            <View style={[styles.row, { gap: 6, marginBottom: 10 }]}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.textStrong}>{local.calificacion}</Text>
              <Text style={styles.textMuted}>({local.reseñas} reseñas)</Text>
            </View>

            <Text style={styles.textBody}>
              Dirección: {local.direccion || "No especificada"}
            </Text>

            <View style={{ gap: 10, marginTop: 12 }}>
              <RowIcon icon={<MapPin size={16} color="#9ca3af" />}>
                {local.direccion || "No definida"}
              </RowIcon>

              <RowIcon icon={<Clock size={16} color="#9ca3af" />}>
                {local.horas?.mon
                  ? `${local.horas.mon.open} - ${local.horas.mon.close}`
                  : "Horario no disponible"}
              </RowIcon>
            </View>
          </View>
        </Card>

        {/* PROPIETARIO */}
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
  <Btn variant="outline" size="sm" onPress={() => setOpen(true)}>
    <AlertTriangle size={14} color="#e5e7eb" />
    <Text style={[styles.btnText, { color: "#e5e7eb" }]}>
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
                  <Text style={{ color: "#eab308", marginTop: 2, fontSize: 13 }}>
                    El propietario aún no ha reclamado este negocio.
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* MODAL RECLAMO */}
      <Modal visible={open} transparent animationType="fade">
  <View style={styles.modalOverlay} />

  <View style={styles.modalCenter}>
    <View style={styles.claimModalCard}>

      <Text style={styles.claimTitle}>Reclamar Negocio</Text>
      <Text style={styles.claimSubtitle}>
        Completa los datos para verificar que eres el propietario.
      </Text>

      <Field label="Nombre completo">
        <Input value={ownerName} onChangeText={setOwnerName} style={styles.claimInput} />
      </Field>

      <Field label="Correo">
        <Input value={email} onChangeText={setEmail} style={styles.claimInput} />
      </Field>

      <Field label="Teléfono">
        <Input value={tel} onChangeText={setTel} style={styles.claimInput} />
      </Field>

      <Field label="Mensaje">
        <Textarea value={msg} onChangeText={setMsg} style={styles.claimTextarea} />
      </Field>

      {/* SUBIR DOCUMENTO */}
<TouchableOpacity
  style={styles.uploadDocBtn}
  onPress={async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!res.canceled) {
        setDocs((prev) => [...prev, res.assets[0].uri]);
      }
    } catch (err) {
      console.log("❌ Error seleccionando documento:", err);
    }
  }}
>
  <Camera size={18} color="#fbbf24" />
  <Text style={styles.uploadDocText}>  Subir documento</Text>
</TouchableOpacity>

      {/* LISTA DOCS */}
      <View style={{ marginTop: 14 }}>
        {docs.map((d, i) => (
          <Text key={i} style={styles.docItem}>📄 {d}</Text>
        ))}
      </View>

      {/* BOTONES */}
      <View style={styles.modalBtnRow}>
        <Btn variant="outline" style={{ flex: 1 }} onPress={() => setOpen(false)}>
          <Text style={[styles.btnText, { color: "#e5e7eb" }]}>Cancelar</Text>
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
          <Text style={styles.sendBtnText}>  Enviar</Text>
        </Btn>
      </View>

    </View>
  </View>
</Modal>

    </View>
  );
}

/* =========================
   ELEMENTOS “UI” INLINE
   ========================= */

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: '#0f0f10',
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(148,163,184,0.2)',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          marginBottom: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function CardHeader({ title }: { title: string }) {
  return (
    <View
      style={{
        padding: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(148,163,184,0.2)',
      }}
    >
      <Text style={{ fontWeight: '800', fontSize: 16, color: '#e5e7eb' }}>{title}</Text>
    </View>
  );
}

function BadgeSecondary({
  children,
  small,
  center,
}: {
  children: React.ReactNode;
  small?: boolean;
  center?: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(148,163,184,0.12)',
        borderColor: 'rgba(148,163,184,0.25)',
        borderWidth: 1,
        paddingHorizontal: small ? 8 : 10,
        paddingVertical: small ? 2 : 4,
        borderRadius: 999,
        alignSelf: center ? 'center' : 'flex-start',
      }}
    >
      <Text style={{ color: '#e5e7eb', fontWeight: '700', fontSize: small ? 10 : 12 }}>
        {children as any}
      </Text>
    </View>
  );
}

function Btn({
  children,
  onPress,
  variant = 'default',
  size = 'sm',
  style,
  disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
  style?: any;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          borderRadius: 10,
          paddingVertical: size === 'sm' ? 8 : 10,
          paddingHorizontal: size === 'sm' ? 10 : 14,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
        },
        variant === 'default'
          ? { backgroundColor: '#111827', borderColor: '#111827' }
          : { backgroundColor: 'transparent', borderColor: '#374151' },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.btnText, variant === 'outline' && { color: '#e5e7eb' }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

function Avatar({ initials, small }: { initials: string; small?: boolean }) {
  const size = small ? 32 : 48;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#374151',
      }}
    >
      <Text style={{ color: '#e5e7eb', fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}

function RowIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={{ width: 18, alignItems: 'center' }}>{icon}</View>
      <Text style={styles.textBody}>  {children as any}</Text>
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#6b7280"
      style={[
        {
          backgroundColor: '#111827',
          borderWidth: 1,
          borderColor: '#374151',
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: '#e5e7eb',
        },
        props.style,
      ]}
    />
  );
}

function Textarea(
  props: React.ComponentProps<typeof TextInput> & { value?: string; onChangeText?: (t: string) => void }
) {
  return (
    <TextInput
      {...props}
      multiline
      placeholderTextColor="#6b7280"
      style={[
        {
          backgroundColor: '#111827',
          borderWidth: 1,
          borderColor: '#374151',
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          minHeight: 90,
          textAlignVertical: 'top',
          color: '#e5e7eb',
        },
        props.style,
      ]}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.inputLabel}>{label}</Text>
      {children}
    </View>
  );
}

// Imagen con fallback simple
function ImageWithFallback({ src, style }: { src: string; style?: any }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <View style={[{ backgroundColor: '#1f2937' }, style]} />;
  return <Image source={{ uri: src }} style={style} onError={() => setErr(true)} />;
}

/* ============ STYLES ============ */
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // back button
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,24,39,0.85)', // #111827 con transparencia
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
  },

  // responsive propietario
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  ownerRowNarrow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  ownerButtonNarrow: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 10,
  },

  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroTitle: { color: '#fff', fontWeight: '800', fontSize: 20 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  textStrong: { color: '#e5e7eb', fontWeight: '700' },
  textStrongSm: { color: '#e5e7eb', fontWeight: '700', fontSize: 13 },
  textMuted: { color: '#9ca3af' },
  textBody: { color: '#d1d5db' },

  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid2gap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  btnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  uploadBox: {
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f10',
    padding: 6,
  },

  // Modal
  modalOverlay: { position: 'absolute', inset: 0 as any, backgroundColor: 'rgba(0,0,0,0.7)' },
  modalCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0f0f10',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
    padding: 16,
  },
  modalTitle: { fontWeight: '800', fontSize: 18, color: '#e5e7eb' },
  modalDesc: { color: '#9ca3af', marginTop: 4 },
  modalNote: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 8 },
claimModalCard: {
  width: "100%",
  maxWidth: 430,
  backgroundColor: "#111827",
  padding: 20,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "rgba(148,163,184,0.25)",
},

claimTitle: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "800",
},

claimSubtitle: {
  color: "#9ca3af",
  fontSize: 13,
  marginTop: 4,
  marginBottom: 16,
},

claimInput: {
  marginBottom: 16,
  height: 48,
},

claimTextarea: {
  marginBottom: 18,
  minHeight: 100,
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

docItem: {
  color: "#9ca3af",
  marginTop: 4,
},

modalBtnRow: {
  flexDirection: "row",
  gap: 10,
  marginTop: 20,
},

sendBtn: {
  backgroundColor: "#fbbf24",
  borderColor: "#fbbf24",
},

sendBtnText: {
  color: "#111827",
  fontWeight: "900",
},

  inputLabel: { color: '#e5e7eb', fontSize: 12, marginBottom: 6, fontWeight: '600' },
});
