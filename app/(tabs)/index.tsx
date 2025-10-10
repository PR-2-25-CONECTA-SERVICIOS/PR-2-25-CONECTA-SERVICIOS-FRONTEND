import { useRouter } from 'expo-router';
import { Heart, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const categories = ['Todos', 'Plomería', 'Limpieza', 'Restaurantes', 'Delivery', 'Electricidad'];

const highlightedServices = [
  {
    id: '1',
    name: 'Plomería Express',
    category: 'Plomería',
    rating: 4.8,
    reviews: 127,
    distance: '0.8 km',
    price: '$50-80/hora',
    description: 'Reparaciones rápidas y eficientes de tuberías y grifos.',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
    available: true,
  },
    {
    id: '3',
    name: 'Delivery Rápido',
    category: 'Delivery',
    rating: 4.5,
    reviews: 45,
    distance: '2 km',
    price: '$10-20/hora',
    description: 'Entrega de productos en tiempo récord.',
    image:
      'https://images.unsplash.com/photo-1695654390723-479197a8c4a3?q=80&w=1134&auto=format&fit=crop',
    available: true,
  },
  
  {
    id: '2',
    name: 'Limpieza Total',
    category: 'Limpieza',
    rating: 4.6,
    reviews: 89,
    distance: '1.2 km',
    price: '$30-50/hora',
    description: 'Limpieza profunda de hogares y oficinas.',
    image:
      'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542?q=80&w=1170&auto=format&fit=crop',
    available: true,
  },
];

const allServices = [
  ...highlightedServices,
  {
    id: '3',
    name: 'Delivery Rápido',
    category: 'Delivery',
    rating: 4.5,
    reviews: 45,
    distance: '2 km',
    price: '$10-20/hora',
    description: 'Entrega de productos en tiempo récord.',
    image:
      'https://images.unsplash.com/photo-1695654390723-479197a8c4a3?q=80&w=1134&auto=format&fit=crop',
    available: true,
  },
  {
    id: '4',
    name: 'Electricista 24/7',
    category: 'Electricidad',
    rating: 4.9,
    reviews: 210,
    distance: '3.4 km',
    price: '$60-90/hora',
    description: 'Instalaciones y emergencias eléctricas.',
    image:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1974&auto=format&fit=crop',
    available: true,
  },
  {
    id: '5',
    name: 'Restaurante Don Pepe',
    category: 'Restaurantes',
    rating: 4.7,
    reviews: 342,
    distance: '900 m',
    price: '$$',
    description: 'Comida casera con toque gourmet.',
    image:
      'https://images.unsplash.com/photo-1541542684-4a163f2b40b2?q=80&w=2070&auto=format&fit=crop',
    available: true,
  },
];

export default function ServiceCatalogScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const { width } = Dimensions.get('window');
  const isWide = width >= 720;
  const numColumns = isWide ? 3 : 2;
  const horizontalGap = 12;
  const gridPadding = 16;
  const cardWidth =
    (width - gridPadding * 2 - horizontalGap * (numColumns - 1)) / numColumns;

  const filteredServices = useMemo(
    () =>
      allServices.filter(
        s =>
          (selectedCategory === 'Todos' || s.category === selectedCategory) &&
          s.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [selectedCategory, search],
  );

  const filteredHighlighted = useMemo(
    () =>
      highlightedServices.filter(
        s => selectedCategory === 'Todos' || s.category === selectedCategory,
      ),
    [selectedCategory],
  );

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        item === selectedCategory && styles.categoryButtonSelected,
      ]}
      onPress={() => setSelectedCategory(item)}
      activeOpacity={0.9}
    >
      <Text
        style={[
          styles.categoryText,
          item === selectedCategory && styles.categoryTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderService = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { width: cardWidth }]}
      onPress={() => router.push('/ServiceDetail')}
      activeOpacity={0.95}
    >
      <View style={styles.serviceImageWrap}>
        <Image source={{ uri: item.image }} style={styles.serviceImage} />
        {/* Overlay: rating & distance */}
        <View style={styles.overlayRow}>
          <View style={styles.badgeDark}>
            <Star size={12} color="#fbbf24" />
            <Text style={styles.badgeDarkText}>
              {item.rating} <Text style={{ color: '#9ca3af' }}>({item.reviews})</Text>
            </Text>
          </View>
          <View style={styles.badgeDark}>
            <MapPin size={12} color="#e5e7eb" />
            <Text style={styles.badgeDarkText}>{item.distance}</Text>
          </View>
        </View>
        {/* Heart */}
        <View style={styles.heartWrap}>
          <View style={styles.heartBtn}>
            <Heart size={14} color="#e5e7eb" />
          </View>
        </View>
      </View>

      <View style={styles.serviceBody}>
        <Text numberOfLines={1} style={styles.serviceName}>
          {item.name}
        </Text>
        <Text style={styles.serviceCategory}>{item.category}</Text>
        <Text style={styles.servicePrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola, María!</Text>
            <Text style={styles.subGreeting}>¿Qué servicio necesitas hoy?</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/ProfileViewScreen')}
            style={styles.profileBtn}
            activeOpacity={0.9}
          >
            <Text style={styles.profileInitials}>MA</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Search size={16} color="#cbd5e1" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar servicios, restaurantes…"
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.9}>
            <SlidersHorizontal size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Categories (horizontal) */}
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        />

        {/* Highlighted */}
        {filteredHighlighted.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Destacados</Text>
            <FlatList
              data={filteredHighlighted}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              snapToAlignment="start"
              decelerationRate="fast"
              snapToInterval={Math.min(width * 0.78, 290) + 12}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => {
                const cardW = Math.min(width * 0.78, 290);
                return (
                  <TouchableOpacity
                    style={[styles.highlightCard, { width: cardW }]}
                    onPress={() => router.push('/ServiceDetail')}
                    activeOpacity={0.95}
                  >
                    <View style={styles.highlightImageWrap}>
                      <Image source={{ uri: item.image }} style={styles.highlightImage} />
                      <View style={styles.topRow}>
                        <View style={styles.badgeGold}>
                          <Text style={styles.badgeGoldText}>
                            {item.available ? 'Disponible' : 'No disp.'}
                          </Text>
                        </View>
                        <View style={styles.heartBtn}>
                          <Heart size={14} color="#e5e7eb" />
                        </View>
                      </View>
                      <View style={styles.bottomRow}>
                        <View style={styles.badgeDark}>
                          <Star size={12} color="#fbbf24" />
                          <Text style={styles.badgeDarkText}>
                            {item.rating}{' '}
                            <Text style={{ color: '#9ca3af' }}>({item.reviews})</Text>
                          </Text>
                        </View>
                        <View style={styles.badgeDark}>
                          <MapPin size={12} color="#e5e7eb" />
                          <Text style={styles.badgeDarkText}>{item.distance}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.highlightBody}>
                      <Text numberOfLines={1} style={styles.highlightName}>
                        {item.name}
                      </Text>
                      <Text style={styles.highlightDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <Text style={styles.highlightPrice}>{item.price}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* All services (responsive grid) */}
        <View style={[styles.section, { paddingTop: 6 }]}>
          <Text style={styles.sectionTitle}>Todos los Servicios</Text>

          <FlatList
            data={filteredServices}
            keyExtractor={item => item.id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ gap: horizontalGap, paddingHorizontal: gridPadding }}
            ItemSeparatorComponent={() => <View style={{ height: horizontalGap }} />}
            scrollEnabled={false} // <- el ScrollView maneja el scroll
            renderItem={renderService}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0b0b', paddingTop: Platform.select({ ios: 52, android: 36 }) },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: 22, color: '#fbbf24', fontWeight: '800' },
  subGreeting: { fontSize: 13, color: '#cbd5e1', marginTop: 2 },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: { color: '#111827', fontWeight: '900' },

  // Search
  searchRow: { paddingHorizontal: 16, flexDirection: 'row', gap: 10, marginBottom: 10 },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(17,17,19,0.75)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, color: '#e5e7eb', fontSize: 14, paddingVertical: 8 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbbf24',
  },

  // Categories
  categoriesRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#111113',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderColor: 'rgba(251,191,36,0.6)',
  },
  categoryText: { color: '#e5e7eb', fontSize: 13, fontWeight: '600' },
  categoryTextSelected: { color: '#fbbf24', fontWeight: '800' },

  // Sections
  section: { marginTop: 8, marginBottom: 4 },
  sectionTitle: {
    color: '#e5e7eb',
    fontWeight: '800',
    fontSize: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // Highlighted card
  highlightCard: {
    backgroundColor: '#0f0f10',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  highlightImageWrap: { position: 'relative', width: '100%', height: 150 },
  highlightImage: { width: '100%', height: '100%' },
  topRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomRow: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeGold: {
    backgroundColor: 'rgba(251,191,36,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeGoldText: { color: '#111827', fontWeight: '900', fontSize: 11 },

  badgeDark: {
    backgroundColor: 'rgba(17,17,19,0.7)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeDarkText: { color: '#e5e7eb', fontWeight: '700', fontSize: 11 },

  heartWrap: { position: 'absolute', top: 10, right: 10 },
  heartBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,17,19,0.7)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.35)',
  },

  highlightBody: { padding: 12, gap: 4 },
  highlightName: { color: '#e5e7eb', fontWeight: '800' },
  highlightDesc: { color: '#cbd5e1', fontSize: 12 },
  highlightPrice: { color: '#fbbf24', fontWeight: '900', marginTop: 4 },

  // Grid service card
  serviceCard: {
    backgroundColor: '#0f0f10',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  serviceImageWrap: { position: 'relative', width: '100%', height: 110 },
  serviceImage: { width: '100%', height: '100%' },
  overlayRow: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceBody: { padding: 10, gap: 4 },
  serviceName: { color: '#e5e7eb', fontWeight: '800' },
  serviceCategory: { color: '#9ca3af', fontSize: 12 },
  servicePrice: { color: '#fbbf24', fontWeight: '900', marginTop: 2 },
});
