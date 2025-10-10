// app/(tabs)/AdminScreen.tsx
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
  View
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
      'https://images.unsplash.com/photo-1620919811198-aeffd083ba77?auto=format&fit=crop&w=800&q=60',
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
      'https://images.unsplash.com/photo-1604118600242-e7a6d23ec3a9?auto=format&fit=crop&w=800&q=60',
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
      'https://images.unsplash.com/photo-1686178827149-6d55c72d81df?auto=format&fit=crop&w=800&q=60',
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
      'https://images.unsplash.com/photo-1620455800201-7f00aeef12ed?auto=format&fit=crop&w=800&q=60',
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
  const isNarrow = width < 380; // móvil chico
  const isMedium = width >= 380 && width < 520; // móvil medio
  const isWide = width >= 900;

  // Grid KPIs: 1 / 2 / 3 columnas según ancho
  const kpiBasis = isWide ? '33.333%' : width >= 520 ? '48%' : '100%';

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | Status>('all');
  const [selected, setSelected] = useState<ClaimRequest | null>(null);

  // modal de confirmación
  const [confirm, setConfirm] = useState<{
    type: 'approve' | 'reject';
    item: ClaimRequest | null;
  } | null>(null);

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

  const finalizeApprove = (id: number) => {
    console.log('Approve', id);
    setConfirm(null);
    setSelected(null);
  };
  const finalizeReject = (id: number) => {
    console.log('Reject', id);
    setConfirm(null);
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
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
          rowGap: 10,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* STATS (wrap responsivo) */}
        <View style={styles.kpiWrap}>
          <KpiCard label="Pendientes" value={stats.pending} color="#fbbf24" basis={kpiBasis} />
          <KpiCard label="Aprobados" value={stats.approved} color="#34d399" basis={kpiBasis} />
          <KpiCard label="Rechazados" value={stats.rejected} color="#f87171" basis={kpiBasis} />
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
        <View style={{ marginTop: 12, gap: 12 }}>
          {filtered.map((r) => {
            // disposición por ancho
            const showThumbInline = width >= 520; // lateral a partir de 520
            const showThumbAbove = !showThumbInline && !isNarrow; // arriba en medio
            const hideThumb = isNarrow; // móvil muy chico

            return (
              <Card key={r.id} style={styles.cardShadow}>
                <View style={{ padding: 14 }}>
                  {/* Foto arriba (móvil mediano) */}
                  {showThumbAbove && (
                    <ImageWithFallback src={r.businessImage} style={styles.thumbTop} />
                  )}

                  <View
                    style={[
                      { flexDirection: 'row', columnGap: 12 },
                      (hideThumb || showThumbAbove) && { flexDirection: 'column' },
                    ]}
                  >
                    {/* Foto lateral (>=520) */}
                    {showThumbInline && (
                      <ImageWithFallback src={r.businessImage} style={styles.thumb} />
                    )}

                    <View style={{ flex: 1 }}>
                      {/* Cabecera */}
                      <View
                        style={[
                          styles.titleRow,
                          (hideThumb || showThumbAbove) && {
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            rowGap: 8,
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
                          <Text style={[styles.muted, { fontSize: 12 }]}>{r.claimantEmail}</Text>
                        </View>

                        <View
                          style={[
                            { alignItems: 'flex-end' },
                            (hideThumb || showThumbAbove) && { alignItems: 'flex-start' },
                          ]}
                        >
                          <Badge
                            tone={
                              r.status === 'pending' ? 'soft' : r.status === 'approved' ? 'ok' : 'danger'
                            }
                          >
                            <Text style={styles.badgeText}>{statusText[r.status]}</Text>
                          </Badge>
                          <Text
                            style={{
                              color: priorityColor(r.priority),
                              fontSize: 12,
                              fontWeight: '700',
                              marginTop: 4,
                            }}
                          >
                            Prioridad {r.priority}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.body} numberOfLines={isNarrow ? 3 : 2}>
                        {r.message}
                      </Text>

                      {/* Meta FECHA */}
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
                        <Text style={styles.metaText}>{r.documents.length} documento(s)</Text>
                      </View>

                      {/* Botonera */}
                      <View
                        style={[
                          styles.actionWrap,
                          { marginTop: 10 },
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
                              onPress={() => setConfirm({ type: 'reject', item: r })}
                            >
                              <XCircle size={12} color="#e5e7eb" />
                              <Text style={styles.btnText}> Rechazar</Text>
                            </Btn>
                            <Btn size="sm" onPress={() => setConfirm({ type: 'approve', item: r })}>
                              <CheckCircle size={12} color="#111827" />
                              <Text style={[styles.btnText, { color: '#111827' }]}> Aprobar</Text>
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

      {/* MODAL: DETALLE */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay} />
        {selected && (
          <View style={styles.modalCenter}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Detalles de Solicitud</Text>
              <Text style={styles.modalDesc}>Solicitud de reclamo para {selected.businessName}</Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <ImageWithFallback src={selected.businessImage} style={styles.thumbLg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{selected.businessName}</Text>
                  <Text style={styles.muted}>{selected.category}</Text>
                  <Badge
                    tone={selected.status === 'pending' ? 'soft' : selected.status === 'approved' ? 'ok' : 'danger'}
                  >
                    <Text style={styles.badgeText}>{statusText[selected.status]}</Text>
                  </Badge>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.subTitle}>Información del solicitante</Text>
                <View style={{ gap: 2 }}>
                  <Text style={styles.bodySm}><Text style={styles.bold}>Nombre:</Text> {selected.claimantName}</Text>
                  <Text style={styles.bodySm}><Text style={styles.bold}>Email:</Text> {selected.claimantEmail}</Text>
                  <Text style={styles.bodySm}><Text style={styles.bold}>Teléfono:</Text> {selected.claimantPhone}</Text>
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

              <Btn variant="outline" style={{ marginTop: 14 }} onPress={() => setSelected(null)}>
                <Text style={styles.btnText}>Cerrar</Text>
              </Btn>
            </View>
          </View>
        )}
      </Modal>

      {/* MODAL: CONFIRMACIÓN APROBAR/RECHAZAR */}
      <Modal visible={!!confirm} transparent animationType="fade" onRequestClose={() => setConfirm(null)}>
        <View style={styles.modalOverlay} />
        {confirm?.item && (
          <View style={styles.modalCenter}>
            <View style={[styles.modalCard, { maxWidth: 420 }]}>
              <Text style={styles.modalTitle}>
                {confirm.type === 'approve' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
              </Text>
              <Text style={styles.modalDesc}>
                ¿Estás seguro de {confirm.type === 'approve' ? 'aprobar' : 'rechazar'} la solicitud de{' '}
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
                  style={{ flex: 1, backgroundColor: confirm.type === 'approve' ? '#34d399' : '#f87171', borderColor: 'transparent' }}
                  onPress={() =>
                    confirm.type === 'approve'
                      ? finalizeApprove(confirm.item!.id)
                      : finalizeReject(confirm.item!.id)
                  }
                >
                  {confirm.type === 'approve' ? (
                    <CheckCircle size={14} color="#111827" />
                  ) : (
                    <XCircle size={14} color="#111827" />
                  )}
                  <Text style={[styles.btnText, { color: '#111827' }]}>
                    {' '}{confirm.type === 'approve' ? 'Confirmar' : 'Confirmar'}
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

/* ================== UI EMBEBIDO ================== */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: '#0f0f10',
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(148,163,184,0.18)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function KpiCard({ label, value, color, basis }: { label: string; value: number; color: string; basis: string }) {
  return (
    <Card style={{ flexBasis: basis, flexGrow: 1 }}>
      <View style={styles.kpiCard}>
        <Text style={{ color, fontSize: 24, fontWeight: '900', letterSpacing: 0.2 }}>{value}</Text>
        <Text style={{ color: '#a1a1aa', fontSize: 12 }}>{label}</Text>
      </View>
    </Card>
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
    soft: { bg: 'rgba(148,163,184,0.12)', bd: 'rgba(148,163,184,0.2)', fg: '#e5e7eb' },
    ok: { bg: 'rgba(52,211,153,0.15)', bd: 'rgba(52,211,153,0.35)', fg: '#34d399' },
    danger: { bg: 'rgba(248,113,113,0.15)', bd: 'rgba(248,113,113,0.35)', fg: '#f87171' },
    warn: { bg: 'rgba(251,191,36,0.12)', bd: 'rgba(251,191,36,0.35)', fg: '#fbbf24' },
    outline: { bg: 'transparent', bd: 'rgba(148,163,184,0.28)', fg: '#e5e7eb' },
  }[tone];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: map.bg,
        borderColor: map.bd,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
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
              active && {
                backgroundColor: '#111827',
                borderColor: 'rgba(148,163,184,0.25)',
              },
            ]}
          
          >
            <Text style={[styles.tabText, active && { color: '#fbbf24', fontWeight: '900' }]}>
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
      activeOpacity={0.88}
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          paddingVertical: size === 'sm' ? 8 : 11,
          paddingHorizontal: size === 'sm' ? 12 : 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 96,
        },
        variant === 'default'
          ? { backgroundColor: '#fbbf24', borderColor: '#fbbf24' }
          : { backgroundColor: 'transparent', borderColor: '#3f3f46' },
        style,
      ]}

    >
      {typeof children === 'string' ? <Text style={styles.btnText}>{children}</Text> : children}
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
    borderBottomColor: 'rgba(148,163,184,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h1: { color: '#e5e7eb', fontSize: 18, fontWeight: '900', letterSpacing: 0.2 },
  h2: { color: '#9ca3af', fontSize: 12 },

  badgeText: { color: '#e5e7eb', fontSize: 12, fontWeight: '800' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  searchInput: { color: '#e5e7eb', flex: 1, padding: 0 },

  // KPIs
  kpiWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 6,
  },
  kpiCard: {
    padding: 14,
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
  tabText: { color: '#e5e7eb', fontWeight: '700' },

  // Thumbs
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  thumb: { width: 84, height: 84, borderRadius: 12, backgroundColor: '#111827' },
  thumbTop: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginBottom: 10,
  },
  thumbLg: { width: 84, height: 84, borderRadius: 14, backgroundColor: '#111827' },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  title: { color: '#f3f4f6', fontWeight: '900', fontSize: 16 },
  muted: { color: '#9ca3af' },
  body: { color: '#d1d5db', marginTop: 4, lineHeight: 20 },
  bodySm: { color: '#cbd5e1', fontSize: 13 },
  subTitle: { color: '#e5e7eb', fontWeight: '800', marginBottom: 4 },
  bold: { fontWeight: '800', color: '#e5e7eb' },

  footerMeta: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  metaText: { color: '#9ca3af', fontSize: 12 },
  metaDot: { color: '#6b7280', fontSize: 12 },

  actionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },

  // Modales
  modalOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.65)' },
  modalCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#0f0f10',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
    padding: 16,
  },
  modalTitle: { color: '#f3f4f6', fontWeight: '900', fontSize: 18, letterSpacing: 0.2 },
  modalDesc: { color: '#a1a1aa', marginTop: 6, lineHeight: 20 },
  btnText: { fontWeight: '800', color: '#e5e7eb', fontSize: 12, letterSpacing: 0.2 },
});
