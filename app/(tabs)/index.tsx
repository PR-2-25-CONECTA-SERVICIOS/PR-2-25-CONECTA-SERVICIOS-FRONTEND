// app/pages/ServiceCatalogScreen.tsx
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
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
  {
    id: '4',
    name: 'Restaurante Gourmet',
    category: 'Restaurantes',
    rating: 4.7,
    reviews: 78,
    distance: '3 km',
    price: '$25-40/hora',
    description: 'Experiencia gastronómica de alta calidad.',
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=300&q=80',
  },
];

export default function ServiceCatalogScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedService, setSelectedService] = useState<any>(null);

  // Filtrado de servicios normales
  const filteredServices = allServices.filter(
    (service) =>
      (selectedCategory === 'Todos' || service.category === selectedCategory) &&
      service.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filtrado de destacados según categoría
  const filteredHighlighted = highlightedServices.filter(
    (service) => selectedCategory === 'Todos' || service.category === selectedCategory
  );

  // ---- VISTA DETALLE ----
  if (selectedService) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F5DC' }}>
        <ScrollView style={styles.containerDetail}>
          <Image source={{ uri: selectedService.image }} style={styles.detailImage} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedService(null)}
          >
            <Text style={styles.backButtonText}>⬅</Text>
          </TouchableOpacity>
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{selectedService.name}</Text>
            <Text style={styles.detailCategory}>{selectedService.category}</Text>
            <Text style={styles.detailRating}>
              ⭐ {selectedService.rating} ({selectedService.reviews} reseñas)
            </Text>
            <Text style={styles.detailPrice}>{selectedService.price}</Text>
            <Text style={styles.detailDistance}>📍 {selectedService.distance}</Text>

            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.detailText}>
              {selectedService.description} Además ofrecemos garantía de satisfacción, repuestos originales y atención de urgencias 24/7.
            </Text>

            <Text style={styles.sectionTitle}>Horarios de Atención</Text>
            <Text style={styles.detailText}>Lunes a Viernes: 08:00 - 20:00</Text>
            <Text style={styles.detailText}>Sábados: 09:00 - 18:00</Text>
            <Text style={styles.detailText}>Domingos: Emergencias</Text>

            <Text style={styles.sectionTitle}>Contacto</Text>
            <Text style={styles.detailText}>📞 +591 765-43210</Text>
            <Text style={styles.detailText}>📧 contacto@{selectedService.name.replace(/\s/g, '').toLowerCase()}.com</Text>
            <Text style={styles.detailText}>📍 Av. Principal #123, Cochabamba</Text>

            <Text style={styles.sectionTitle}>Reseñas</Text>
            {Array.from({ length: 3 }).map((_, i) => (
              <View key={i} style={styles.reviewContainer}>
                <Text style={styles.reviewAuthor}>Usuario{i + 1}</Text>
                <Text style={styles.reviewText}>Excelente servicio, muy recomendable y rápido.</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Solicitar Servicio Ahora</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- VISTA CATÁLOGO ----
  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        item === selectedCategory && styles.categoryButtonSelected,
      ]}
      onPress={() => setSelectedCategory(item)}
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

  const renderService = ({ item }: any) => (
    <TouchableOpacity style={styles.serviceCard} onPress={() => setSelectedService(item)}>
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceCategory}>{item.category}</Text>
        {item.description && <Text style={styles.serviceDescription}>{item.description}</Text>}
        <Text style={styles.serviceRating}>⭐ {item.rating} ({item.reviews})</Text>
        <Text style={styles.serviceDistance}>📍 {item.distance}</Text>
        <Text style={styles.servicePrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, María!</Text>
          <Text style={styles.subGreeting}>¿Qué servicio necesitas hoy?</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitials}>MA</Text>
        </View>
      </View>

      {/* Search */}
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

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
      />

      {/* Servicios Destacados */}
      {filteredHighlighted.length > 0 && (
        <>
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
                  onPress={() => setSelectedService(item)}
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
        </>
      )}

      {/* Todos los Servicios */}
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
  containerDetail: { flex: 1 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, color: '#FFD700', fontWeight: 'bold' },
  subGreeting: { fontSize: 14, color: '#fff', opacity: 0.8 },
  userCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center' },
  userInitials: { color: '#000', fontWeight: 'bold', fontSize: 18 },

  searchContainer: { flexDirection: 'row', marginBottom: 16 },
  searchInput: { flex: 1, backgroundColor: '#1A1A1A', color: '#fff', padding: 12, borderRadius: 12 },
  filterButton: { backgroundColor: '#FFD700', padding: 12, borderRadius: 12, marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  filterButtonText: { color: '#000', fontWeight: 'bold' },

  // ---- BOTONES DE CATEGORÍAS UNIFORMES ----
  categoryButton: {
    paddingVertical: 6, // pequeño
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8, // marginBottom agregado a todos
    maxWidth: 110,
    alignItems: 'center',
  },
  categoryButtonSelected: { backgroundColor: '#FFD700' },
  categoryText: { color: '#fff', fontSize: 14, textAlign: 'center' },
  categoryTextSelected: { color: '#000', fontWeight: 'bold' },
  categoriesList: { marginBottom: 16 },

  sectionTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },

  serviceCard: { width: width * 0.9, backgroundColor: '#1A1A1A', borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  serviceImage: { width: '100%', height: 140 },
  serviceContent: { padding: 12 },
  serviceName: { fontSize: 16, color: '#FFD700', fontWeight: 'bold' },
  serviceCategory: { fontSize: 12, color: '#fff', opacity: 0.7, marginBottom: 2 },
  serviceDescription: { fontSize: 12, color: '#fff', opacity: 0.8, marginBottom: 4 },
  serviceRating: { fontSize: 12, color: '#FFD700', marginBottom: 2 },
  serviceDistance: { fontSize: 12, color: '#fff', opacity: 0.7, marginBottom: 2 },
  servicePrice: { fontSize: 14, color: '#FFD700', fontWeight: 'bold' },

  highlightedContainer: { marginRight: 16, alignItems: 'center' },
  highlightedCard: { width: width * 0.6, backgroundColor: '#1A1A1A', borderRadius: 16, overflow: 'hidden' },
  highlightedImage: { width: '100%', height: 140 },
  highlightedContent: { padding: 8 },
  highlightedServiceName: { color: '#FFD700', fontWeight: 'bold', marginTop: 4, width: width * 0.6, textAlign: 'center' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FFD700', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  heartIcon: { position: 'absolute', top: 8, right: 8 },
  heartIconText: { color: '#fff', fontSize: 18 },
  highlightedRating: { color: '#FFD700', fontSize: 12 },
  highlightedDistance: { color: '#fff', fontSize: 12, marginTop: 2 },
  highlightedPrice: { color: '#FFD700', fontWeight: 'bold', fontSize: 13, marginTop: 2 },
  highlightedList: { paddingBottom: 16 },

  detailImage: { width: '100%', height: 200 },
  backButton: { position: 'absolute', top: 40, left: 20, backgroundColor: '#0008', padding: 8, borderRadius: 20 },
  backButtonText: { color: '#fff', fontSize: 18 },
  detailContent: { padding: 16, paddingBottom: 120 },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  detailCategory: { fontSize: 16, color: '#333', marginBottom: 4 },
  detailRating: { fontSize: 14, color: '#000', marginBottom: 4 },
  detailPrice: { fontSize: 18, color: '#000', fontWeight: 'bold', marginBottom: 4 },
  detailDistance: { fontSize: 14, color: '#333', marginBottom: 12 },
  detailText: { fontSize: 14, color: '#333', marginBottom: 4 },

  reviewContainer: { marginBottom: 8, backgroundColor: '#E0D8C0', padding: 8, borderRadius: 8 },
  reviewAuthor: { fontWeight: 'bold', color: '#000', marginBottom: 2 },
  reviewText: { color: '#333', fontSize: 13 },

  requestButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestButtonText: { color: '#FFD700', fontWeight: 'bold', fontSize: 16 },

  allServicesList: { paddingBottom: 100 },
});
