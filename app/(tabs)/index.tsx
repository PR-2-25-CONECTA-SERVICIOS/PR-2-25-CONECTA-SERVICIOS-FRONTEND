import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
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
    image: 'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542?q=80&w=1170&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1695654390723-479197a8c4a3?q=80&w=1134&auto=format&fit=crop',
  },
];

export default function ServiceCatalogScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const router = useRouter(); // Para navegación entre pantallas

  // Filtrar servicios según la categoría seleccionada y el término de búsqueda
  const filteredServices = allServices.filter(
    (service) =>
      (selectedCategory === 'Todos' || service.category === selectedCategory) &&
      service.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHighlighted = highlightedServices.filter(
    (service) => selectedCategory === 'Todos' || service.category === selectedCategory
  );

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.categoryButton, item === selectedCategory && styles.categoryButtonSelected]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[styles.categoryText, item === selectedCategory && styles.categoryTextSelected]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderService = ({ item }: any) => (
    <TouchableOpacity style={styles.serviceCard} onPress={() => router.push(`/ServiceDetail`)}>
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceCategory}>{item.category}</Text>
        <Text style={styles.servicePrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, María!</Text>
          <Text style={styles.subGreeting}>¿Qué servicio necesitas hoy?</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/ProfileViewScreen')} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>MA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar servicios, restaurantes..."
          placeholderTextColor="#FFD70088"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Section */}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesListContainer}
      />

      {/* Featured Services Section */}
      {filteredHighlighted.length > 0 && (
        <View style={styles.highlightedWrapper}>
          <Text style={styles.sectionTitle}>Servicios Destacados</Text>
          <FlatList
            horizontal
            data={filteredHighlighted}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightedList}
            renderItem={({ item }) => (
              <View style={styles.highlightedContainer}>
                <TouchableOpacity
                  style={styles.highlightedCard}
                  onPress={() => router.push(`/ServiceDetail`)}  // Redirige a los detalles del servicio
                >
                  <Image source={{ uri: item.image }} style={styles.highlightedImage} />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Disponible</Text>
                  </View>
                  <TouchableOpacity style={styles.heartIcon}>
                    <Text style={styles.heartIconText}>♥</Text>
                  </TouchableOpacity>
                  <View style={styles.highlightedContent}>
                    <Text style={styles.highlightedRating}>⭐ {item.rating} ({item.reviews})</Text>
                    <Text style={styles.highlightedDistance}>📍 {item.distance}</Text>
                    <Text style={styles.highlightedPrice}>{item.price}</Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.highlightedServiceName}>{item.name}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* All Services Section */}
      <Text style={styles.sectionTitle}>Todos los Servicios</Text>
      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.allServicesList}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, color: '#FFD700', fontWeight: 'bold' },
  subGreeting: { fontSize: 14, color: '#fff', opacity: 0.8 },
  
  profileButton: {
    backgroundColor: '#FFD700',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontWeight: 'bold',
    color: '#000',
  },

  searchContainer: { flexDirection: 'row', marginBottom: 16 },
  searchInput: { flex: 1, backgroundColor: '#1A1A1A', color: '#fff', padding: 12, borderRadius: 12 },
  filterButton: { backgroundColor: '#FFD700', padding: 12, borderRadius: 12, marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  filterButtonText: { color: '#000', fontWeight: 'bold' },

  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    width: 120,  // Asegurando un ancho fijo para cada categoría
    alignItems: 'center',
  },
  categoryButtonSelected: { backgroundColor: '#FFD700' },
  categoryText: { color: '#fff', fontSize: 14, textAlign: 'center' },
  categoryTextSelected: { color: '#000', fontWeight: 'bold' },
  categoriesList: { marginBottom: 16 },
  categoriesListContainer: { alignItems: 'flex-start' },  // Asegura que las categorías estén alineadas al inicio

  sectionTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },

  serviceCard: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  serviceImage: { width: '100%', height: 140 },
  serviceContent: { padding: 12 },
  serviceName: { fontSize: 16, color: '#FFD700', fontWeight: 'bold' },
  serviceCategory: { fontSize: 12, color: '#fff', opacity: 0.7, marginBottom: 2 },
  servicePrice: { fontSize: 14, color: '#FFD700', fontWeight: 'bold' },

  highlightedWrapper: { marginBottom: 16 },
  highlightedContainer: { marginRight: 16, alignItems: 'center' },
  highlightedCard: { width: 250, backgroundColor: '#1A1A1A', borderRadius: 16, overflow: 'hidden' },
  highlightedImage: { width: '100%', height: 140 },
  highlightedContent: { padding: 8 },
  highlightedServiceName: { color: '#FFD700', fontWeight: 'bold', marginTop: 4, width: 250, textAlign: 'center' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  heartIcon: { position: 'absolute', top: 8, right: 8 },
  heartIconText: { color: '#fff', fontSize: 18 },
  highlightedRating: { color: '#FFD700', fontSize: 12 },
  highlightedDistance: { color: '#fff', fontSize: 12, marginTop: 2 },
  highlightedPrice: { color: '#FFD700', fontWeight: 'bold', fontSize: 13, marginTop: 2 },
  highlightedList: { paddingBottom: 16 },

  allServicesList: { paddingBottom: 120 },
});
