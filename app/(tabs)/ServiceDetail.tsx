import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share,
  Star
} from "lucide-react-native";

import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext"; // ⭐ IMPORTANTE – USAR USER REAL

const API_URL = "http://192.168.0.6:3000/api/servicios";

interface IService {
  _id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: string;
  imagen: string;
  telefono?: string;
  direccion?: string;
  destacado?: boolean;
  disponible?: boolean;
  calificacion?: number;
  opiniones?: number;

  propietario?: {
    _id: string;
    nombre: string;
    telefono?: string;
    correo?: string;
    avatar?: string;
    experiencia?: string;
    verificado?: boolean;
  };

  // 👇 ESTA ERA LA QUE ESTABA MAL
  propietarioId?: {
    _id: string;
    nombre: string;
    telefono?: string;
    correo?: string;
    avatar?: string;
    experiencia?: string;
    verificado?: boolean;
  };

  reseñas?: Array<{
    usuario: {
      _id: string;
      nombre: string;
      avatar?: string;
    };
    comentario: string;
    calificacion: number;
  }>;
}


export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();   // ⭐ TENEMOS acceso al usuario real

  const [service, setService] = useState<IService | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

const [myServices, setMyServices] = useState<string[]>([]);
const isMyService =
  service &&
  user &&
  (
    service.propietarioId?._id === user._id ||      // propietario populated
    service.propietarioId === user._id ||           // propietario como string (fallback)
    myServices.includes(service._id)                // servicios del usuario
  );


  useEffect(() => {
  setRequestSent(false);
  if (id) loadService();
}, [id]);
  // ----------------------------------------
  // 🔥 Cargar servicio desde el backend
  // ----------------------------------------
useEffect(() => {
  if (!user?._id) return;

  const loadMyServices = async () => {
    try {
      const res = await fetch(`http://192.168.0.6:3000/api/usuarios/${user._id}`);
      const json = await res.json();

      // json.servicios es un array de objetos
      const ids = (json.servicios || []).map((s: any) => s._id);

      setMyServices(ids); // solo IDs
    } catch (err) {
      console.log("❌ Error cargando servicios del usuario:", err);
    }
  };

  loadMyServices();
}, [user?._id]);

const loadService = async () => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const json = await res.json();

    console.log("📌 Servicio recibido:", json);

    // El backend YA devuelve propietario correctamente
    setService(json);

  } catch (err) {
    console.log("❌ Error cargando servicio:", err);
  }
};



  // ----------------------------------------
  // 🔥 Enviar solicitud REAL al backend
  // ----------------------------------------
  const sendServiceRequest = async () => {
    try {
      if (!user || !user._id) {
        alert("Debes iniciar sesión para enviar solicitudes.");
        return;
      }

      const res = await fetch(`${API_URL}/${id}/solicitud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: user._id,  // ⭐ USUARIO REAL
          mensaje: "Estoy interesado en su servicio",
        }),
      });

      const json = await res.json();
      console.log("📩 Solicitud enviada:", json);

      if (res.ok) {
        setRequestSent(true);
        setRequestModalVisible(true);
      } else {
        alert("Error: " + json.mensaje);
      }

    } catch (err) {
      console.log("❌ Error enviando solicitud:", err);
    }
  };

  // ----------------------------------------
  // Utilidades
  // ----------------------------------------
const callNow = () => {
const phone = service?.propietario?.telefono;


  if (!phone) {
    alert("El propietario no tiene un número registrado.");
    return;
  }

  Linking.openURL(`tel:${phone}`);
};



const openWhatsApp = () => {
const phone = service?.propietario?.telefono;


  if (!phone) {
    alert("El propietario no tiene un número registrado.");
    return;
  }

  const msg = `Hola, me interesa el servicio: ${service.nombre}`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

  Linking.openURL(url);
};


  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) {
      stars.push(<Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />);
    }
    if (half) stars.push(<Star key="half" size={16} color="#fbbf24" />);
    return stars;
  };

  if (!service) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b0b0b", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff" }}>Cargando servicio...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* HEADER */}
      <View style={styles.headerImageWrap}>
        <Image source={{ uri: service.imagen }} style={styles.headerImage} />

        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={18} color="#e5e7eb" />
          </TouchableOpacity>

          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.iconBtn}>
              <Heart size={18} color={isFavorite ? "#ef4444" : "#e5e7eb"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Share size={18} color="#e5e7eb" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.availabilityBadge}>
          <Text style={service.disponible ? styles.availableText : styles.notAvailableText}>
            {service.disponible ? "Disponible" : "No disponible"}
          </Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>

        {/* Info */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.serviceName}>{service.nombre}</Text>
              <Text style={styles.serviceCategory}>{service.categoria}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.price}>{service.precio}</Text>
              <Text style={styles.grayText}>por hora</Text>
            </View>
          </View>

          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <View style={styles.rowCenter}>
              {renderStars(Number(service.calificacion || 0))}
              <Text style={styles.ratingText}>
                {service.calificacion || 0}{" "}
                <Text style={styles.grayText}>({service.opiniones || 0})</Text>
              </Text>
            </View>
            <View style={styles.rowCenter}>
              <MapPin size={16} color="#e5e7eb" />
              <Text style={[styles.grayText, { marginLeft: 6 }]}>
                {service.direccion || "Ubicación no disponible"}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={[styles.card, { paddingVertical: 14 }]}>
          <View style={styles.quickRow}>
<TouchableOpacity
  style={[styles.quickBtn, { backgroundColor: "#25D366" }]}
  onPress={openWhatsApp}
>

              <MessageCircle size={16} color="#111827" />
              <Text style={styles.quickBtnText}>WhatsApp</Text>
            </TouchableOpacity>

<TouchableOpacity
  style={[styles.quickBtn, { backgroundColor: "#fbbf24" }]}
  onPress={callNow}
>
              <Phone size={16} color="#111827" />
              <Text style={styles.quickBtnText}>Llamar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.bodyText}>{service.descripcion}</Text>
        </View>

        {/* Reseñas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reseñas recientes</Text>

          {service.reseñas && service.reseñas.length > 0 ? (
            service.reseñas.map((r, i) => (
              <View key={i} style={styles.reviewItem}>
                <View style={styles.rowBetween}>
<Text style={styles.reviewUser}>
  {r.usuario?.nombre || "Usuario Anónimo"}
</Text>
                  <View style={styles.row}>{renderStars(r.calificacion)}</View>
                </View>
                <Text style={styles.reviewComment}>{r.comentario}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#9ca3af" }}>Aún no hay reseñas.</Text>
          )}
        </View>

        {/* CTA */}
{/* CTA */}
<View style={{ paddingHorizontal: 16 }}>

  {isMyService ? (
    // 👇 Si es mi servicio, NO muestro el botón de solicitar
    <View style={[styles.ctaBtn, { backgroundColor: "#444", opacity: 0.5 }]}>
      <Text style={styles.ctaBtnText}>Este es tu servicio</Text>
    </View>
  
  ) : !service.disponible ? (
    <View style={[styles.ctaBtn, { opacity: 0.6 }]}>
      <Text style={styles.ctaBtnText}>Servicio No Disponible</Text>
    </View>

  ) : !requestSent ? (
    <TouchableOpacity style={styles.ctaBtn} onPress={sendServiceRequest}>
      <Text style={styles.ctaBtnText}>Solicitar Servicio Ahora</Text>
    </TouchableOpacity>

  ) : (
    <View style={styles.ctaSent}>
      <CheckCircle2 size={18} color="#fbbf24" />
      <Text style={styles.ctaSentText}>Solicitud enviada</Text>
    </View>
  )}

</View>

      </View>

      {/* MODAL */}
      <Modal visible={requestModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.modalContainerLg]}>
            <View style={styles.modalHeaderIcon}>
              <CheckCircle2 size={28} color="#34d399" />
            </View>

            <Text style={styles.modalTitle}>¡Solicitud enviada!</Text>

            <TouchableOpacity style={styles.btnGhost} onPress={() => setRequestModalVisible(false)}>
              <Text style={styles.btnGhostText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

/* -----------------------------------------
   🎨 TUS ESTILOS ORIGINALES (NO TOCO NADA)
----------------------------------------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0b0b' },

  headerImageWrap: { position: 'relative' },
  headerImage: { width: '100%', height: 220 },

  headerOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,17,19,0.75)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  iconRow: { flexDirection: 'row', gap: 8 },

  availabilityBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  availableText: { color: '#fbbf24', fontWeight: '800', fontSize: 12 },
  notAvailableText: { color: '#9ca3af', fontWeight: '700', fontSize: 12 },

  body: { paddingTop: 12, gap: 12 },

  card: {
    backgroundColor: '#0f0f10',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
  },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  serviceName: { color: '#e5e7eb', fontWeight: '800', fontSize: 18 },
  serviceCategory: { color: '#9ca3af', marginTop: 2 },

  price: { color: '#fbbf24', fontWeight: '800', fontSize: 16 },
  grayText: { color: '#9ca3af' },

  ratingText: { color: '#e5e7eb', marginLeft: 8, fontWeight: '700', fontSize: 12 },

  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  quickBtnText: { color: '#111827', fontWeight: '800' },

  sectionTitle: { color: '#e5e7eb', fontWeight: '800', marginBottom: 8 },
  bodyText: { color: '#e5e7eb', lineHeight: 20 },

  reviewItem: {
    backgroundColor: '#111113',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  reviewUser: { color: '#e5e7eb', fontWeight: '800' },
  reviewComment: { color: '#e5e7eb' },

  ctaBtn: {
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  ctaBtnText: { color: '#111827', fontWeight: '900' },

  ctaSent: {
    marginTop: 2,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaSentText: { color: '#fbbf24', fontWeight: '900' },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 18,
  },
  modalContainer: {
    backgroundColor: '#1b1b1b',
    padding: 20,
    borderRadius: 16,
    width: '86%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24,
    elevation: 10,
  },
  modalContainerLg: { gap: 10 },
  modalHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },

  btnGhost: {
    alignSelf: 'stretch',
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: { color: '#e5e7eb', fontWeight: '700' },
});
