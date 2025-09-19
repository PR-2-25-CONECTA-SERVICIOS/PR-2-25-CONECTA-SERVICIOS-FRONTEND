// app/pages/ServiceCatalogScreen.tsx
import React, { useState } from 'react';
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
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // plomería
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
    image: 'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // limpieza
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
    image: 'https://images.unsplash.com/photo-1695654390723-479197a8c4a3?q=80&w=1134&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // delivery
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
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=300&q=80', // restaurante
  },
];

export default function ServiceCatalogScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredServices = allServices.filter(
    (service) =>
      (selectedCategory === 'Todos' || service.category === selectedCategory) &&
      service.name.toLowerCase().includes(search.toLowerCase())
  );

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
    <TouchableOpacity style={styles.serviceCard}>
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceCategory}>{item.category}</Text>
        {item.description && <Text style={styles.serviceDescription}>{item.description}</Text>}
        <Text style={styles.serviceRating}>⭐ {item.rating} ({item.reviews})</Text>
        <Text style={styles.serviceDistance}>{item.distance}</Text>
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
          <Text style={{ color: '#000', fontWeight: 'bold' }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      />

      {/* Servicios Destacados */}
      <Text style={styles.sectionTitle}>Servicios Destacados</Text>
      <FlatList
        horizontal
        data={highlightedServices}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={{ marginRight: 16, alignItems: 'center' }}>
            {/* Tarjeta */}
            <TouchableOpacity style={styles.highlightedCard}>
              <Image source={{ uri: item.image }} style={styles.highlightedImage} />
              {/* Badge Disponible */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Disponible</Text>
              </View>
              {/* Icono de corazón */}
              <TouchableOpacity style={styles.heartIcon}>
                <Text style={{ color: '#fff', fontSize: 18 }}>♥</Text>
              </TouchableOpacity>
              <View style={styles.highlightedContent}>
                <View style={styles.ratingRow}>
                  <Text style={{ color: '#FFD700' }}>⭐ {item.rating}</Text>
                  <Text style={{ color: '#fff', marginLeft: 4 }}>({item.reviews})</Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={{ color: '#fff' }}>📍 {item.distance}</Text>
                  <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>{item.price}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Nombre del servicio debajo de la tarjeta */}
            <Text style={styles.highlightedServiceName}>{item.name}</Text>
          </View>
        )}
      />

      {/* Todos los Servicios */}
      <Text style={styles.sectionTitle}>Todos los Servicios</Text>
      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, alignItems: 'center' }}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  userCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    color: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  filterButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#FFD700',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceCard: {
    width: width * 0.7,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  serviceImage: {
    width: '100%',
    height: 120,
  },
  serviceContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  serviceName: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  serviceCategory: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 4,
  },
  serviceRating: {
    fontSize: 12,
    color: '#FFD700',
    marginBottom: 2,
  },
  serviceDistance: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    marginBottom: 2,
  },
  servicePrice: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  highlightedCard: {
    width: width * 0.7,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  highlightedImage: {
    width: '100%',
    height: 140,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  highlightedContent: {
    padding: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  highlightedServiceName: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginTop: 8,
    width: width * 0.7,
    textAlign: 'center',
  },
});
