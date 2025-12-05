import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

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

const API_URL = "https://pr-2-25-conecta-servicios-backend.onrender.com/api/locales";

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type Hours = Record<DayKey, { open: string; close: string } | null>;

type Local = {
  _id: string;
  nombre: string;
  categoria: string;
  calificacion: number;
  opiniones: number;
  distancia?: string;
  imagen: string;
  creadoPor?: any;
  destacado?: boolean;
  verificado?: boolean;
  horario?: Hours;

  // 🔥 Agregar estos campos porque existen en Mongo
  telefono?: string;
  direccion?: string;
};


const CATEGORIES = ['Todos', 'Restaurante', 'Cafetería', 'Supermercado', 'Ferretería', 'Farmacia'];

// ==========================================================
// 🕒 UTILIDADES
// ==========================================================
function weekdayKey(date = new Date()): DayKey {
  const idx = date.getDay();
  return (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][idx] as DayKey);
}
function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function LocalesScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const [locales, setLocales] = useState<Local[]>([]);
  const [featured, setFeatured] = useState<Local[]>([]);
const [categories, setCategories] = useState<string[]>(["Todos"]);
const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ==========================================================
  // 🔥 Cargar LOCALES reales
  // ==========================================================
// 🔥 Recargar SIEMPRE que se regresa a esta pantalla
useFocusEffect(
  useCallback(() => {
    loadData();
        loadCategories();

  }, [])
);

const loadCategories = async () => {
  try {
    const res = await fetch("https://pr-2-25-conecta-servicios-backend.onrender.com/api/categorias");
    const json = await res.json();

    const names = json.map((c: any) => c.nombre);

    setCategories(["Todos", ...names]);
  } catch (err) {
    console.log("❌ Error cargando categorías:", err);
  } finally {
    setCategoriesLoading(false);
  }
};

  const loadData = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      setLocales(json);

      const res2 = await fetch(`${API_URL}/destacados`);
      const json2 = await res2.json();
      setFeatured(json2);

    } catch (err) {
      console.log("❌ Error cargando locales:", err);
    }
  };

  // ==========================================================
  // 🔍 FILTRO (backend + UI)
  // ==========================================================
  useEffect(() => {
    filterLocales();
  }, [search, category]);

  const filterLocales = async () => {
    try {
      const url = `${API_URL}/search?q=${search}&categoria=${category}`;
      const res = await fetch(url);
      const json = await res.json();
      setLocales(json);
    } catch (err) {
      console.log("❌ Error filtrando locales:", err);
    }
  };

  // ==========================================================
  // ELEMENTOS UI
  // ==========================================================
  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.chip, item === category && styles.chipActive]}
      onPress={() => setCategory(item)}
      activeOpacity={0.9}
    >
      <Text style={[styles.chipText, item === category && styles.chipTextActive]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderFeatured = ({ item }: { item: Local }) => {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => router.push(`/BusinessScreen?id=${item._id}`)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.imagen }} style={styles.featuredImage} />

        <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <View style={styles.featuredContent}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardCategory}>{item.categoria}</Text>
          <View style={styles.inline}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rateText}>{item.calificacion || 0}</Text>
            <Text style={styles.muted}>({item.opiniones || 0})</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

const renderLocal = ({ item }: { item: Local }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/BusinessScreen?id=${item._id}`)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.imagen }} style={styles.cardImage} />

      <View style={styles.cardBody}>
    
    {/* Nombre */}
    <Text style={styles.cardTitle} numberOfLines={1}>
      {item.nombre}
    </Text>

    {/* Badge verificado arriba a la derecha dentro del card */}
    {item.verificado ? (
      <View style={styles.badgeVerified}>
        <Ionicons name="checkmark-circle" size={14} color="#fff" />
        <Text style={styles.badgeText}></Text>
      </View>
    ) : (
      <View style={styles.badgeNotVerified}>
        <Ionicons name="alert-circle" size={13} color="#fff" />
      </View>
    )}

    <Text style={styles.cardCategory}>{item.categoria}</Text>

    {item.direccion && (
      <Text style={{ color:"#9ca3af", fontSize:12 }} numberOfLines={1}>
        📍 {item.direccion}
      </Text>
    )}

    {item.telefono && (
      <Text style={{ color:"#cbd5e1", fontSize:12 }}>
        📞 {item.telefono}
      </Text>
    )}
</View>

    </TouchableOpacity>
  );
};



  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <View style={styles.container}>
      <FlatList
        data={locales}
        keyExtractor={(i) => i._id}
        renderItem={renderLocal}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Locales cercanos</Text>
            <Text style={styles.subtitle}>Encuentra lugares abiertos ahora</Text>

            {/* ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ */}
            {/* BOTONES RESTAURADOS */}
            {/* ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ */}
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
            {/* ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ */}
            {/*   FIN DE LOS BOTONES    */}
            {/* ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ */}

            {/* BUSCADOR */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color="#a1a1aa" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar locales…"
                placeholderTextColor="#FFD70088"
                value={search}
                onChangeText={setSearch}
              />
            </View>

{categoriesLoading ? (
  <Text style={{ color: "#999", marginTop: 10 }}>Cargando categorías...</Text>
) : (
  <FlatList
    horizontal
    data={categories}
    keyExtractor={(c) => c}
    renderItem={renderCategory}
    showsHorizontalScrollIndicator={false}
    style={{ marginTop: 10 }}
    contentContainerStyle={{ paddingRight: 8 }}
  />
)}


            {/* DESTACADOS */}
            {featured.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Locales Destacados</Text>
                <FlatList
                  horizontal
                  data={featured}
                  keyExtractor={(i) => i._id}
                  renderItem={renderFeatured}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Todos los Locales</Text>
          </View>
        }
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

/* 🎨 ESTILOS (no se tocan) */
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
cardBody: { 
  flex: 1,
  padding: 12,
  position: "relative",       // 👈 necesario para ubicar el badge dentro
},
cardTitle: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '800',
  flexShrink: 1,       // 🔥 permite reducir pero no empujar el badge
  maxWidth: "95%",      // 🔥 el badge ocupa 25% aprox
},  cardCategory: { color: '#cbd5e1', marginTop: 2, marginBottom: 6 },

  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rateText: { color: '#FFD700', fontWeight: '700' },
  muted: { color: '#9ca3af' },

  footerRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { fontSize: 12, fontWeight: '700' },
  statusOpen: { color: '#4ade80' },
  statusClosed: { color: '#f97316' },


rowBetween: {
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
},

badgeVerified:{
  position:"absolute",
  top:0,
  right:0,
  backgroundColor:"#d6d310ff",
  paddingHorizontal:6,
  paddingVertical:2,
  borderRadius:6,
  flexDirection:"row",
  alignItems:"center",
  gap:3
},

badgeNotVerified:{
  position:"absolute",
  top:0,
  right:0,
  backgroundColor:"#6b7280",
  paddingHorizontal:5,
  paddingVertical:2,
  borderRadius:6,
  alignItems:"center",
  justifyContent:"center"
},
badgeText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "700",
  maxWidth: 80, // evita romper diseño en pantallas pequeñas
},

});
