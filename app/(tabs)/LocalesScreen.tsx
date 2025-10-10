// app/pages/LocalesScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type Hours = Record<DayKey, { open: string; close: string } | null>;

type Local = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
  verified: boolean;
  featured?: boolean;
  hours: Hours;
};

const CATEGORIES = ['Todos', 'Restaurante', 'Cafetería', 'Supermercado', 'Ferretería', 'Farmacia'];

const MOCK_LOCALES: Local[] = [
  {
    id: 'l1',
    name: 'Restaurante La Casa',
    category: 'Restaurante',
    rating: 4.6,
    reviews: 238,
    distance: '1.2 km',
    verified: true,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1620919811198-aeffd083ba77?auto=format&fit=crop&w=1200&q=80',
    hours: {
      mon: { open: '10:00', close: '23:00' },
      tue: { open: '10:00', close: '23:00' },
      wed: { open: '10:00', close: '23:00' },
      thu: { open: '10:00', close: '23:00' },
      fri: { open: '10:00', close: '23:59' },
      sat: { open: '10:00', close: '23:59' },
      sun: { open: '11:00', close: '22:00' },
    },
  },
  {
    id: 'l2',
    name: 'Café Central',
    category: 'Cafetería',
    rating: 4.8,
    reviews: 321,
    distance: '0.6 km',
    verified: false,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    hours: {
      mon: { open: '07:00', close: '20:00' },
      tue: { open: '07:00', close: '20:00' },
      wed: { open: '07:00', close: '20:00' },
      thu: { open: '07:00', close: '20:00' },
      fri: { open: '07:00', close: '20:00' },
      sat: { open: '08:00', close: '19:00' },
      sun: null,
    },
  },
  {
    id: 'l3',
    name: 'Súper Ahorro',
    category: 'Supermercado',
    rating: 4.4,
    reviews: 510,
    distance: '2.0 km',
    verified: true,
    image:
      'https://images.unsplash.com/photo-1514923995763-768e52f5af87?auto=format&fit=crop&w=1200&q=80',
    hours: {
      mon: { open: '08:00', close: '22:00' },
      tue: { open: '08:00', close: '22:00' },
      wed: { open: '08:00', close: '22:00' },
      thu: { open: '08:00', close: '22:00' },
      fri: { open: '08:00', close: '22:00' },
      sat: { open: '08:00', close: '22:00' },
      sun: { open: '09:00', close: '21:00' },
    },
  },
  {
    id: 'l4',
    name: 'Ferretería El Tornillo',
    category: 'Ferretería',
    rating: 4.5,
    reviews: 94,
    distance: '0.9 km',
    verified: false,
    image:
      'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1200&q=80',
    hours: {
      mon: { open: '09:00', close: '18:30' },
      tue: { open: '09:00', close: '18:30' },
      wed: { open: '09:00', close: '18:30' },
      thu: { open: '09:00', close: '18:30' },
      fri: { open: '09:00', close: '18:30' },
      sat: { open: '09:00', close: '14:00' },
      sun: null,
    },
  },
  {
    id: 'l5',
    name: 'Farmacia Salud+',
    category: 'Farmacia',
    rating: 4.7,
    reviews: 176,
    distance: '0.4 km',
    verified: true,
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    hours: {
      mon: { open: '08:00', close: '22:00' },
      tue: { open: '08:00', close: '22:00' },
      wed: { open: '08:00', close: '22:00' },
      thu: { open: '08:00', close: '22:00' },
      fri: { open: '08:00', close: '22:00' },
      sat: { open: '08:00', close: '22:00' },
      sun: { open: '08:00', close: '22:00' },
    },
  },
];

function weekdayKey(date = new Date()): DayKey {
  const idx = date.getDay();
  return (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][idx] as DayKey);
}
function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function isOpenNow(hours: Hours, now = new Date()) {
  const key = weekdayKey(now);
  const today = hours[key];
  if (!today) return { open: false, label: 'Cerrado' };
  const mins = now.getHours() * 60 + now.getMinutes();
  const openM = toMinutes(today.open);
  const closeM = toMinutes(today.close);
  const open = mins >= openM && mins < closeM;
  const label = open ? 'Abierto ahora' : `Abre ${today.open}`;
  return { open, label };
}

export default function LocalesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const featured = useMemo(() => MOCK_LOCALES.filter(l => l.featured), []);
  const filtered = useMemo(
    () =>
      MOCK_LOCALES.filter(
        l =>
          (category === 'Todos' || l.category === category) &&
          l.name.toLowerCase().includes(search.toLowerCase())
      ),
    [category, search]
  );

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.chip, item === category && styles.chipActive]}
      onPress={() => setCategory(item)}
      activeOpacity={0.9}
    >
      <Text style={[styles.chipText, item === category && styles.chipTextActive]}>{item}</Text>
    </TouchableOpacity>
  );

  const renderFeatured = ({ item }: { item: Local }) => {
    const status = isOpenNow(item.hours);
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => router.push('/BusinessScreen')}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.image }} style={styles.featuredImage} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{status.open ? 'Abierto' : 'Cerrado'}</Text>
        </View>
        <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <View style={styles.featuredContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <View style={styles.inline}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rateText}>{item.rating}</Text>
            <Text style={styles.muted}>({item.reviews})</Text>
            <View style={styles.dot} />
            <Ionicons name="location" size={12} color="#9ca3af" />
            <Text style={styles.muted}>{item.distance}</Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={[styles.status, status.open ? styles.statusOpen : styles.statusClosed]}>
              {status.label}
            </Text>
            {item.verified ? (
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={12} color="#0b0d11" />
                <Text style={styles.verifiedText}>Verificado</Text>
              </View>
            ) : (
              <View style={styles.unverifiedPill}>
                <Ionicons name="alert-circle" size={12} color="#fff" />
                <Text style={styles.unverifiedText}>No verificado</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLocal = ({ item }: { item: Local }) => {
    const status = isOpenNow(item.hours);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/BusinessScreen')}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Ionicons name="heart-outline" size={18} color="#9ca3af" />
          </View>
          <Text style={styles.cardCategory}>{item.category}</Text>

          <View style={[styles.inline, { marginBottom: 6 }]}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rateText}>{item.rating}</Text>
            <Text style={styles.muted}>({item.reviews})</Text>
            <View style={styles.dot} />
            <Ionicons name="location" size={12} color="#9ca3af" />
            <Text style={styles.muted}>{item.distance}</Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={[styles.status, status.open ? styles.statusOpen : styles.statusClosed]}>
              {status.label}
            </Text>
            {item.verified ? (
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={12} color="#0b0d11" />
                <Text style={styles.verifiedText}>Verificado</Text>
              </View>
            ) : (
              <View style={styles.unverifiedPill}>
                <Ionicons name="alert-circle" size={12} color="#fff" />
                <Text style={styles.unverifiedText}>No verificado</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ⬇️ Unificamos TODO en una única FlatList (scroll vertical)
  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderLocal}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Locales cercanos</Text>
              <Text style={styles.subtitle}>Encuentra lugares abiertos ahora</Text>
            </View>

            {/* Acciones */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push('/map')}
                activeOpacity={0.85}
              >
                <Ionicons name="map" size={16} color="#0b0d11" />
                <Text style={styles.actionText}>Ver locales cerca</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnGhost}
                onPress={() => router.push('/map-add')}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={16} color="#FFD700" />
                <Text style={styles.actionGhostText}>Agregar local</Text>
              </TouchableOpacity>
            </View>

            {/* Buscador */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color="#a1a1aa" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar locales, cafeterías…"
                placeholderTextColor="#FFD70088"
                value={search}
                onChangeText={setSearch}
              />
              <Ionicons name="options" size={18} color="#FFD700" />
            </View>

            {/* Categorías (horizontal) */}
            <FlatList
              horizontal
              nestedScrollEnabled
              data={CATEGORIES}
              keyExtractor={(c) => c}
              renderItem={renderCategory}
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
              contentContainerStyle={{ paddingRight: 8 }}
            />

            {/* Destacados (horizontal) */}
            {featured.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.sectionTitle}>Locales Destacados</Text>
                <FlatList
                  horizontal
                  nestedScrollEnabled
                  data={featured}
                  keyExtractor={(i) => i.id}
                  renderItem={renderFeatured}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 8 }}
                />
              </View>
            )}

            {/* Título lista */}
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Todos los Locales</Text>
          </View>
        }
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0d11', paddingHorizontal: 16, paddingTop: 18 },
  header: { marginBottom: 8 },
  title: { color: '#FFD700', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#e5e7eb', opacity: 0.8, marginTop: 2 },

  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: { color: '#0b0d11', fontWeight: '800' },
  actionBtnGhost: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionGhostText: { color: '#FFD700', fontWeight: '800' },

  searchRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141518',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#24262b',
  },
  searchInput: { flex: 1, color: '#fff' },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#1A1A1A',
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a2d34',
  },
  chipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  chipText: { color: '#e5e7eb', fontWeight: '600' },
  chipTextActive: { color: '#0b0d11', fontWeight: '800' },

  sectionTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '800', marginBottom: 8 },

  // Featured
  featuredCard: {
    width: width * 0.7,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111318',
    borderColor: '#2a2d34',
    borderWidth: 1,
  },
  featuredImage: { width: '100%', height: 140 },
  featuredContent: { padding: 12 },
  heartBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#0008', padding: 6, borderRadius: 20 },
  badge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#0b0d11', fontWeight: '800', fontSize: 12 },

  // Cards
  card: {
    flexDirection: 'row',
    backgroundColor: '#111318',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2d34',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: { width: 96, height: 96 },
  cardBody: { flex: 1, padding: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cardCategory: { color: '#cbd5e1', marginTop: 2, marginBottom: 6 },

  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rateText: { color: '#FFD700', fontWeight: '700' },
  muted: { color: '#9ca3af' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2f3137' },

  footerRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { fontSize: 12, fontWeight: '700' },
  statusOpen: { color: '#4ade80' },
  statusClosed: { color: '#f97316' },

  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  verifiedText: { color: '#0b0d11', fontWeight: '800', fontSize: 12 },

  unverifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2a2d34',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3a3f47',
  },
  unverifiedText: { color: '#e5e7eb', fontWeight: '700', fontSize: 12 },
});
