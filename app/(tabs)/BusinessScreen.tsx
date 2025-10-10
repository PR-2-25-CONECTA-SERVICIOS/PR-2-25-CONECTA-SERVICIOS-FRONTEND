// app/(tabs)/BusinessScreen.tsx
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Clock,
  MapPin,
  Phone,
  Send,
  Star,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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

type Props = { onNext?: () => void };

// ---- MOCK ----
const mockBusiness = {
  id: 1,
  name: 'Restaurante La Casa',
  category: 'Restaurante',
  description:
    'Comida casera tradicional con los mejores ingredientes frescos. Especialidad en carnes a la parrilla y platos típicos regionales.',
  address: 'Av. Principal 789, Centro',
  phone: '+1 234 567 8901',
  website: 'www.restaurantelacasa.com',
  hours: 'Mar-Dom: 12:00-22:00, Lun: Cerrado',
  rating: 4.6,
  reviews: 189,
  priceRange: '$15-30 por persona',
  image:
    'https://images.unsplash.com/photo-1620919811198-aeffd083ba77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMHNlcnZpY2V8ZW58MXx8fHwxNzU2NDM4MTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  gallery: [
    'https://images.unsplash.com/photo-1620919811198-aeffd083ba77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMHNlcnZpY2V8ZW58MXx8fHwxNzU2NDM4MTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  ],
  owner: { name: 'Roberto García', avatar: '', verified: false, joinDate: '2023' },
  amenities: ['WiFi gratis', 'Estacionamiento', 'Aire acondicionado', 'Música en vivo', 'Terraza'],
  specialties: ['Parrillas', 'Platos tradicionales', 'Postres caseros', 'Bebidas artesanales'],
  isOwner: false,
};

// llamar (usa el mock)
const callNow = () => {
  Linking.openURL(`tel:${mockBusiness.phone.replace(/\s|\+/g, '')}`).catch(() => {});
};

export default function BusinessScreen({ onNext }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [msg, setMsg] = useState('');
  const [docs, setDocs] = useState<string[]>([]);
  const canSubmit = ownerName.trim() && email.trim();

  // responsive para la fila del propietario
  const [isOwnerNarrow, setIsOwnerNarrow] = useState(false);

  useEffect(() => {}, [open]);

  const handleSubmit = () => {
    setOpen(false);
    onNext?.();
  };

  const handleUpload = () => setDocs((p) => [...p, `documento_${Date.now()}.pdf`]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0b' }}>
      {/* HERO */}
      <View style={{ height: 190, backgroundColor: '#111827' }}>
        <ImageWithFallback src={mockBusiness.image} style={{ width: '100%', height: '100%' }} />

        {/* Botón volver */}
        <View style={{ position: 'absolute', top: 12, left: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/LocalesScreen')}
            activeOpacity={0.9}
            style={styles.backBtn}
          >
            <ArrowLeft size={18} color="#e5e7eb" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{mockBusiness.name}</Text>
          <Text style={styles.heroSubtitle}>{mockBusiness.category}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* INFO BÁSICA */}
        <Card>
          <View style={{ padding: 12 }}>
            <View style={{ marginBottom: 10 }}>
              <View style={[styles.row, { gap: 12, marginBottom: 8 }]}>
                <View style={[styles.row, { gap: 6 }]}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.textStrong}>{mockBusiness.rating}</Text>
                  <Text style={styles.textMuted}>({mockBusiness.reviews} reseñas)</Text>
                </View>
              </View>
              <Text style={styles.textBody}>{mockBusiness.description}</Text>
            </View>

            <View style={{ gap: 8 }}>
              <RowIcon icon={<MapPin size={16} color="#9ca3af" />}>{mockBusiness.address}</RowIcon>
              <RowIcon icon={<Clock size={16} color="#9ca3af" />}>{mockBusiness.hours}</RowIcon>
              <RowIcon icon={<Phone size={16} color="#9ca3af" />}>{mockBusiness.phone}</RowIcon>
            </View>

            <View style={[styles.row, { gap: 10, marginTop: 12 }]}>
              <Btn onPress={callNow}>
                <View style={styles.row}>
                  <Phone size={16} color="#fff" />
                  <Text style={styles.btnText}>  Llamar</Text>
                </View>
              </Btn>
            </View>
          </View>
        </Card>

        {/* PROPIETARIO (responsive) */}
        <Card>
          <View style={{ padding: 12 }}>
            <View
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                setIsOwnerNarrow(w < 360); // si es chico, apila en columna
              }}
              style={[styles.ownerRow, isOwnerNarrow && styles.ownerRowNarrow]}
            >
              <View style={styles.row}>
                <Avatar initials="RG" />
                <View style={{ marginLeft: 10 }}>
                  <View style={[styles.row, { gap: 6 }]}>
                    <Text style={styles.textStrong}>{mockBusiness.owner.name}</Text>
                    {!mockBusiness.owner.verified && (
                      <BadgeSecondary small>No verificado</BadgeSecondary>
                    )}
                  </View>
                  <Text style={styles.textMuted}>Miembro desde {mockBusiness.owner.joinDate}</Text>
                </View>
              </View>

              {!mockBusiness.isOwner && (
                <Btn
                  variant="outline"
                  size="sm"
                  onPress={() => setOpen(true)}
                  style={isOwnerNarrow ? styles.ownerButtonNarrow : undefined}
                >
                  <View style={styles.row}>
                    <AlertTriangle size={14} color="#e5e7eb" />
                    <Text style={[styles.btnText, { color: '#e5e7eb' }]}>  Reclamar negocio</Text>
                  </View>
                </Btn>
              )}
            </View>
          </View>
        </Card>

        {/* ESPECIALIDADES */}
        <Card>
          <CardHeader title="Especialidades" />
          <View style={{ padding: 12 }}>
            <View style={styles.grid2}>
              {mockBusiness.specialties.map((s, i) => (
                <BadgeSecondary key={i} center>
                  {s}
                </BadgeSecondary>
              ))}
            </View>
          </View>
        </Card>

        {/* GALERÍA */}
        <Card>
          <CardHeader title="Galería" />
          <View style={{ padding: 12 }}>
            <View style={styles.grid2gap}>
              {mockBusiness.gallery.map((src, i) => (
                <ImageWithFallback
                  key={i}
                  src={src}
                  style={{ aspectRatio: 1, borderRadius: 10, backgroundColor: '#1f2937' }}
                />
              ))}
              <View style={styles.uploadBox}>
                <Camera size={22} color="#9ca3af" />
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 6 }}>Más fotos</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* RESEÑAS */}
        <Card>
          <CardHeader title="Reseñas Recientes" />
          <View style={{ padding: 12 }}>
            <View style={[styles.row, { alignItems: 'flex-start' }]}>
              <Avatar initials="MR" small />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <View style={[styles.row, { gap: 6, marginBottom: 4 }]}>
                  <Text style={styles.textStrongSm}>María Rodríguez</Text>
                  <View style={styles.row}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} color="#fbbf24" fill="#fbbf24" />
                    ))}
                  </View>
                </View>
                <Text style={styles.textBody}>
                  "Excelente comida y muy buen servicio. El ambiente es muy acogedor."
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* ADVERTENCIA */}
        {!mockBusiness.owner.verified && (
          <Card
            style={{
              borderColor: 'rgba(251,191,36,0.35)',
              backgroundColor: 'rgba(251,191,36,0.06)',
            }}
          >
            <View style={{ padding: 12 }}>
              <View style={[styles.row, { alignItems: 'flex-start', gap: 8 }]}>
                <AlertTriangle size={18} color="#fbbf24" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fbbf24', fontWeight: '700' }}>
                    Negocio no verificado
                  </Text>
                  <Text style={{ color: '#eab308', marginTop: 2, fontSize: 13 }}>
                    Este negocio aún no ha sido verificado por el propietario. La información podría
                    no estar actualizada.
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* MODAL RECLAMAR NEGOCIO */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay} />
        <View style={styles.modalCenter}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reclamar Negocio</Text>
            <Text style={styles.modalDesc}>
              Si eres el dueño de este negocio, completa el formulario para verificar tu propiedad.
            </Text>

            <View style={{ gap: 10, marginTop: 10 }}>
              <Field label="Nombre completo">
                <Input
                  value={ownerName}
                  onChangeText={setOwnerName}
                  placeholder="Tu nombre completo"
                />
              </Field>

              <Field label="Correo electrónico">
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </Field>

              <Field label="Teléfono">
                <Input
                  value={tel}
                  onChangeText={setTel}
                  placeholder="+1 234 567 8900"
                  keyboardType="phone-pad"
                />
              </Field>

              <Field label="Mensaje adicional">
                <Textarea
                  value={msg}
                  onChangeText={setMsg}
                  placeholder="Explica por qué eres el dueño legítimo de este negocio..."
                />
              </Field>

              <Text style={styles.inputLabel}>Documentos de verificación</Text>
              <Btn variant="outline" size="sm" onPress={handleUpload}>
                <View style={styles.row}>
                  <Camera size={16} color="#e5e7eb" />
                  <Text style={[styles.btnText, { color: '#e5e7eb' }]}>
                    {'  '}Subir documento
                  </Text>
                </View>
              </Btn>
              {docs.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  {docs.map((d, i) => (
                    <Text key={i} style={{ color: '#9ca3af', fontSize: 13 }}>
                      📄 {d}
                    </Text>
                  ))}
                </View>
              )}

              <View style={[styles.row, { gap: 10, marginTop: 8 }]}>
                <Btn variant="outline" style={{ flex: 1 }} onPress={() => setOpen(false)}>
                  <Text style={[styles.btnText, { color: '#e5e7eb' }]}>Cancelar</Text>
                </Btn>
                <Btn
                  style={{
                    flex: 1,
                    opacity: canSubmit ? 1 : 0.5,
                    backgroundColor: '#fbbf24',
                    borderColor: '#fbbf24',
                  }}
                  disabled={!canSubmit}
                  onPress={handleSubmit}
                >
                  <View style={styles.row}>
                    <Send size={16} color="#111827" />
                    <Text style={[styles.btnText, { color: '#111827' }]}>
                      {'  '}Enviar solicitud
                    </Text>
                  </View>
                </Btn>
              </View>

              <Text style={styles.modalNote}>
                Tu solicitud será revisada por un administrador en un plazo de 2-3 días hábiles.
              </Text>
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

  inputLabel: { color: '#e5e7eb', fontSize: 12, marginBottom: 6, fontWeight: '600' },
});
