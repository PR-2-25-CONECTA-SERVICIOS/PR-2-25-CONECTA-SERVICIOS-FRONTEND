import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share,
  Star,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const mockService = {
  id: 1,
  name: 'Plomería Express',
  category: 'Plomería y Reparaciones',
  rating: 4.8,
  reviews: 127,
  distance: '0.8 km',
  address: 'Av. Principal 123, Ciudad',
  phone: '+1 234 567 8900',
  price: '$50-80/hora',
  description:
    'Servicio de plomería profesional con más de 10 años de experiencia. Especialistas en reparaciones de emergencia, instalaciones y mantenimiento residencial y comercial.',
  services: [
    'Destape de tuberías',
    'Reparación de grifos',
    'Instalación de sanitarios',
    'Calentadores de agua',
  ],
  hours: 'Lunes a Domingo: 24 horas',
  available: true,
  owner: {
    name: 'Carlos Mendoza',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    experience: '10 años',
    verified: true,
  },
  gallery: [
    'https://images.unsplash.com/photo-1604118600242-e7a6d23ec3a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2aWNlJTIwd29ya2VyJTIwcGx1bWJlcnxlbnwxfHx8fDE3NTY0MzgxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  ],
  recentReviews: [
    { id: 1, user: 'Ana García', rating: 4.5, comment: 'Excelente servicio, muy puntual y profesional.', date: 'Hace 2 días' },
    { id: 2, user: 'Pedro López', rating: 4.5, comment: 'Buen trabajo, precio justo. Lo recomiendo.', date: 'Hace 1 semana' },
    { id: 3, user: 'María Silva', rating: 5, comment: 'Solucionó mi problema rápidamente. Muy satisfecha.', date: 'Hace 2 semanas' },
  ],
};

export default function ServiceDetailScreen({ onNext }: { onNext: () => void }) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex] = useState(0);

  // Estado de solicitud
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleBack = () => {
    // @ts-ignore (algunas versiones no tipan canGoBack)
    if (router.canGoBack?.()) router.back();
    else router.replace('/(tabs)/explore');
  };

  const callNow = () => {
    Linking.openURL(`tel:${mockService.phone.replace(/\s|\+/g, '')}`).catch(() => {});
  };

  const openWhatsApp = (msg: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {});
  };

  const openWhatsAppToCoordinate = () =>
    openWhatsApp(`Hola ${mockService.owner.name} 👋, acabo de enviar una solicitud para "${mockService.name}". ¿Podemos coordinar detalles por aquí?`);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) {
      stars.push(<Star key={`s${i}`} size={16} color="#fbbf24" fill="#fbbf24" />);
    }
    if (half) stars.push(<Star key="half" size={16} color="#fbbf24" style={{ opacity: 0.5 }} />);
    return stars;
  };

  const handleRequest = () => {
    // Aquí podrías llamar a tu backend
    setRequestSent(true);
    setRequestModalVisible(true);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* HEADER IMAGE */}
      <View style={styles.headerImageWrap}>
        <Image source={{ uri: mockService.gallery[currentImageIndex] }} style={styles.headerImage} />

        {/* Overlay top controls */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <ArrowLeft size={18} color="#e5e7eb" />
          </TouchableOpacity>

          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => setIsFavorite(v => !v)} style={styles.iconBtn}>
              <Heart size={18} color={isFavorite ? '#ef4444' : '#e5e7eb'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Share size={18} color="#e5e7eb" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Availability badge */}
        <View style={styles.availabilityBadge}>
          <Text style={mockService.available ? styles.availableText : styles.notAvailableText}>
            {mockService.available ? 'Disponible ahora' : 'No disponible'}
          </Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        {/* Card: Header info */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.serviceName}>{mockService.name}</Text>
              <Text style={styles.serviceCategory}>{mockService.category}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>{mockService.price}</Text>
              <Text style={styles.perHour}>por hora</Text>
            </View>
          </View>

          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <View style={styles.rowCenter}>
              <View style={styles.rowCenter}>{renderStars(mockService.rating)}</View>
              <Text style={styles.ratingText}>
                {mockService.rating.toFixed(1)} <Text style={styles.grayText}>({mockService.reviews})</Text>
              </Text>
            </View>
            <View style={styles.rowCenter}>
              <MapPin size={16} color="#e5e7eb" />
              <Text style={[styles.grayText, { marginLeft: 6 }]}>{mockService.distance}</Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={[styles.card, { paddingVertical: 14 }]}>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: '#25D366' }]}
              onPress={() => openWhatsApp(`Hola ${mockService.owner.name}, me interesa "${mockService.name}".`)}
            >
              <MessageCircle size={16} color="#111827" />
              <Text style={styles.quickBtnText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#fbbf24' }]} onPress={callNow}>
              <Phone size={16} color="#111827" />
              <Text style={styles.quickBtnText}>Llamar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Owner */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Image source={{ uri: mockService.owner.photo }} style={styles.ownerPhoto} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <View style={styles.rowCenter}>
                <Text style={styles.ownerName}>{mockService.owner.name}</Text>
                {mockService.owner.verified && (
                  <View style={styles.badgeSecondary}>
                    <Text style={styles.badgeSecondaryText}>Verificado</Text>
                  </View>
                )}
              </View>
              <Text style={styles.grayText}>{mockService.owner.experience} de experiencia</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.bodyText}>{mockService.description}</Text>
        </View>

        {/* Services list */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Servicios</Text>
          <View style={styles.chipsWrap}>
            {mockService.services.map((s, i) => (
              <View key={`${s}-${i}`} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location & Hours */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={[styles.row, { marginTop: 6 }]}>
            <MapPin size={16} color="#e5e7eb" />
            <Text style={[styles.bodyText, { marginLeft: 8 }]}>{mockService.address}</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Horarios</Text>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Clock size={16} color="#e5e7eb" />
            <Text style={[styles.bodyText, { marginLeft: 8 }]}>{mockService.hours}</Text>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reseñas recientes</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            {mockService.recentReviews.map(r => (
              <View key={r.id} style={styles.reviewItem}>
                <View style={styles.rowBetween}>
                  <Text style={styles.reviewUser}>{r.user}</Text>
                  <View style={styles.row}>{renderStars(r.rating)}</View>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
                <Text style={styles.reviewDate}>{r.date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA (cambia a "Solicitud enviada" cuando requestSent = true) */}
        <View style={{ paddingHorizontal: 16 }}>
          {!mockService.available ? (
            <View style={[styles.ctaBtn, { opacity: 0.6 }]}>
              <Text style={styles.ctaBtnText}>Servicio No Disponible</Text>
            </View>
          ) : !requestSent ? (
            <TouchableOpacity style={styles.ctaBtn} onPress={handleRequest}>
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

      {/* MODAL: SOLICITUD ENVIADA */}
      <Modal
        visible={requestModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.modalContainerLg]}>
            <View style={styles.modalHeaderIcon}>
              <CheckCircle2 size={28} color="#34d399" />
            </View>

            <Text style={styles.modalTitle}>¡Solicitud enviada!</Text>
            <Text style={styles.modalSubtitle}>
              Tu pedido para <Text style={{ fontWeight: '800', color: '#e5e7eb' }}>{mockService.name}</Text> fue enviado al proveedor.
            </Text>

            <View style={styles.modalDetails}>
              <View style={styles.rowLine}>
                <Text style={styles.rowLineLabel}>Proveedor</Text>
                <Text style={styles.rowLineValue}>{mockService.owner.name}</Text>
              </View>
              <View style={styles.rowLine}>
                <Text style={styles.rowLineLabel}>Tiempo de respuesta</Text>
                <Text style={styles.rowLineValue}>~ 15 min</Text>
              </View>
              <View style={styles.rowLine}>
                <Text style={styles.rowLineLabel}>Estado</Text>
                <Text style={[styles.rowLineValue, { color: '#fbbf24' }]}>Pendiente de confirmación</Text>
              </View>
            </View>

            <Text style={styles.modalHint}>
              Permanece atent@ a las notificaciones. Si necesitas coordinar detalles, puedes escribir por WhatsApp:
            </Text>

            <TouchableOpacity style={styles.btnWhatsapp} onPress={openWhatsAppToCoordinate}>
              <MessageCircle size={16} color="#fff" />
              <Text style={styles.btnWhatsappText}>Chatear por WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnGhost} onPress={() => setRequestModalVisible(false)}>
              <Text style={styles.btnGhostText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

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
  perHour: { color: '#9ca3af', fontSize: 12 },

  ratingText: { color: '#e5e7eb', marginLeft: 8, fontWeight: '700', fontSize: 12 },
  grayText: { color: '#9ca3af' },

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

  ownerPhoto: { width: 48, height: 48, borderRadius: 999 },

  ownerName: { color: '#e5e7eb', fontWeight: '800', fontSize: 15 },
  badgeSecondary: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  badgeSecondaryText: { color: '#fbbf24', fontSize: 10, fontWeight: '800' },

  sectionTitle: { color: '#e5e7eb', fontWeight: '800', marginBottom: 8 },
  bodyText: { color: '#e5e7eb', lineHeight: 20 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  chipText: { color: '#e5e7eb', fontSize: 12 },

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
  reviewDate: { color: '#9ca3af', fontSize: 12 },

  ctaBtn: {
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  ctaBtnText: { color: '#111827', fontWeight: '900' },

  // Estado "Solicitud enviada"
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

  // ------- Modal: Solicitud Enviada -------
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
  modalSubtitle: { color: '#cbd5e1', fontSize: 13, textAlign: 'center' },

  modalDetails: {
    alignSelf: 'stretch',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 6,
  },
  rowLine: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLineLabel: { color: '#9ca3af', fontSize: 12 },
  rowLineValue: { color: '#e5e7eb', fontWeight: '700', fontSize: 13 },

  modalHint: { color: '#cbd5e1', fontSize: 13, textAlign: 'center', marginTop: 8 },

  btnWhatsapp: {
    alignSelf: 'stretch',
    marginTop: 10,
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnWhatsappText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.2 },

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
