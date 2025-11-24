import { useRouter } from 'expo-router';
import { Heart, MapPin, Search, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
interface IService {
  _id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: string;
  imagen: string;

  // ⭐ EXTRAS
  calificacion?: number;
  opiniones?: number;
  distancia?: string; 
  disponible?: boolean;
}

import { useAuth } from "context/AuthContext";

// 🔥 CATEGORÍAS IGUALES A TU FRONT
const categories = ['Todos', 'Plomería', 'Limpieza', 'Restaurantes', 'Delivery', 'Electricidad'];

// 🔥 URL REAL DE TU BACKEND
const API_URL = "http://localhost:3000/api/servicios";

export default function ServiceCatalogScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

const [services, setServices] = useState<IService[]>([]);
const [highlighted, setHighlighted] = useState<IService[]>([]);
const [categories, setCategories] = useState<string[]>(["Todos"]);
const [loadingCategories, setLoadingCategories] = useState(true);

const { user } = useAuth();
const [profile, setProfile] = useState<any>(null);

  // Responsive grid config
  const { width } = Dimensions.get('window');
  const isWide = width >= 720;
  const numColumns = isWide ? 3 : 2;
  const horizontalGap = 12;
  const gridPadding = 16;
  const cardWidth =
    (width - gridPadding * 2 - horizontalGap * (numColumns - 1)) / numColumns;

  // -----------------------------------------
  // 🔥 CARGAR SERVICIOS AL INICIAR
  // -----------------------------------------
  useEffect(() => {
    loadInitialData();
      loadCategories();  

  }, []);
const loadCategories = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/categorias");
    const data = await res.json();

    // Convertir [{_id,nombre}] → ["Plomería","Limpieza"]
    const names = data.map((c: any) => c.nombre);

    setCategories(["Todos", ...names]);
  } catch (err) {
    console.log("❌ Error cargando categorías:", err);
  } finally {
    setLoadingCategories(false);
  }
};

  const loadInitialData = async () => {
    try {
      // Todos los servicios
      const all = await fetch(API_URL);
      const jsonAll = await all.json();
      setServices(jsonAll);

      // Destacados
      const high = await fetch(`${API_URL}/destacados`);
      const jsonHigh = await high.json();
      setHighlighted(jsonHigh);

    } catch (error) {
      console.error("❌ Error cargando servicios:", error);
    }
  };
useEffect(() => {
  if (!user || !user._id) return;

  const loadProfile = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${user._id}`);
      const raw = await res.text();
      const data = JSON.parse(raw);

      setProfile({
        name: data.nombre,
        email: data.correo,
        avatar: data.avatar,
      });
    } catch (err) {
      console.log("❌ Error cargando perfil:", err);
    }
  };

  loadProfile();
}, [user?._id]);

  // -----------------------------------------
  // 🔥 FILTRO REAL DESDE BACKEND
  // -----------------------------------------
  useEffect(() => {
    filterFromBackend();
  }, [search, selectedCategory]);

  const filterFromBackend = async () => {
    try {
      const url = `${API_URL}/buscar?q=${search}&categoria=${selectedCategory}`;
      const res = await fetch(url);
      const json = await res.json();

      setServices(json);
    } catch (e) {
      console.log("Error filtrando:", e);
    }
  };

  //------------------------------------------
  // UI RENDER METHODS
  //------------------------------------------

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

  const renderService = ({ item }: { item: IService }) => (

    <TouchableOpacity
      style={[styles.serviceCard, { width: cardWidth }]}
      onPress={() => router.push(`/ServiceDetail?id=${item._id}`)}
      activeOpacity={0.95}
    >
      <View style={styles.serviceImageWrap}>
        <Image source={{ uri: item.imagen }} style={styles.serviceImage} />

        <View style={styles.overlayRow}>
          <View style={styles.badgeDark}>
            <Star size={12} color="#fbbf24" />
            <Text style={styles.badgeDarkText}>
              {item.calificacion || 0}{' '}
              <Text style={{ color: '#9ca3af' }}>({item.opiniones || 0})</Text>
            </Text>
          </View>

          <View style={styles.badgeDark}>
            <MapPin size={12} color="#e5e7eb" />
            <Text style={styles.badgeDarkText}>{item.distancia || "1 km"}</Text>
          </View>
        </View>

        <View style={styles.heartWrap}>
          <View style={styles.heartBtn}>
            <Heart size={14} color="#e5e7eb" />
          </View>
        </View>
      </View>

      <View style={styles.serviceBody}>
        <Text numberOfLines={1} style={styles.serviceName}>
          {item.nombre}
        </Text>
        <Text style={styles.serviceCategory}>{item.categoria}</Text>
        <Text style={styles.servicePrice}>{item.precio || "$ -"}</Text>
      </View>
    </TouchableOpacity>
  );

  //------------------------------------------

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        
        <View style={styles.header}>
          <View>
<Text style={styles.greeting}>
  ¡Hola, {profile?.name || "Usuario"}!
</Text>

<Text style={styles.subGreeting}>
  ¿Qué servicio necesitas hoy?
</Text>

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


        </View>

{loadingCategories ? (
  <Text style={{ color: "#999", paddingHorizontal: 16 }}>Cargando categorías...</Text>
) : (
  <FlatList
    horizontal
    data={categories}
    renderItem={renderCategory}
    keyExtractor={item => item}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.categoriesRow}
  />
)}

        {/* Highlighted */}
        {highlighted.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Destacados</Text>

            <FlatList
              data={highlighted}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => {
                const cardW = Math.min(width * 0.78, 290);

                return (
                  <TouchableOpacity
                    style={[styles.highlightCard, { width: cardW }]}
                    onPress={() => router.push(`/ServiceDetail?id=${item._id}`)}
                    activeOpacity={0.95}
                  >
                    <View style={styles.highlightImageWrap}>
                      <Image source={{ uri: item.imagen }} style={styles.highlightImage} />

                      <View style={styles.topRow}>
                        <View style={styles.badgeGold}>
                          <Text style={styles.badgeGoldText}>
                            {item.disponible ? 'Disponible' : 'No disp.'}
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
                            {item.calificacion || 0}{' '}
                            <Text style={{ color: '#9ca3af' }}>({item.opiniones || 0})</Text>
                          </Text>
                        </View>

                        <View style={styles.badgeDark}>
                          <MapPin size={12} color="#e5e7eb" />
                          <Text style={styles.badgeDarkText}>{item.distancia || "1 km"}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.highlightBody}>
                      <Text numberOfLines={1} style={styles.highlightName}>
                        {item.nombre}
                      </Text>

                      <Text style={styles.highlightDesc} numberOfLines={2}>
                        {item.descripcion}
                      </Text>

                      <Text style={styles.highlightPrice}>{item.precio || "$ -"}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* All services */}
        <View style={[styles.section, { paddingTop: 6 }]}>
          <Text style={styles.sectionTitle}>Todos los Servicios</Text>

          <FlatList
            data={services}
            keyExtractor={item => item._id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              gap: horizontalGap,
              paddingHorizontal: gridPadding
            }}
            ItemSeparatorComponent={() => <View style={{ height: horizontalGap }} />}
            scrollEnabled={false}
            renderItem={renderService}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------
// 🔥 TUS ESTILOS ORIGINALES COMPLETOS
// ---------------------------------------------
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0b0b', paddingTop: Platform.select({ ios: 52, android: 36 }) },

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

  // Services grid
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
