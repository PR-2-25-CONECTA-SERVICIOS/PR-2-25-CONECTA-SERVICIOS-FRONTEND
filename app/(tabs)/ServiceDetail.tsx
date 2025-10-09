import { ArrowLeft, Clock, Heart, MapPin, Phone, Share, Star } from 'lucide-react-native'; // Asegúrate de instalar la librería lucide-react-native
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const mockService = {
  id: 1,
  name: "Plomería Express",
  category: "Plomería y Reparaciones",
  rating: 4.8,
  reviews: 127,
  distance: "0.8 km",
  address: "Av. Principal 123, Ciudad",
  phone: "+1 234 567 8900",
  price: "$50-80/hora",
  description: "Servicio de plomería profesional con más de 10 años de experiencia. Especialistas en reparaciones de emergencia, instalaciones y mantenimiento residencial y comercial.",
  services: ["Destape de tuberías", "Reparación de grifos", "Instalación de sanitarios", "Calentadores de agua"],
  hours: "Lunes a Domingo: 24 horas",
  available: true,
  owner: {
    name: "Carlos Mendoza",
    photo: "https://randomuser.me/api/portraits/men/32.jpg", // Usa una imagen de ejemplo
    experience: "10 años",
    verified: true
  },
  gallery: [
    "https://images.unsplash.com/photo-1604118600242-e7a6d23ec3a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2aWNlJTIwd29ya2VyJTIwcGx1bWJlcnxlbnwxfHx8fDE3NTY0MzgxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ],
  recentReviews: [
    { id: 1, user: "Ana García", rating: 2, comment: "Excelente servicio, muy puntual y profesional.", date: "Hace 2 días" },
    { id: 2, user: "Pedro López", rating: 4, comment: "Buen trabajo, precio justo. Lo recomiendo.", date: "Hace 1 semana" },
    { id: 3, user: "María Silva", rating: 5, comment: "Solucionó mi problema rápidamente. Muy satisfecha.", date: "Hace 2 semanas" }
  ]
};

const ServiceDetailScreen = ({ onNext }: { onNext: () => void }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Función para generar las estrellas
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating); // Número entero de estrellas llenas
    const halfStar = rating % 1 !== 0; // Si la calificación tiene decimales, añadir una estrella a la mitad

    return (
      <>
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star key={index} size={18} color="yellow" />
        ))}
        {halfStar && <Star size={18} color="yellow" style={{ opacity: 0.5 }} />}
      </>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image
          source={{ uri: mockService.gallery[currentImageIndex] }}
          style={styles.headerImage}
        />
        
        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={onNext} style={styles.iconButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.iconGroup}>
            <TouchableOpacity
              onPress={() => setIsFavorite(!isFavorite)}
              style={styles.iconButton}
            >
              <Heart size={24} color={isFavorite ? 'red' : 'white'} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton}>
              <Share size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Availability Badge */}
        <View style={styles.availabilityBadge}>
          <Text style={mockService.available ? styles.available : styles.notAvailable}>
            {mockService.available ? 'Disponible ahora' : 'No disponible'}
          </Text>
        </View>
      </View>

      {/* Service Information */}
      <View style={styles.infoContainer}>
        <View style={styles.nameCategoryRow}>
          <View>
            <Text style={styles.serviceName}>{mockService.name}</Text>
            <Text style={styles.serviceCategory}>{mockService.category}</Text>
          </View>
          <View>
            <Text style={styles.price}>{mockService.price}</Text>
            <Text style={styles.perHour}>por hora</Text>
          </View>
        </View>

        {/* Rating & Distance */}
        <View style={styles.ratingDistance}>
          <View style={styles.ratingRow}>
            {renderStars(mockService.rating)} 
            <Text style={styles.ratingText}>{mockService.rating}</Text>
            <Text style={styles.reviewsText}>({mockService.reviews} reseñas)</Text>
          </View>
          <View style={styles.distanceRow}>
            <MapPin size={18} color="white" />
            <Text style={styles.distanceText}>{mockService.distance}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>

          <TouchableOpacity style={styles.quickActionButton}>
            <Phone size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Owner Info */}
        <View style={styles.ownerContainer}>
          <Image source={{ uri: mockService.owner.photo }} style={styles.ownerPhoto} />
          <View style={styles.ownerDetails}>
            <Text style={styles.ownerName}>{mockService.owner.name}</Text>
            {mockService.owner.verified && (
              <Text style={styles.verifiedBadge}>Verificado</Text>
            )}
            <Text style={styles.ownerExperience}>{mockService.owner.experience} de experiencia</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{mockService.description}</Text>
        </View>

        {/* Services */}
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesTitle}>Servicios</Text>
          <View style={styles.servicesList}>
            {mockService.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location & Hours */}
        <View style={styles.locationHoursContainer}>
          <Text style={styles.locationTitle}>Ubicación</Text>
          <View style={styles.locationRow}>
            <MapPin size={18} color="white" />
            <Text style={styles.locationText}>{mockService.address}</Text>
          </View>
          <Text style={styles.hoursTitle}>Horarios</Text>
          <View style={styles.hoursRow}>
            <Clock size={18} color="white" />
            <Text style={styles.hoursText}>{mockService.hours}</Text>
          </View>
        </View>

        {/* Recent Reviews */}
        <View style={styles.reviewsContainer}>
          <Text style={styles.reviewsTitle}>Reseñas recientes</Text>
          {mockService.recentReviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <Text style={styles.reviewUser}>{review.user}</Text>
              <View style={styles.reviewRating}>
                {renderStars(review.rating)} {/* Mostrar las estrellas en las reseñas */}
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>

        {/* Request Service Button */}
        <View style={styles.requestButtonContainer}>
          <TouchableOpacity style={styles.requestButton}>
            <Text style={styles.requestButtonText}>
              {mockService.available ? 'Solicitar Servicio Ahora' : 'Servicio No Disponible'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1F1F1F' },
  headerImageContainer: { position: 'relative' },
  headerImage: { width: '100%', height: 200 },
  headerControls: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between' },
  iconButton: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 50 },
  iconGroup: { flexDirection: 'row' },
  availabilityBadge: { position: 'absolute', bottom: 10, left: 10 },
  available: { backgroundColor: '#FFD700', color: 'black', padding: 5, borderRadius: 10 },
  notAvailable: { backgroundColor: '#555', color: 'white', padding: 5, borderRadius: 10 },
  infoContainer: { padding: 16 },
  nameCategoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  serviceName: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  serviceCategory: { fontSize: 14, color: 'gray' },
  price: { fontSize: 20, color: '#FFD700', fontWeight: 'bold' },
  perHour: { fontSize: 12, color: 'gray' },
  ratingDistance: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 5, color: 'white' },
  reviewsText: { color: 'gray' },
  distanceRow: { flexDirection: 'row', alignItems: 'center' },
  distanceText: { marginLeft: 5, color: 'white' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  quickActionButton: { flex: 1, backgroundColor: '#FFD700', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  quickActionText: { color: 'black', fontWeight: 'bold' },
  ownerContainer: { flexDirection: 'row', marginBottom: 20 },
  ownerPhoto: { width: 50, height: 50, borderRadius: 25 },
  ownerDetails: { flex: 1, marginLeft: 12 },
  ownerName: { color: 'white', fontWeight: 'bold' },
  verifiedBadge: { color: 'green', fontSize: 12 },
  ownerExperience: { color: 'gray' },
  descriptionContainer: { marginBottom: 20 },
  descriptionTitle: { color: '#FFD700', fontWeight: 'bold' },
  descriptionText: { color: 'white' },
  servicesContainer: { marginBottom: 20 },
  servicesTitle: { color: '#FFD700', fontWeight: 'bold' },
  servicesList: { flexDirection: 'row', flexWrap: 'wrap' },
  serviceItem: { backgroundColor: '#333', padding: 8, margin: 4, borderRadius: 8 },
  serviceText: { color: 'white' },
  locationHoursContainer: { marginBottom: 20 },
  locationTitle: { color: '#FFD700', fontWeight: 'bold' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  locationText: { color: 'white', marginLeft: 5 },
  hoursTitle: { color: '#FFD700', fontWeight: 'bold' },
  hoursRow: { flexDirection: 'row', alignItems: 'center' },
  hoursText: { color: 'white', marginLeft: 5 },
  reviewsContainer: { marginBottom: 20 },
  reviewsTitle: { color: '#FFD700', fontWeight: 'bold' },
  reviewItem: { backgroundColor: '#444', padding: 10, borderRadius: 8, marginBottom: 10 },
  reviewUser: { color: 'white', fontWeight: 'bold' },
  reviewComment: { color: 'white' },
  reviewDate: { color: 'gray' },
  reviewRating: { flexDirection: 'row', marginTop: 5 },
  requestButtonContainer: { marginBottom: 40 },
  requestButton: { backgroundColor: '#FFD700', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  requestButtonText: { color: 'black', fontWeight: 'bold' },
});

export default ServiceDetailScreen;
