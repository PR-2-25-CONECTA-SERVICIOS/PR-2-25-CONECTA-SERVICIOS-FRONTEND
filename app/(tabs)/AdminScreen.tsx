// AdminScreen.tsx (Dark + responsivo completo, sin libs externas)
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Eye,
    Search,
    XCircle,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
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
} from 'react-native';

/* ================== TIPOS ================== */
type Status = 'pending' | 'approved' | 'rejected';
type Priority = 'high' | 'medium' | 'low';

interface ClaimRequest {
  id: number;
  businessName: string;
  category: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  message: string;
  documents: string[];
  submittedDate: string;
  status: Status;
  businessImage: string;
  priority: Priority;
}

/* ================== MOCK ================== */
const mockClaimRequests: ClaimRequest[] = [
  {
    id: 1,
    businessName: 'Restaurante La Casa',
    category: 'Restaurante',
    claimantName: 'Roberto García',
    claimantEmail: 'roberto@email.com',
    claimantPhone: '+1 234 567 8901',
    message:
      'Soy el dueño de este restaurante desde hace 5 años. Tengo todos los documentos legales que lo comprueban.',
    documents: ['licencia_comercial.pdf', 'cedula_rif.pdf'],
    submittedDate: '2025-01-25',
    status: 'pending',
    businessImage:
      'https://images.unsplash.com/photo-1620919811198-aeffd083ba77?auto=format&fit=crop&w=400&q=60',
    priority: 'high',
  },
  {
    id: 2,
    businessName: 'Plomería Express',
    category: 'Servicios',
    claimantName: 'Carlos Mendoza',
    claimantEmail: 'carlos@plomeria.com',
    claimantPhone: '+1 234 567 8902',
    message:
      'Este es mi negocio de plomería que he estado operando por más de 10 años.',
    documents: ['registro_mercantil.pdf'],
    submittedDate: '2025-01-24',
    status: 'pending',
    businessImage:
      'https://images.unsplash.com/photo-1604118600242-e7a6d23ec3a9?auto=format&fit=crop&w=400&q=60',
    priority: 'medium',
  },
  {
    id: 3,
    businessName: 'Limpieza ProClean',
    category: 'Servicios',
    claimantName: 'Laura Jiménez',
    claimantEmail: 'laura@proclean.com',
    claimantPhone: '+1 234 567 8903',
    message:
      'Fundé esta empresa de limpieza hace 3 años. Adjunto documentos de constitución.',
    documents: ['acta_constitutiva.pdf', 'rif.pdf'],
    submittedDate: '2025-01-23',
    status: 'approved',
    businessImage:
      'https://images.unsplash.com/photo-1686178827149-6d55c72d81df?auto=format&fit=crop&w=400&q=60',
    priority: 'low',
  },
  {
    id: 4,
    businessName: 'Delivery Rápido',
    category: 'Delivery',
    claimantName: 'Miguel Torres',
    claimantEmail: 'miguel@delivery.com',
    claimantPhone: '+1 234 567 8904',
    message:
      'Esta información de mi negocio está incorrecta. Necesito actualizarla urgentemente.',
    documents: ['licencia_transporte.pdf'],
    submittedDate: '2025-01-22',
    status: 'rejected',
    businessImage:
      'https://images.unsplash.com/photo-1620455800201-7f00aeef12ed?auto=format&fit=crop&w=400&q=60',
    priority: 'medium',
  },
];

/* ================== HELPERS ================== */
const statusText: Record<Status, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const priorityColor = (p: Priority) =>
  p === 'high' ? '#f87171' : p === 'medium' ? '#fbbf24' : '#34d399';

/* ================== PANTALLA ================== */
export default function AdminScreen() {
  const { width } = useWindowDimensions();

  // Breakpoints simples
  const isNarrow = width < 380;             // móvil chico: oculta foto y apila chips
  const isMedium = width >= 380 && width < 520; // móvil medio: foto arriba
  // Grid KPIs: 1 / 2 / 3 columnas según ancho
  const kpiBasis =
    width >= 900 ? '33.333%' :
    width >= 520 ? '48%' :
    '100%';

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | Status>('all');
  const [selected, setSelected] = useState<ClaimRequest | null>(null);

  const stats = useMemo(
    () => ({
      pending: mockClaimRequests.filter((r) => r.status === 'pending').length,
      approved: mockClaimRequests.filter((r) => r.status === 'approved').length,
      rejected: mockClaimRequests.filter((r) => r.status === 'rejected').length,
    }),
    []
  );

  const filtered = useMemo(() => {
    const base = mockClaimRequests.filter(
      (r) =>
        r.businessName.toLowerCase().includes(search.toLowerCase()) ||
        r.claimantName.toLowerCase().includes(search.toLowerCase())
    );
    if (tab === 'all') return base;
    return base.filter((r) => r.status === tab);
  }, [search, tab]);

  const handleApprove = (id: number) => {
    console.log('Approve', id);
    setSelected(null);
  };
  const handleReject = (id: number) => {
    console.log('Reject', id);
    setSelected(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0b' }}>
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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* STATS (wrap responsivo) */}
        <View style={styles.kpiWrap}>
          <Card style={{ flexBasis: kpiBasis, flexGrow: 1 }}>
            <View style={styles.kpiCard}>
              <Text style={{ color: '#fbbf24', fontSize: 22, fontWeight: '800' }}>
                {stats.pending}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>Pendientes</Text>
            </View>
          </Card>
          <Card style={{ flexBasis: kpiBasis, flexGrow: 1 }}>
            <View style={styles.kpiCard}>
              <Text style={{ color: '#34d399', fontSize: 22, fontWeight: '800' }}>
                {stats.approved}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>Aprobados</Text>
            </View>
          </Card>
          <Card style={{ flexBasis: kpiBasis, flexGrow: 1 }}>
            <View style={styles.kpiCard}>
              <Text style={{ color: '#f87171', fontSize: 22, fontWeight: '800' }}>
                {stats.rejected}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>Rechazados</Text>
            </View>
          </Card>
        </View>

        {/* TABS */}
        <Segmented
          value={tab}
          onChange={setTab}
          items={[
            { key: 'all', label: 'Todos' },
            { key: 'pending', label: 'Pendientes' },
            { key: 'approved', label: 'Aprobados' },
            { key: 'rejected', label: 'Rechazados' },
          ]}
        />

        {/* LISTA */}
        <View style={{ marginTop: 12, gap: 10 }}>
          {filtered.map((r) => {
            // layout según ancho
            const showThumbInline = !isNarrow && !isMedium; // grande: foto lateral
            const showThumbAbove = isMedium;                 // medio: foto arriba
            const hideThumb = isNarrow;                      // chico: sin foto

            return (
              <Card key={r.id}>
                <View style={{ padding: 12 }}>
                  {/* Foto arriba (móvil mediano) */}
                  {showThumbAbove && (
                    <ImageWithFallback src={r.businessImage} style={styles.thumbTop} />
                  )}

                  <View
                    style={[
                      { flexDirection: 'row', gap: 10 },
                      (hideThumb || showThumbAbove) && { flexDirection: 'column' },
                    ]}
                  >
                    {/* Foto lateral (sólo ancho grande) */}
                    {showThumbInline && (
                      <ImageWithFallback src={r.businessImage} style={styles.thumb} />
                    )}

                    <View style={{ flex: 1 }}>
                      {/* Cabecera: en angosto se apila a 2 líneas */}
                      <View
                        style={[
                          styles.titleRow,
                          (hideThumb || showThumbAbove) && {
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: 6,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={styles.title}>{r.businessName}</Text>
                            <Badge tone="outline">
                              <Text style={styles.badgeText}>{r.category}</Text>
                            </Badge>
                          </View>
                          <Text style={styles.muted}>{r.claimantName}</Text>
                          <Text style={[styles.muted, { fontSize: 12 }]}>
                            {r.claimantEmail}
                          </Text>
                        </View>

                        <View
                          style={[
                            { alignItems: 'flex-end' },
                            (hideThumb || showThumbAbove) && { alignItems: 'flex-start' },
                          ]}
                        >
                          <Badge
                            tone={
                              r.status === 'pending' ? 'soft' :
                              r.status === 'approved' ? 'ok' : 'danger'
                            }
                          >
                            <Text style={styles.badgeText}>{statusText[r.status]}</Text>
                          </Badge>
                          <Text
                            style={{
                              color: priorityColor(r.priority),
                              fontSize: 12,
                              fontWeight: '600',
                              marginTop: 4,
                            }}
                          >
                            Prioridad {r.priority}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.body} numberOfLines={2}>
                        {r.message}
                      </Text>

                      {/* Meta FECHA por encima de los botones */}
                      <View style={[styles.footerMeta, { marginTop: 10 }]}>
                        <Calendar size={12} color="#9ca3af" />
                        <Text style={styles.metaText}>
                          {' '}
                          {new Date(r.submittedDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                        <Text style={styles.metaDot}> • </Text>
                        <Text style={styles.metaText}>
                          {r.documents.length} documento(s)
                        </Text>
                      </View>

                      {/* Botonera (WRAP) */}
                      <View
                        style={[
                          styles.actionWrap,
                          { marginTop: 8 },
                          (hideThumb || showThumbAbove) && { justifyContent: 'flex-start' },
                        ]}
                      >
                        <Btn variant="outline" size="sm" onPress={() => setSelected(r)}>
                          <Eye size={12} color="#e5e7eb" />
                          <Text style={styles.btnText}> Ver</Text>
                        </Btn>

                        {r.status === 'pending' && (
                          <>
                            <Btn
                              variant="outline"
                              size="sm"
                              onPress={() => handleReject(r.id)}
                            >
                              <XCircle size={12} color="#e5e7eb" />
                              <Text style={styles.btnText}> Rechazar</Text>
                            </Btn>
                            <Btn size="sm" onPress={() => handleApprove(r.id)}>
                              <CheckCircle size={12} color="#111827" />
                              <Text style={[styles.btnText, { color: '#111827' }]}>
                                {' '}Aprobar
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
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay} />
        {selected && (
          <View style={styles.modalCenter}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Detalles de Solicitud</Text>
              <Text style={styles.modalDesc}>
                Solicitud de reclamo para {selected.businessName}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <ImageWithFallback src={selected.businessImage} style={styles.thumbLg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{selected.businessName}</Text>
                  <Text style={styles.muted}>{selected.category}</Text>
                  <Badge
                    tone={
                      selected.status === 'pending' ? 'soft' :
                      selected.status === 'approved' ? 'ok' : 'danger'
                    }
                  >
                    <Text style={styles.badgeText}>{statusText[selected.status]}</Text>
                  </Badge>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.subTitle}>Información del solicitante</Text>
                <View style={{ gap: 2 }}>
                  <Text style={styles.bodySm}>
                    <Text style={styles.bold}>Nombre:</Text> {selected.claimantName}
                  </Text>
                  <Text style={styles.bodySm}>
                    <Text style={styles.bold}>Email:</Text> {selected.claimantEmail}
                  </Text>
                  <Text style={styles.bodySm}>
                    <Text style={styles.bold}>Teléfono:</Text> {selected.claimantPhone}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 10 }}>
                <Text style={styles.subTitle}>Mensaje</Text>
                <Text style={styles.body}>{selected.message}</Text>
              </View>

              <View style={{ marginTop: 10 }}>
                <Text style={styles.subTitle}>Documentos</Text>
                {selected.documents.map((d, i) => (
                  <Text key={i} style={styles.bodySm}>📄 {d}</Text>
                ))}
              </View>

              {selected.status === 'pending' && (
                <View style={[styles.actionWrap, { marginTop: 14 }]}>
                  <Btn
                    variant="outline"
                    style={{ flex: 1 }}
                    onPress={() => handleReject(selected.id)}
                  >
                    <XCircle size={14} color="#e5e7eb" />
                    <Text style={styles.btnText}> Rechazar</Text>
                  </Btn>
                  <Btn
                    style={{ flex: 1, backgroundColor: '#fbbf24', borderColor: '#fbbf24' }}
                    onPress={() => handleApprove(selected.id)}
                  >
                    <CheckCircle size={14} color="#111827" />
                    <Text style={[styles.btnText, { color: '#111827' }]}> Aprobar</Text>
                  </Btn>
                </View>
              )}

              <Btn variant="outline" style={{ marginTop: 10 }} onPress={() => setSelected(null)}>
                <Text style={styles.btnText}>Cerrar</Text>
              </Btn>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

/* ================== UI EMBEBIDO ================== */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: '#0f0f10',
          borderRadius: 12,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(148,163,184,0.2)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Badge({
  children,
  tone = 'soft',
}: {
  children: React.ReactNode;
  tone?: 'soft' | 'ok' | 'danger' | 'warn' | 'outline';
}) {
  const map = {
    soft: { bg: 'rgba(148,163,184,0.12)', bd: 'rgba(148,163,184,0.25)', fg: '#e5e7eb' },
    ok: { bg: 'rgba(52,211,153,0.15)', bd: 'rgba(52,211,153,0.35)', fg: '#34d399' },
    danger: { bg: 'rgba(248,113,113,0.15)', bd: 'rgba(248,113,113,0.35)', fg: '#f87171' },
    warn: { bg: 'rgba(251,191,36,0.12)', bd: 'rgba(251,191,36,0.35)', fg: '#fbbf24' },
    outline: { bg: 'transparent', bd: 'rgba(148,163,184,0.3)', fg: '#e5e7eb' },
  }[tone];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: map.bg,
        borderColor: map.bd,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: 'flex-start',
      }}
    >
      {children}
    </View>
  );
}

function Segmented({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (k: any) => void;
  items: { key: string; label: string }[];
}) {
  return (
    <View style={styles.tabs}>
      {items.map((it) => {
        const active = value === it.key;
        return (
          <TouchableOpacity
            key={it.key}
            onPress={() => onChange(it.key)}
            style={[
              styles.tabBtn,
              active && { backgroundColor: '#111827', borderColor: 'rgba(148,163,184,0.25)' },
            ]}
          >
            <Text style={[styles.tabText, active && { color: '#fbbf24', fontWeight: '800' }]}>
              {it.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Btn({
  children,
  variant = 'default',
  size = 'md',
  style,
  onPress,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
  style?: any;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          borderRadius: 10,
          borderWidth: 1,
          paddingVertical: size === 'sm' ? 8 : 10,
          paddingHorizontal: size === 'sm' ? 10 : 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 96,
        },
        variant === 'default'
          ? { backgroundColor: '#fbbf24', borderColor: '#fbbf24' }
          : { backgroundColor: 'transparent', borderColor: '#374151' },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={styles.btnText}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

function ImageWithFallback({ src, style }: { src: string; style?: any }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <View style={[{ backgroundColor: '#1f2937' }, style]} />;
  return <Image source={{ uri: src }} style={style} onError={() => setErr(true)} />;
}

/* ================== STYLES ================== */
const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#0f0f10',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h1: { color: '#e5e7eb', fontSize: 18, fontWeight: '800' },
  h2: { color: '#9ca3af', fontSize: 12 },

  badgeText: { color: '#e5e7eb', fontSize: 12, fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10
  },
  searchInput: { color: '#e5e7eb', flex: 1, padding: 0 },

  // KPIs: contenedor responsivo
  kpiWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  kpiCard: {
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },

  tabs: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#0f0f10',
    borderRadius: 999,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  tabText: { color: '#e5e7eb', fontWeight: '600' },

  // Thumbs
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#111827' },
  thumbTop: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#111827',
    marginBottom: 8,
  },
  thumbLg: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#111827' },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  title: { color: '#e5e7eb', fontWeight: '800' },
  muted: { color: '#9ca3af' },
  body: { color: '#d1d5db', marginTop: 4 },
  bodySm: { color: '#cbd5e1', fontSize: 13 },
  subTitle: { color: '#e5e7eb', fontWeight: '700', marginBottom: 4 },
  bold: { fontWeight: '700', color: '#e5e7eb' },

  footerMeta: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  metaText: { color: '#9ca3af', fontSize: 12 },
  metaDot: { color: '#6b7280', fontSize: 12 },

  // Botonera RESPONSIVE
  actionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },

  // Modal
  modalOverlay: { position: 'absolute', inset: 0 as any, backgroundColor: 'rgba(0,0,0,0.7)' },
  modalCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0f0f10',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
    padding: 16,
  },
  modalTitle: { color: '#e5e7eb', fontWeight: '800', fontSize: 18 },
  modalDesc: { color: '#9ca3af', marginTop: 4 },
  btnText: { fontWeight: '700', color: '#e5e7eb', fontSize: 12 },
});
