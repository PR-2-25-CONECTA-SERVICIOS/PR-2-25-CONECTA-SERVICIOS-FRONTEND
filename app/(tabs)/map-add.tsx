// app/(tabs)/map-add.tsx
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  List,
  MapPin,
  Navigation,
  Save,
  Trash2,
  X,
} from "lucide-react-native";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { loadUserSession } from "../../utils/secureStore";

// 🔗 Backend
// ⚠️ Si pruebas en dispositivo físico, cambia localhost por la IP de tu PC
const API_URL = "http://192.168.1.71:3000/api/locales";
const CATEGORY_API = "http://192.168.1.71:3000/api/categorias";

// 🔗 Cloudinary
const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/deqxfxbaa/image/upload";
const CLOUDINARY_PRESET = "imagescloudexp";

/* =========================================================
   Tipos
   ========================================================= */
type Place = {
  id: string;
  title: string;
  phone: string;
  description: string;
  imageUri?: string;
  coord: { latitude: number; longitude: number };
  category: string;
  createdAt: number;
};

type CategoryItem = { _id: string; nombre: string };

/* =========================================================
   Paleta
   ========================================================= */
const palette = {
  light: {
    bg: "#F4F6FA",
    card: "#FFFFFF",
    text: "#0f1115",
    sub: "#6B7280",
    border: "#E5E7EB",
    chip: "#FBBF24",
    legendBg: "#FFFFFF",
    legendText: "#0f1115",
    overlay: "rgba(0,0,0,0.45)",
  },
  dark: {
    bg: "#0b0b0b",
    card: "#0f0f10",
    text: "#E5E7EB",
    sub: "#9CA3AF",
    border: "rgba(148,163,184,0.25)",
    chip: "#FBBF24",
    legendBg: "#0f0f10",
    legendText: "#E5E7EB",
    overlay: "rgba(0,0,0,0.65)",
  },
} as const;

/* =========================================================
   Helpers
   ========================================================= */
function mapLocalToPlace(local: any): Place {
  const lat = Number(local.lat);
  const lng = Number(local.lng);

  return {
    id: local._id,
    title: local.nombre ?? "",
    phone: local.telefono ?? "",
    description: local.direccion ?? "",
    imageUri: local.imagen,
    category: local.categoria ?? "General",
    coord: {
      latitude: isNaN(lat) ? -17.3835 : lat,
      longitude: isNaN(lng) ? -66.163 : lng,
    },
    createdAt: local.createdAt
      ? new Date(local.createdAt).getTime()
      : Date.now(),
  };
}

/* =========================================================
   Pantalla
   ========================================================= */
export default function MapAddScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const t = scheme === "dark" ? palette.dark : palette.light;

  const initialRegion: Region = useMemo(
    () => ({
      latitude: -17.3835,
      longitude: -66.163,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }),
    []
  );

  const [region, setRegion] = useState(initialRegion);
  const [followMe, setFollowMe] = useState(false);
  const [userLoc, setUserLoc] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const watcher = useRef<Location.LocationSubscription | null>(null);

  // Formulario
  const [draftCoord, setDraftCoord] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  // Categorías
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [category, setCategory] = useState<string>(""); // se setea al cargar categorías
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Sheets
  const form = useRef(new Animated.Value(0)).current;
  const detail = useRef(new Animated.Value(0)).current;
  const openForm = () =>
    Animated.timing(form, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  const closeForm = () =>
    Animated.timing(form, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  const openDetail = () =>
    Animated.timing(detail, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  const closeDetail = () =>
    Animated.timing(detail, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();

  /* =========================================================
     Cargar usuario + locales desde el backend
     ========================================================= */
  useEffect(() => {
    (async () => {
      try {
        const user = await loadUserSession();
        if (!user || !user._id) {
          console.log("No hay usuario en sesión");
          return;
        }
        setCurrentUser(user);

        const res = await fetch(API_URL);
        const data = await res.json();

        if (!res.ok) {
          console.log("Error al obtener locales", data);
          return;
        }

        // Solo locales creados por este usuario
        const mios = (data as any[]).filter((l) => {
          const creador = l.creadoPor;
          if (!creador) return false;
          if (typeof creador === "string") return creador === user._id;
          // por si viene populado
          return creador._id === user._id;
        });

        const mapped = mios.map(mapLocalToPlace);
        setPlaces(mapped);
      } catch (e) {
        console.warn("No se pudieron cargar los locales del backend", e);
      }
    })();
  }, []);

  /* =========================================================
     Cargar categorías
     ========================================================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(CATEGORY_API);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
          // Si no hay categoría seleccionada, usar la primera
          if (!category && data.length > 0) {
            setCategory(data[0].nombre);
          }
        }
      } catch (e) {
        console.log("❌ Error cargando categorías:", e);
      }
    })();
  }, []);

  const handleBack = () => {
    router.push("/LocalesScreen");
  };

  // Seguir ubicación
  useEffect(() => {
    (async () => {
      if (!followMe) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const curr = await Location.getCurrentPositionAsync({});
      const c = {
        latitude: curr.coords.latitude,
        longitude: curr.coords.longitude,
      };
      setUserLoc(c);
      animateTo(c);

      watcher.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1500,
          distanceInterval: 2,
        },
        ({ coords }) => {
          const cc = { latitude: coords.latitude, longitude: coords.longitude };
          setUserLoc(cc);
          if (followMe) animateTo(cc);
        }
      );
    })();
    return () => {
      watcher.current?.remove?.();
      watcher.current = null;
    };
  }, [followMe]);

  const animateTo = (c: { latitude: number; longitude: number }) =>
    mapRef.current?.animateToRegion(
      { ...c, latitudeDelta: 0.012, longitudeDelta: 0.012 },
      250
    );

  const onLongPress = (e: any) => {
    const coord = e.nativeEvent.coordinate;
    setDraftCoord(coord);
    setTitle("");
    setPhone("");
    setDescription("");
    setImageUri(undefined);
    setEditingId(null); // nuevo local, no edición
    // Por defecto, usar primera categoría disponible
    if (categories.length > 0) {
      setCategory(categories[0].nombre);
    } else {
      setCategory("General");
    }
    openForm();
  };

  /* =========================================================
     CLOUDINARY
     ========================================================= */
  const uploadImageToCloudinary = async (imageUri: string) => {
    try {
      const data = new FormData();

      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "local.jpg",
      } as any);

      data.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      console.log("CLOUDINARY LOCAL:", json);

      return json.secure_url; // ← este es el link final
    } catch (err) {
      console.log("ERROR CLOUDINARY LOCAL:", err);
      return null;
    }
  };

  const handleImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.length) {
      const localUri = result.assets[0].uri;

      // mostrar preview temporal:
      setImageUri(localUri);

      // subir a Cloudinary
      const cloudUrl = await uploadImageToCloudinary(localUri);

      if (cloudUrl) {
        setImageUri(cloudUrl); // link definitivo
        console.log("📤 Imagen local subida:", cloudUrl);
      } else {
        Alert.alert("Error", "No se pudo subir la imagen");
      }
    }
  };

  /* =========================================================
     GUARDAR LOCAL
     ========================================================= */
  const handleSave = async () => {
    if (!draftCoord) return;
    if (!title.trim()) {
      Alert.alert("Falta nombre", "Pon un nombre para el lugar.");
      return;
    }
    if (!currentUser || !currentUser._id) {
      Alert.alert(
        "Sesión requerida",
        "Debes iniciar sesión para crear locales."
      );
      return;
    }

    const finalCategory = category || "General";

    const payload = {
      nombre: title.trim(),
      categoria: finalCategory, // string igual que en web
      telefono: phone.trim(),
      direccion: description.trim(),
      imagen: imageUri ?? "",
      lat: draftCoord.latitude,
      lng: draftCoord.longitude,
      creadoPor: currentUser._id,
      userId: currentUser._id,
    };

    try {
      if (!editingId) {
        // ➕ Crear local
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok) {
          console.log("Error al crear local", data);
          Alert.alert("Error", data.mensaje || "No se pudo crear el local.");
          return;
        }

        const saved = data.local || data;
        const item = mapLocalToPlace(saved);
        const arr = [item, ...places];
        setPlaces(arr);
        closeForm();
        setSelected(item);
        openDetail();
        animateTo(item.coord);
      } else {
        // ✏️ Editar local
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok) {
          console.log("Error al actualizar local", data);
          Alert.alert(
            "Error",
            data.mensaje || "No se pudo actualizar el local."
          );
          return;
        }

        const updated = mapLocalToPlace(data.local || data);
        const arr = places.map((p) => (p.id === updated.id ? updated : p));
        setPlaces(arr);
        closeForm();
        setSelected(updated);
        openDetail();
        animateTo(updated.coord);
        setEditingId(null);
      }
    } catch (e) {
      console.log("Error en handleSave", e);
      Alert.alert("Error", "No se pudo conectar al servidor.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        console.log("Error al eliminar local", data);
        Alert.alert("Error", data.mensaje || "No se pudo eliminar el local.");
        return;
      }

      const arr = places.filter((p) => p.id !== id);
      setPlaces(arr);
      closeDetail();
      setSelected(null);
    } catch (e) {
      console.log("Error en handleDelete", e);
      Alert.alert("Error", "No se pudo conectar al servidor.");
    }
  };

  const s = styles(t);
  const formTY = form.interpolate({
    inputRange: [0, 1],
    outputRange: [380, 0],
  });
  const detailTY = detail.interpolate({
    inputRange: [0, 1],
    outputRange: [260, 0],
  });

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.searchWrap}>
          <TouchableOpacity onPress={handleBack} style={s.iconBtn}>
            <ArrowLeft size={18} color="#e5e7eb" />
          </TouchableOpacity>
          <TextInput
            placeholder="Buscar (demo)"
            placeholderTextColor={t.sub}
            style={s.searchInput}
          />
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity
            onPress={() => setListOpen(true)}
            activeOpacity={0.9}
            style={chipStyles.chip}
          >
            <List size={16} color="#111827" />
            <Text style={s.chipText}> Mis lugares</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFollowMe((v) => !v)}
            activeOpacity={0.9}
            style={[
              chipStyles.chip,
              followMe && { backgroundColor: "#F59E0B" },
            ]}
          >
            <Navigation size={16} color="#111827" />
            <Text style={s.chipText}>
              {" "}
              {followMe ? "Siguiéndote" : "Mi ubicación"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAPA */}
      <MapView
        ref={mapRef}
        style={{
          flex: 1,
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          overflow: "hidden",
        }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
        onPanDrag={() => followMe && setFollowMe(false)}
        onLongPress={onLongPress}
        customMapStyle={scheme === "dark" ? darkStyle : lightStyle}
      >
        {places.map((p) => (
          <Marker
            key={p.id}
            coordinate={p.coord}
            onPress={() => {
              setSelected(p);
              openDetail();
            }}
          >
            <PinView selected={selected?.id === p.id} />
          </Marker>
        ))}

        {userLoc && (
          <Marker
            coordinate={userLoc}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
            zIndex={9999}
          >
            <UserPuck />
          </Marker>
        )}
      </MapView>

      {/* Leyenda */}
      <View style={s.legend}>
        <Text style={s.legendTitle}>Añadir lugar</Text>
        <Text style={{ color: t.sub, fontSize: 12, marginTop: 2 }}>
          Mantén presionado el mapa para colocar un pin
        </Text>
      </View>

      {/* Sheet: Detalle */}
      {selected && (
        <Animated.View
          style={[s.sheetWrap, { transform: [{ translateY: detailTY }] }]}
        >
          <View style={s.sheetCard}>
            <View style={s.rowBetween}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text
                  style={[s.title, { fontSize: 16 }]}
                  numberOfLines={1}
                >
                  {selected.title}
                </Text>
                <Text style={s.sub} numberOfLines={1}>
                  {selected.category} · {selected.phone || "Sin teléfono"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  closeDetail();
                  setSelected(null);
                }}
              >
                <X size={18} color={t.sub} />
              </TouchableOpacity>
            </View>

            {!!selected.imageUri && (
              <Image
                source={{ uri: selected.imageUri }}
                style={{
                  width: "100%",
                  height: 140,
                  borderRadius: 12,
                  marginTop: 10,
                }}
              />
            )}

            {!!selected.description && (
              <Text style={{ color: t.text, marginTop: 10 }}>
                {selected.description}
              </Text>
            )}

            <View style={[s.rowBetween, { marginTop: 12 }]}>
              <TouchableOpacity
                onPress={() => handleDelete(selected.id)}
                style={[s.btnOutlineSm, { borderColor: "#ef4444" }]}
                activeOpacity={0.9}
              >
                <Trash2 size={14} color="#ef4444" />
                <Text style={[s.btnOutlineText, { color: "#ef4444" }]}>
                  {" "}
                  Eliminar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  closeDetail();
                  setDraftCoord(selected.coord);
                  setTitle(selected.title);
                  setPhone(selected.phone);
                  setDescription(selected.description);
                  setImageUri(selected.imageUri);
                  setCategory(selected.category || "General");
                  setEditingId(selected.id);
                  openForm();
                }}
                style={s.btnOutlineSm}
                activeOpacity={0.9}
              >
                <Save size={14} color={t.text} />
                <Text style={s.btnOutlineText}> Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Sheet: Formulario */}
      <Animated.View
        style={[s.formWrap, { transform: [{ translateY: formTY }] }]}
        pointerEvents="box-none"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={s.formCard}>
            <View style={s.rowBetween}>
              <Text style={[s.title, { fontSize: 16 }]}>
                {editingId ? "Editar lugar" : "Nuevo lugar"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  closeForm();
                  setEditingId(null);
                }}
              >
                <X size={18} color={t.sub} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              <FormField label="Nombre del local">
                <Input
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ej. Restaurante La Casa"
                />
              </FormField>

              <FormField label="Categoría">
                <TouchableOpacity
                  onPress={() => setCategoryModalOpen(true)}
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: t.card,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: t.border,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: category ? t.text : t.sub,
                      fontSize: 14,
                    }}
                  >
                    {category || "Selecciona una categoría"}
                  </Text>
                </TouchableOpacity>
              </FormField>

              <FormField label="Teléfono">
                <Input
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+591 70000000"
                  keyboardType="phone-pad"
                />
              </FormField>

              <FormField label="Descripción">
                <Textarea
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descripción corta del lugar..."
                />
              </FormField>

              <Text style={s.inputLabel}>Imagen</Text>
              {imageUri ? (
                <TouchableOpacity onPress={handleImage} activeOpacity={0.9}>
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: 140, borderRadius: 12 }}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleImage}
                  style={s.uploadBox}
                  activeOpacity={0.9}
                >
                  <ImagePlus size={20} color={t.sub} />
                  <Text
                    style={{ color: t.sub, marginTop: 6, fontSize: 12 }}
                  >
                    Subir imagen
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.9}
                style={s.primaryBtn}
              >
                <Text style={s.primaryBtnText}>
                  {editingId ? "Guardar cambios" : "Guardar local"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

      {/* Lista Modal */}
      <Modal
        visible={listOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setListOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: t.overlay }}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={s.listCard}>
              <View style={s.rowBetween}>
                <Text style={[s.title, { fontSize: 16 }]}>
                  Mis lugares ({places.length})
                </Text>
                <TouchableOpacity onPress={() => setListOpen(false)}>
                  <X size={18} color={t.sub} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={places}
                keyExtractor={(i) => i.id}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      setListOpen(false);
                      setSelected(item);
                      openDetail();
                      animateTo(item.coord);
                    }}
                    style={s.listRow}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: "#111827",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.imageUri ? (
                          <Image
                            source={{ uri: item.imageUri }}
                            style={{ width: 44, height: 44, borderRadius: 10 }}
                          />
                        ) : (
                          <Camera size={18} color="#e5e7eb" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[s.title, { fontSize: 14 }]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[s.sub, { fontSize: 12 }]}
                          numberOfLines={1}
                        >
                          {item.category} ·{" "}
                          {item.phone || "Sin teléfono"}
                        </Text>
                      </View>
                    </View>
                    <Text style={[s.sub, { fontSize: 12 }]}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal selección de categoría */}
      <Modal
        visible={categoryModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: t.overlay }}>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            <View style={s.listCard}>
              <View style={s.rowBetween}>
                <Text style={[s.title, { fontSize: 16 }]}>
                  Seleccionar categoría
                </Text>
                <TouchableOpacity
                  onPress={() => setCategoryModalOpen(false)}
                >
                  <X size={18} color={t.sub} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={categories}
                keyExtractor={(c) => c._id}
                ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
                contentContainerStyle={{
                  paddingTop: 8,
                  paddingBottom: 12,
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: t.border,
                      backgroundColor:
                        category === item.nombre
                          ? "rgba(251,191,36,0.15)"
                          : t.card,
                    }}
                    onPress={() => {
                      setCategory(item.nombre);
                      setCategoryModalOpen(false);
                    }}
                  >
                    <Text style={{ color: t.text, fontSize: 14 }}>
                      {item.nombre}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   Subcomponentes
   ========================================================= */
function PinView({ selected }: { selected: boolean }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: selected ? 44 : 34,
          height: selected ? 44 : 34,
          borderRadius: 999,
          backgroundColor: "#F59E0B",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MapPin size={selected ? 22 : 18} color="#111827" />
      </View>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: "#FCD34D",
          position: "absolute",
          right: -2,
          top: -2,
        }}
      />
    </View>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const scheme = useColorScheme();
  const t = scheme === "dark" ? palette.dark : palette.light;
  return (
    <View style={{ marginBottom: 10 }}>
      <Text
        style={{
          color: t.text,
          fontSize: 12,
          marginBottom: 6,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const scheme = useColorScheme();
  const t = scheme === "dark" ? palette.dark : palette.light;
  return (
    <TextInput
      {...props}
      placeholderTextColor={t.sub}
      style={[
        {
          backgroundColor: t.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: t.text,
        },
        props.style,
      ]}
    />
  );
}

function Textarea(props: React.ComponentProps<typeof TextInput>) {
  const scheme = useColorScheme();
  const t = scheme === "dark" ? palette.dark : palette.light;
  return (
    <TextInput
      {...props}
      multiline
      placeholderTextColor={t.sub}
      style={[
        {
          backgroundColor: t.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          minHeight: 90,
          textAlignVertical: "top",
          color: t.text,
        },
        props.style,
      ]}
    />
  );
}

function UserPuck() {
  const BOX = 80,
    R1 = 48,
    R2 = 40;
  const v1 = React.useRef(new Animated.Value(0)).current;
  const v2 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = (v: Animated.Value, d: number) =>
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration: 1400,
          delay: d,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      ).start();
    loop(v1, 0);
    loop(v2, 400);
  }, [v1, v2]);

  const s1 = v1.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] });
  const o1 = v1.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  const s2 = v2.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.6] });
  const o2 = v2.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <View
      style={{
        width: BOX,
        height: BOX,
        alignItems: "center",
        justifyContent: "center",
      }}
      pointerEvents="none"
    >
      <View
        style={{
          position: "absolute",
          width: 64,
          height: 64,
          borderRadius: 999,
          backgroundColor: "#F59E0B",
          opacity: 0.18,
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: R1,
          height: R1,
          borderRadius: 999,
          backgroundColor: "#F59E0B",
          opacity: o1,
          transform: [{ scale: s1 }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: R2,
          height: R2,
          borderRadius: 999,
          backgroundColor: "#F59E0B",
          opacity: o2,
          transform: [{ scale: s2 }],
        }}
      />
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          backgroundColor: "#FCD34D",
        }}
      />
    </View>
  );
}

/* =========================================================
   Estilos
   ========================================================= */
const styles = (t: typeof palette.light | typeof palette.dark) =>
  StyleSheet.create({
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(17,17,19,0.75)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(148,163,184,0.25)",
    },
    screen: { flex: 1, backgroundColor: t.bg },
    header: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      zIndex: 2,
    },
    searchWrap: { flexDirection: "row", alignItems: "center" },
    searchInput: {
      flex: 1,
      height: 40,
      borderRadius: 12,
      paddingHorizontal: 12,
      backgroundColor: t.card,
      color: t.text,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      marginRight: 8,
    },
    headerActions: { flexDirection: "row", gap: 10, marginTop: 10 },
    chipText: { color: "#111827", fontWeight: "700", fontSize: 12 },

    legend: {
      position: "absolute",
      right: 10,
      bottom: 90,
      backgroundColor: t.legendBg,
      borderColor: t.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
      padding: 10,
    },
    legendTitle: { color: t.legendText, fontWeight: "800" },

    sheetWrap: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 12 + (Platform.OS === "ios" ? 8 : 0),
    },
    sheetCard: {
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      padding: 14,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },

    formWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
    formCard: {
      backgroundColor: t.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      padding: 14,
      maxHeight: 420,
    },

    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    title: { color: t.text, fontWeight: "800" },
    sub: { color: t.sub },

    inputLabel: {
      color: t.text,
      fontSize: 12,
      marginTop: 10,
      marginBottom: 6,
      fontWeight: "600",
    },

    uploadBox: {
      height: 140,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.card,
    },

    primaryBtn: {
      marginTop: 12,
      backgroundColor: "#FBBF24",
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    primaryBtnText: { color: "#111827", fontWeight: "800" },

    btnOutlineSm: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: "transparent",
      borderRadius: 10,
      flexDirection: "row",
    },
    btnOutlineText: { color: t.text, fontWeight: "600", fontSize: 12 },

    listCard: {
      backgroundColor: t.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      maxHeight: "65%",
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 12,
    },
    listRow: {
      backgroundColor: t.card,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  });

const chipStyles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FBBF24",
    flexDirection: "row",
    alignItems: "center",
  },
});

/* =========================================================
   Estilos de mapa (Google)
   ========================================================= */
const darkStyle = [
  { elementType: "geometry", stylers: [{ color: "#0b132b" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a9b1c3" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b132b" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1c2541" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const lightStyle = [
  { elementType: "geometry", stylers: [{ color: "#eaeef5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
