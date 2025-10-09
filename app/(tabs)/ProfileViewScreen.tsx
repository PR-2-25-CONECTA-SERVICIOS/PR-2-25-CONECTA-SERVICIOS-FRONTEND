import { useRouter } from 'expo-router';
import { ArrowLeft, Edit, Mail, Phone, ShieldCheck, Star } from 'lucide-react-native';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Profile = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  verified?: boolean;
  rating?: number;
  reviews?: number;
  services: string[];
};

export default function ProfileViewScreen({
  profile = {
    name: 'Carlos Mendoza',
    email: 'c.mendoza@email.com',
    phone: '+1 234 567 8900',
    avatar: '',
    verified: true,
    rating: 4.8,
    reviews: 127,
    services: ['Plomería general', 'Destape de tuberías', 'Instalación de sanitarios', 'Reparación de fugas'],
  },
  onBack,
  onEdit,
}: {
  profile?: Profile;
  onBack?: () => void;
  onEdit?: () => void;
}) {
  const router = useRouter(); // Para navegación entre pantallas

  // Maneja el clic en un servicio
  const handleServiceClick = (serviceName: string) => {
    router.push('/ServiceDetail'); // Navega a la vista de detalle con el nombre del servicio
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <ArrowLeft size={18} color="#e5e7eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Perfil</Text>

        <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
          <Edit size={18} color="#e5e7eb" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatarWrap}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>
                    {profile.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={[styles.row, { alignItems: 'center' }]}>
                <Text style={styles.name}>{profile.name}</Text>
                {profile.verified && (
                  <View style={styles.badgeSecondary}>
                    <ShieldCheck size={12} color="#fbbf24" />
                    <Text style={styles.badgeSecondaryText}> Verificado</Text>
                  </View>
                )}
              </View>

              {(profile.rating || profile.reviews) && (
                <View style={[styles.row, { marginTop: 6 }]}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.ratingText}>
                    {profile.rating?.toFixed(1)} <Text style={styles.grayText}>({profile.reviews})</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Contacto */}
          <View style={{ marginTop: 14, gap: 10 }}>
            <View style={styles.kv}>
              <Phone size={16} color="#e5e7eb" />
              <Text style={styles.kvValue}>{profile.phone}</Text>
            </View>
            <View style={styles.kv}>
              <Mail size={16} color="#e5e7eb" />
              <Text style={styles.kvValue}>{profile.email}</Text>
            </View>
          </View>
        </View>

        {/* Servicios que ofrece */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Servicios que ofrece</Text>
          <View style={styles.chipsWrap}>
            {profile.services.map((s, i) => (
              <TouchableOpacity key={`${s}-${i}`} onPress={() => handleServiceClick(s)} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Editar (opcional) */}
        <TouchableOpacity style={styles.editBigBtn} onPress={onEdit}>
          <Edit size={16} color="#111827" />
          <Text style={styles.editBigBtnText}> Editar perfil</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0b0b' },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#0f0f10',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(251,191,36,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#e5e7eb', fontWeight: '700', fontSize: 16 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: '#111113',
  },

  card: {
    backgroundColor: '#0f0f10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
  },

  row: { flexDirection: 'row', alignItems: 'center' },

  avatarWrap: { width: 64, height: 64, borderRadius: 999, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: { backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { color: '#e5e7eb', fontWeight: '700', fontSize: 18 },

  name: { color: '#e5e7eb', fontWeight: '800', fontSize: 18 },
  badgeSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  badgeSecondaryText: { color: '#fbbf24', fontSize: 10, fontWeight: '700' },

  ratingText: { color: '#e5e7eb', marginLeft: 6, fontWeight: '600', fontSize: 12 },
  grayText: { color: '#9ca3af' },

  kv: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111113',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  kvValue: { color: '#e5e7eb', fontWeight: '600' },

  sectionTitle: { color: '#e5e7eb', fontWeight: '700', marginBottom: 8 },

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

  editBigBtn: {
    marginTop: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  editBigBtnText: { color: '#111827', fontWeight: '800' },
});
