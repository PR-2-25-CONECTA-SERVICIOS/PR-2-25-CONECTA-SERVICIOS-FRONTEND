// ServiceProviderScreen.tsx
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  MessageCircle,
  Star,
  XCircle,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
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
} from 'react-native';

// ---------- DATA MOCK ----------
const providerData = {
  name: 'Carlos Mendoza',
  service: 'Plomería Express',
  category: 'Plomería y Reparaciones',
  rating: 4.8,
  reviews: 127,
  avatar: '',
  verified: true,
  active: true,
  phone: '+1 234 567 8900',
  experience: '10 años',
  completedJobs: 345,
  responseTime: '15 min promedio',
};

type RequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

type Req = {
  id: number;
  client: string;
  service: string;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:mm
  status: RequestStatus;
  price: string;
  location: string;
  clientAvatar?: string;
  urgent?: boolean;
};

const initialRequests: Req[] = [
  {
    id: 1,
    client: 'Ana García',
    service: 'Reparación de grifo',
    date: '2025-01-28',
    time: '14:00',
    status: 'pending',
    price: '$65',
    location: 'Av. Central 456',
    urgent: true,
  },
  {
    id: 2,
    client: 'Pedro López',
    service: 'Destape de tubería',
    date: '2025-01-28',
    time: '16:30',
    status: 'accepted',
    price: '$80',
    location: 'Calle 123, Apto 4B',
  },
  {
    id: 3,
    client: 'María Silva',
    service: 'Instalación sanitario',
    date: '2025-01-27',
    time: '10:00',
    status: 'completed',
    price: '$120',
    location: 'Sector Norte, Casa 15',
  },
];

// ---------- HELPERS ----------
const getStatusPill = (status: RequestStatus) => {
  switch (status) {
    case 'pending':
      return { text: 'Pendiente', color: '#fbbf24', Icon: Clock };
    case 'accepted':
      return { text: 'Aceptado', color: '#60a5fa', Icon: CheckCircle };
    case 'completed':
      return { text: 'Completado', color: '#34d399', Icon: CheckCircle };
    case 'cancelled':
      return { text: 'Cancelado', color: '#f87171', Icon: XCircle };
    default:
      return { text: 'Desconocido', color: '#9ca3af', Icon: Clock };
  }
};

export default function ServiceProviderScreen({ onNext }: { onNext: () => void }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(providerData.active);
  const [tab, setTab] = useState<'requests' | 'profile' | 'analytics'>('requests');
  const [requests, setRequests] = useState<Req[]>(initialRequests);

  // Back (a prueba de balas)
  const handleBack = () => {
    router.replace('/ProfileViewScreen');
  };

  // ---------- ACEPTAR: modal + whatsapp ----------
  const [acceptedModalVisible, setAcceptedModalVisible] = useState(false);
  const [acceptedRequest, setAcceptedRequest] = useState<Req | null>(null);

  const handleAccept = (req: Req) => {
    setRequests(prev => prev.map(r => (r.id === req.id ? { ...r, status: 'accepted' } : r)));
    setAcceptedRequest({ ...req, status: 'accepted' });
    setAcceptedModalVisible(true);
  };

  const openWhatsAppAcceptance = (req: Req) => {
    const msg = `¡Hola ${req.client}! 👋 Soy ${providerData.name}. Acepté tu solicitud de "${req.service}" para el ${req.date} a las ${req.time} en ${req.location}. ¿Coordinamos detalles por aquí?`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {});
  };

  // ---------- PROGRAMAR: modal + whatsapp ----------
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleRequest, setScheduleRequest] = useState<Req | null>(null);

  // Campos del modal de programación
  const [schedDate, setSchedDate] = useState('');   // YYYY-MM-DD
  const [schedTime, setSchedTime] = useState('');   // HH:mm
  const [schedDuration, setSchedDuration] = useState('2'); // horas
  const [schedLocation, setSchedLocation] = useState('');
  const [schedNote, setSchedNote] = useState('');

  const openScheduleModal = (req: Req) => {
    setScheduleRequest(req);
    setSchedDate(req.date);
    setSchedTime(req.time);
    setSchedDuration('2');
    setSchedLocation(req.location);
    setSchedNote('');
    setScheduleModalVisible(true);
  };

  const scheduleWhatsAppMessage = useMemo(() => {
    if (!scheduleRequest) return '';
    return `Hola ${scheduleRequest.client} 👋\n\nTe propongo agendar tu servicio "${scheduleRequest.service}" para:\n🗓 ${schedDate} a las ${schedTime}\n⏱ Duración aprox: ${schedDuration}h\n📍 Ubicación: ${schedLocation}\n\n${schedNote ? `Notas: ${schedNote}\n\n` : ''}¿Te parece bien esta hora?`;
  }, [scheduleRequest, schedDate, schedTime, schedDuration, schedLocation, schedNote]);

  const openWhatsAppSchedule = () => {
    if (!scheduleRequest) return;
    const url = `https://wa.me/?text=${encodeURIComponent(scheduleWhatsAppMessage)}`;
    Linking.openURL(url).catch(() => {});
  };

  const saveSchedule = () => {
    // Aquí podrías persistir en backend; por ahora solo cerramos modal
    setScheduleModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      {/* HEADER con Back */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={18} color="#e5e7eb" />
        </TouchableOpacity>

        <View style={styles.avatarWrap}>
          {providerData.avatar ? (
            <Image source={{ uri: providerData.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>CM</Text>
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
                {providerData.rating}{' '}
                <Text style={styles.grayText}>({providerData.reviews})</Text>
              </Text>
            </View>
            <Text style={styles.grayText}>{providerData.completedJobs} trabajos</Text>
          </View>
        </View>

  
      </View>

      {/* Switch Estado */}
      <View style={styles.statusCard}>
        <View>
          <Text style={styles.statusTitle}>Estado del servicio</Text>
          <Text style={styles.grayText}>
            {isActive ? 'Recibiendo solicitudes' : 'No disponible'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsActive(v => !v)}
          style={[
            styles.switchBase,
            { backgroundColor: isActive ? '#fbbf24' : '#374151' },
          ]}
        >
          <View
            style={[
              styles.switchThumb,
              { transform: [{ translateX: isActive ? 20 : 0 }] },
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* CONTENIDO */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        {/* Stats rápidas */}
        <View style={styles.statsGrid}>
          <View style={[styles.card, styles.cardStat]}>
            <Text style={[styles.statNumber, { color: '#fbbf24' }]}>
              {requests.filter(r => r.status === 'pending').length}
            </Text>
            <Text style={styles.grayTextSmall}>Pendientes</Text>
          </View>
          <View style={[styles.card, styles.cardStat]}>
            <Text style={[styles.statNumber, { color: '#60a5fa' }]}>
              {requests.filter(r => r.status === 'accepted').length}
            </Text>
            <Text style={styles.grayTextSmall}>En progreso</Text>
          </View>
          <View style={[styles.card, styles.cardStat]}>
            <Text style={[styles.statNumber, { color: '#34d399' }]}>
              {requests.filter(r => r.status === 'completed').length}
            </Text>
            <Text style={styles.grayTextSmall}>Completados</Text>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabsList}>
          {(['requests', 'profile', 'analytics'] as const).map(key => (
            <TouchableOpacity
              key={key}
              onPress={() => setTab(key)}
              style={[styles.tabBtn, tab === key && { backgroundColor: '#111827' }]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === key && { color: '#fbbf24', fontWeight: '700' },
                ]}
              >
                {key === 'requests'
                  ? 'Solicitudes'
                  : key === 'profile'
                  ? 'Perfil'
                  : 'Estadísticas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB: SOLICITUDES */}
        {tab === 'requests' && (
          <View style={{ gap: 12 }}>
            {requests.some(r => r.status === 'pending') && (
              <View style={[styles.card, styles.cardWarn]}>
                <View style={styles.rowCenter}>
                  <Bell size={16} color="#fbbf24" />
                  <Text style={[styles.warnText, { marginLeft: 8 }]}>
                    Tienes {requests.filter(r => r.status === 'pending').length} solicitudes pendientes
                  </Text>
                </View>
              </View>
            )}

            {requests.map(req => {
              const pill = getStatusPill(req.status);
              return (
                <View key={req.id} style={styles.card}>
                  <View style={[styles.rowBetween, { marginBottom: 10 }]}>
                    <View style={styles.rowCenter}>
                      <View style={styles.smallAvatar}>
                        <Text style={styles.smallAvatarText}>{req.client.charAt(0)}</Text>
                      </View>

                      <View>
                        <View style={[styles.rowCenter, { gap: 8 }]}>
                          <Text style={styles.title}>{req.client}</Text>
                          {req.urgent && (
                            <View style={styles.badgeDanger}>
                              <Text style={styles.badgeDangerText}>Urgente</Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.grayTextSmall}>{req.service}</Text>
                        <Text style={styles.grayTextSmall}>{req.location}</Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#34d399', fontWeight: '600' }}>{req.price}</Text>

                      <View style={[styles.pill, { borderColor: pill.color }]}>
                        <pill.Icon size={12} color={pill.color} />
                        <Text style={[styles.pillText, { color: pill.color }]}>{pill.text}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Fila inferior: fecha + acciones */}
                  <View style={styles.footerRow}>
                    <Text style={styles.grayTextSmall}>
                      {req.date} • {req.time}
                    </Text>

                    <View style={styles.actionRow}>
                      {req.status === 'pending' && (
                        <>
                          <TouchableOpacity style={styles.btnOutlineSm}>
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

                      {req.status === 'accepted' && (
                        <TouchableOpacity
                          style={styles.btnOutlineSm}
                          onPress={() => openScheduleModal(req)}
                        >
                          <Calendar size={14} color="#e5e7eb" />
                          <Text style={styles.btnOutlineText}> Programar</Text>
                        </TouchableOpacity>
                      )}

                      {req.status === 'completed' && (
                        <TouchableOpacity style={styles.btnOutlineSm} onPress={onNext}>
                          <Eye size={14} color="#e5e7eb" />
                          <Text style={styles.btnOutlineText}> Ver detalles</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB: PERFIL */}
        {tab === 'profile' && (
          <View style={{ gap: 12 }}>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.title}>Información del Servicio</Text>
                <TouchableOpacity style={styles.btnOutlineSm}>
                  <Edit size={14} color="#e5e7eb" />
                  <Text style={styles.btnOutlineText}> Editar</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10, marginTop: 10 }}>
                <Field label="Nombre del servicio" value={providerData.service} />
                <Field label="Categoría" value={providerData.category} />
                <Field label="Experiencia" value={providerData.experience} />
                <Field label="Teléfono" value={providerData.phone} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Servicios Ofrecidos</Text>
              <View style={styles.badgeWrap}>
                {['Destape de tuberías', 'Reparación de grifos', 'Instalación de sanitarios', 'Calentadores de agua'].map(t => (
                  <View key={t} style={styles.badgeChip}>
                    <Text style={styles.badgeChipText}>{t}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={[styles.btnOutlineSm, { marginTop: 10 }]}>
                <Text style={styles.btnOutlineText}>+ Agregar servicio</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB: ANALYTICS */}
        {tab === 'analytics' && (
          <View style={{ gap: 12 }}>
            <View style={styles.card}>
              <Text style={styles.title}>Rendimiento del Mes</Text>
              <View style={{ marginTop: 10, gap: 10 }}>
                <KV label="Trabajos completados" value="23" />
                <KV label="Ingresos totales" value="$1,840" valueColor="#34d399" />
                <KV label="Tiempo de respuesta promedio" value={providerData.responseTime} />
                <KV label="Calificación promedio" value={`${providerData.rating}/5.0`} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Reseñas Recientes</Text>
              <View style={{ gap: 12, marginTop: 10 }}>
                <View style={styles.row}>
                  <View style={styles.smallAvatar}>
                    <Text style={styles.smallAvatarText}>AG</Text>
                  </View>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <View style={[styles.rowCenter, { gap: 8, marginBottom: 4 }]}>
                      <Text style={styles.titleSm}>Ana García</Text>
                      <View style={styles.row}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} color="#fbbf24" fill="#fbbf24" />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.grayTextSmall}>
                      "Excelente servicio, muy puntual y profesional."
                    </Text>
                  </View>
                </View>
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
                <Row label="Cuándo" value={`${acceptedRequest.date} • ${acceptedRequest.time}`} />
                <Row label="Ubicación" value={acceptedRequest.location} />
                <Row label="Precio estimado" value={acceptedRequest.price} />
              </View>
            )}

            <Text style={styles.modalHint}>
              Coordina detalles (punto exacto, acceso, materiales) por WhatsApp:
            </Text>

            <TouchableOpacity
              style={styles.btnWhatsapp}
              onPress={() => acceptedRequest && openWhatsAppAcceptance(acceptedRequest)}
            >
              <MessageCircle size={16} color="#fff" />
              <Text style={styles.btnWhatsappText}>Coordinar por WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnGhost}
              onPress={() => setAcceptedModalVisible(false)}
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
            <Text style={styles.modalSubtitle}>Propón fecha y hora para coordinar con el cliente</Text>

            <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 8 }}>
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
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
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

            <TouchableOpacity style={styles.btnGhost} onPress={saveSchedule}>
              <Text style={styles.btnGhostText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnGhost} onPress={() => setScheduleModalVisible(false)}>
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
  valueColor = '#e5e7eb',
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
  screen: { flex: 1, backgroundColor: '#0b0b0b' },

  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0f0f10',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(251,191,36,0.2)',
  },

  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: '#111113',
    marginRight: 4,
  },

  avatarWrap: { width: 64, height: 64, borderRadius: 999, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: { backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { color: '#e5e7eb', fontWeight: '700' },

  providerName: { color: 'white', fontWeight: '700', fontSize: 16 },
  providerSubtitle: { color: '#9ca3af', fontSize: 13 },

  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center' },

  ratingText: { color: '#e5e7eb', marginLeft: 4, fontWeight: '600', fontSize: 12 },
  grayText: { color: '#9ca3af' },
  grayTextSmall: { color: '#9ca3af', fontSize: 12 },

  badgeSecondary: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  badgeSecondaryText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700',
  },

  btnOutlineSm: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.4)',
    backgroundColor: 'transparent',
    borderRadius: 10,
    flexDirection: 'row',
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  btnOutlineText: { color: '#e5e7eb', fontWeight: '600', fontSize: 12 },

  statusCard: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0f0f10',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(251,191,36,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusTitle: { color: '#e5e7eb', fontWeight: '700' },

  switchBase: { width: 42, height: 24, borderRadius: 999, padding: 2, justifyContent: 'center' },
  switchThumb: { width: 20, height: 20, borderRadius: 999, backgroundColor: '#111827' },

  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },

  card: {
    backgroundColor: '#0f0f10',
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
    alignSelf: 'stretch',
    paddingBottom: 14,
  },
  cardStat: { flex: 1 },
  statNumber: { fontSize: 22, fontWeight: '800' },

  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#0f0f10',
    borderRadius: 999,
    padding: 4,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabText: { color: '#e5e7eb', fontWeight: '600' },

  cardWarn: { borderColor: 'rgba(251,191,36,0.4)', backgroundColor: 'rgba(251,191,36,0.06)' },
  warnText: { color: '#fbbf24', fontWeight: '600' },

  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smallAvatarText: { color: '#e5e7eb', fontWeight: '700' },

  title: { color: '#e5e7eb', fontWeight: '700' },
  titleSm: { color: '#e5e7eb', fontWeight: '700', fontSize: 13 },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
    borderWidth: 1,
  },
  pillText: { fontSize: 11, fontWeight: '700' },

  btnPrimarySm: { backgroundColor: '#fbbf24', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  btnPrimaryText: { color: '#111827', fontWeight: '700', fontSize: 12 },

  footerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 8 },

  actionRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },

  badgeDanger: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeDangerText: { color: 'white', fontSize: 10, fontWeight: '700' },

  fieldLabel: { color: '#9ca3af', fontSize: 12 },
  fieldValue: { color: '#e5e7eb', fontWeight: '600', marginTop: 2 },

  badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  badgeChip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeChipText: { color: '#e5e7eb', fontSize: 12 },

  // ------- Modales (nuevo estilo) -------
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
  modalContainerLg: {
    gap: 10,
  },
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
  modalSubtitle: { color: '#cbd5e1', fontSize: 13, marginTop: -6 },
  modalHint: { color: '#cbd5e1', fontSize: 13, textAlign: 'center', marginTop: 6 },

  modalDetails: {
    alignSelf: 'stretch',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  rowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLineLabel: { color: '#9ca3af', fontSize: 12 },
  rowLineValue: { color: '#e5e7eb', fontWeight: '700', fontSize: 13 },

  // Botón WhatsApp verde
  btnWhatsapp: {
    alignSelf: 'stretch',
    marginTop: 6,
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnWhatsappText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.2 },

  // Botón "ghost" (texto blanco, contorno sutil)
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

  // Inputs del modal
  input: {
    width: '100%',
    height: 48,
    borderColor: '#2b2b2b',
    borderWidth: 1,
    color: '#fff',
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 15,
    backgroundColor: '#151515',
  },
});
