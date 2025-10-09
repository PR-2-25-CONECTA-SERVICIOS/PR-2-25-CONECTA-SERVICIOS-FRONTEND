// app/pages/ServiceCatalogScreen.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
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
    provider: {
      name: 'Juan Pérez',
      verified: true,
      phone: '+59176543210',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      servicesOffered: ['Destape de cañerías', 'Cambio de grifos', 'Reparación de fugas'],
    },
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
    provider: {
      name: 'María López',
      verified: false,
      phone: '+59171234567',
      photo: 'https://randomuser.me/api/portraits/women/44.jpg',
      servicesOffered: ['Limpieza general', 'Limpieza profunda', 'Desinfección de oficinas'],
    },
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
    provider: {
      name: 'Carlos Ruiz',
      verified: true,
      phone: '+59170012345',
      photo: 'https://randomuser.me/api/portraits/men/55.jpg',
      servicesOffered: ['Entrega de comida', 'Entrega de paquetes'],
    },
  },
];

export default function ServiceCatalogScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredServices = allServices.filter(
    (service) =>
      (selectedCategory === 'Todos' || service.category === selectedCategory) &&
      service.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHighlighted = highlightedServices.filter(
    (service) => selectedCategory === 'Todos' || service.category === selectedCategory
  );

  const openPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const onChangeDate = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) setSelectedDate(date);
    Alert.alert('Fecha seleccionada', `Servicio programado para: ${date?.toLocaleString()}`);
  };

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

            {/* Botones Llamada, Solicitar Servicio y Programar Servicio */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 }}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => openPhone(selectedService.provider.phone)}
              >
                <Text style={styles.actionButtonText}>📞 Llamar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF8C00' }]}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.actionButtonText}>📅 Solicitar Servicio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#1E90FF' }]}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.actionButtonText}>🗓️ Programar Servicio</Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="datetime"
                display="default"
                onChange={onChangeDate}
                minimumDate={new Date()}
              />
            )}

            {/* Perfil del proveedor */}
            <View style={styles.providerContainer}>
              <Image source={{ uri: selectedService.provider.photo }} style={styles.providerPhoto} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.providerName}>
                  {selectedService.provider.name} {selectedService.provider.verified && '✅'}
                </Text>
                <Text style={styles.providerPhone}>📞 {selectedService.provider.phone}</Text>
              </View>
            </View>

            {/* Servicios que ofrece */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Servicios que ofrece</Text>
            {selectedService.provider.servicesOffered.map((s: string, i: number) => (
              <Text key={i} style={styles.detailText}>• {s}</Text>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Reseñas</Text>
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

  // --- Vista Catálogo ---
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
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, María!</Text>
          <Text style={styles.subGreeting}>¿Qué servicio necesitas hoy?</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitials}>MA</Text>
        </View>
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

      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
      />

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
        </View>
      )}

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

  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
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

  highlightedWrapper: { marginBottom: 16 },
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
  detailContent: { padding: 16 },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  detailCategory: { fontSize: 16, color: '#333', opacity: 0.8, marginBottom: 4 },
  detailRating: { fontSize: 14, color: '#000', marginBottom: 4 },
  detailPrice: { fontSize: 18, color: '#000', fontWeight: 'bold', marginBottom: 4 },
  detailDistance: { fontSize: 14, color: '#333', marginBottom: 12 },
  detailText: { fontSize: 14, color: '#333', marginBottom: 4 },

  actionButton: { flex: 0.32, paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },

  providerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  providerPhoto: { width: 60, height: 60, borderRadius: 30 },
  providerName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  providerPhone: { fontSize: 14, color: '#333', opacity: 0.8 },

  reviewContainer: { backgroundColor: '#EEE8AA', padding: 8, borderRadius: 8, marginBottom: 8 },
  reviewAuthor: { fontWeight: 'bold', color: '#000' },
  reviewText: { color: '#333', fontSize: 12 },

  requestButton: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#FFD700', padding: 16, borderRadius: 16, alignItems: 'center' },
  requestButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  allServicesList: { paddingBottom: 120 },
});
