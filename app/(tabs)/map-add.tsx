// app/(tabs)/map-add.tsx
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
    Camera,
    Filter,
    ImagePlus,
    List,
    MapPin,
    Navigation,
    Save,
    Trash2,
    X,
} from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

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
  createdAt: number;
};

/* =========================================================
   FileSystem (TIP-SAFE: sin errores de TS)
   ========================================================= */
// Algunos tipados viejos de expo-file-system no exponen estas props.
// Usamos un cast controlado y fallbacks para web.
const FS_ANY = FileSystem as unknown as {
  documentDirectory?: string | null;
  cacheDirectory?: string | null;
};

const DOC_DIR = FS_ANY.documentDirectory ?? null;
const CACHE_DIR = FS_ANY.cacheDirectory ?? null;

// En web documentDirectory suele ser null; preferimos cacheDirectory.
// En nativo preferimos documentDirectory.
const BASE_DIR =
  Platform.OS === 'web'
    ? (CACHE_DIR ?? '')
    : (DOC_DIR ?? CACHE_DIR ?? '');

// Si BASE_DIR es '', no escribimos en disco (solo memoria).
const SAVE_PATH = BASE_DIR ? `${BASE_DIR}SavedPlaces.json` : '';

/* =========================================================
   Paleta
   ========================================================= */
const palette = {
  light: {
    bg: '#F4F6FA',
    card: '#FFFFFF',
    text: '#0f1115',
    sub: '#6B7280',
    border: '#E5E7EB',
    chip: '#FBBF24',
    legendBg: '#FFFFFF',
    legendText: '#0f1115',
    overlay: 'rgba(0,0,0,0.45)',
  },
  dark: {
    bg: '#0b0b0b',
    card: '#0f0f10',
    text: '#E5E7EB',
    sub: '#9CA3AF',
    border: 'rgba(148,163,184,0.25)',
    chip: '#FBBF24',
    legendBg: '#0f0f10',
    legendText: '#E5E7EB',
    overlay: 'rgba(0,0,0,0.65)',
  },
} as const;

/* =========================================================
   Pantalla
   ========================================================= */
export default function MapAddScreen() {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? palette.dark : palette.light;

  const initialRegion: Region = useMemo(
    () => ({
      latitude: -17.3835,
      longitude: -66.163,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }),
    [],
  );

  const [region, setRegion] = useState(initialRegion);
  const [followMe, setFollowMe] = useState(false);
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);

  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const mapRef = useRef<MapView | null>(null);
  const watcher = useRef<Location.LocationSubscription | null>(null);

  // Formulario
  const [draftCoord, setDraftCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  // Sheets
  const form = useRef(new Animated.Value(0)).current;
  const detail = useRef(new Animated.Value(0)).current;
  const openForm = () =>
    Animated.timing(form, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  const closeForm = () =>
    Animated.timing(form, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start();
  const openDetail = () =>
    Animated.timing(detail, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  const closeDetail = () =>
    Animated.timing(detail, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start();

  // Cargar JSON
  React.useEffect(() => {
    (async () => {
      try {
        if (!SAVE_PATH) return;
        const info = await FileSystem.getInfoAsync(SAVE_PATH);
        if (info.exists) {
          const raw = await FileSystem.readAsStringAsync(SAVE_PATH);
          const arr: Place[] = JSON.parse(raw || '[]');
          setPlaces(arr);
        }
      } catch (e) {
        console.warn('No se pudo leer SavedPlaces.json', e);
      }
    })();
  }, []);

  const persist = async (arr: Place[]) => {
    setPlaces(arr);
    try {
      if (!SAVE_PATH) return;
      await FileSystem.writeAsStringAsync(SAVE_PATH, JSON.stringify(arr));
    } catch (e) {
      console.warn('No se pudo guardar JSON', e);
    }
  };

  // Seguir ubicación
  React.useEffect(() => {
    (async () => {
      if (!followMe) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const curr = await Location.getCurrentPositionAsync({});
      const c = { latitude: curr.coords.latitude, longitude: curr.coords.longitude };
      setUserLoc(c);
      animateTo(c);

      watcher.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 1500, distanceInterval: 2 },
        ({ coords }) => {
          const cc = { latitude: coords.latitude, longitude: coords.longitude };
          setUserLoc(cc);
          if (followMe) animateTo(cc);
        },
      );
    })();
    return () => {
      watcher.current?.remove?.();
      watcher.current = null;
    };
  }, [followMe]);

  const animateTo = (c: { latitude: number; longitude: number }) =>
    mapRef.current?.animateToRegion({ ...c, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 250);

  const onLongPress = (e: any) => {
    const coord = e.nativeEvent.coordinate;
    setDraftCoord(coord);
    setTitle('');
    setPhone('');
    setDescription('');
    setImageUri(undefined);
    openForm();
  };

  const handleImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!draftCoord) return;
    if (!title.trim()) {
      Alert.alert('Falta nombre', 'Pon un nombre para el lugar.');
      return;
    }
    const item: Place = {
      id: String(Date.now()),
      title: title.trim(),
      phone: phone.trim(),
      description: description.trim(),
      imageUri,
      coord: draftCoord,
      createdAt: Date.now(),
    };
    const arr = [item, ...places];
    await persist(arr);
    closeForm();
    setSelected(item);
    openDetail();
    animateTo(item.coord);
  };

  const handleDelete = async (id: string) => {
    const arr = places.filter((p) => p.id !== id);
    await persist(arr);
    closeDetail();
    setSelected(null);
  };

  const s = styles(t);
  const formTY = form.interpolate({ inputRange: [0, 1], outputRange: [380, 0] });
  const detailTY = detail.interpolate({ inputRange: [0, 1], outputRange: [260, 0] });

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.searchWrap}>
          <TextInput placeholder="Buscar (demo)" placeholderTextColor={t.sub} style={s.searchInput} />
          <TouchableOpacity style={s.filterBtn} activeOpacity={0.9}>
            <Filter size={18} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={() => setListOpen(true)} activeOpacity={0.9} style={chipStyles.chip}>
            <List size={16} color="#111827" />
            <Text style={s.chipText}>  Mis lugares</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFollowMe((v) => !v)}
            activeOpacity={0.9}
            style={[chipStyles.chip, followMe && { backgroundColor: '#F59E0B' }]}
          >
            <Navigation size={16} color="#111827" />
            <Text style={s.chipText}>  {followMe ? 'Siguiéndote' : 'Mi ubicación'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAPA */}
      <MapView
        ref={mapRef}
        style={{ flex: 1, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, overflow: 'hidden' }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
        onPanDrag={() => followMe && setFollowMe(false)}
        onLongPress={onLongPress}
        customMapStyle={scheme === 'dark' ? darkStyle : lightStyle}
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
          <Marker coordinate={userLoc} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges zIndex={9999}>
            <UserPuck />
          </Marker>
        )}
      </MapView>

      {/* Leyenda */}
      <View style={s.legend}>
        <Text style={s.legendTitle}>Añadir lugar</Text>
        <Text style={{ color: t.sub, fontSize: 12, marginTop: 2 }}>Mantén presionado el mapa para colocar un pin</Text>
      </View>

      {/* Sheet: Detalle */}
      {selected && (
        <Animated.View style={[s.sheetWrap, { transform: [{ translateY: detailTY }] }]}>
          <View style={s.sheetCard}>
            <View style={s.rowBetween}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[s.title, { fontSize: 16 }]} numberOfLines={1}>
                  {selected.title}
                </Text>
                <Text style={s.sub} numberOfLines={1}>
                  {selected.phone || 'Sin teléfono'}
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
              <Image source={{ uri: selected.imageUri }} style={{ width: '100%', height: 140, borderRadius: 12, marginTop: 10 }} />
            )}

            {!!selected.description && <Text style={{ color: t.text, marginTop: 10 }}>{selected.description}</Text>}

            <View style={[s.rowBetween, { marginTop: 12 }]}>
              <TouchableOpacity onPress={() => handleDelete(selected.id)} style={[s.btnOutlineSm, { borderColor: '#ef4444' }]} activeOpacity={0.9}>
                <Trash2 size={14} color="#ef4444" />
                <Text style={[s.btnOutlineText, { color: '#ef4444' }]}>  Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  closeDetail();
                  setDraftCoord(selected.coord);
                  setTitle(selected.title);
                  setPhone(selected.phone);
                  setDescription(selected.description);
                  setImageUri(selected.imageUri);
                  openForm();
                }}
                style={s.btnOutlineSm}
                activeOpacity={0.9}
              >
                <Save size={14} color={t.text} />
                <Text style={s.btnOutlineText}>  Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Sheet: Formulario */}
      <Animated.View style={[s.formWrap, { transform: [{ translateY: formTY }] }]} pointerEvents="box-none">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.formCard}>
            <View style={s.rowBetween}>
              <Text style={[s.title, { fontSize: 16 }]}>Nuevo lugar</Text>
              <TouchableOpacity onPress={closeForm}>
                <X size={18} color={t.sub} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
              <FormField label="Nombre del local">
                <Input value={title} onChangeText={setTitle} placeholder="Ej. Restaurante La Casa" />
              </FormField>

              <FormField label="Teléfono">
                <Input value={phone} onChangeText={setPhone} placeholder="+591 70000000" keyboardType="phone-pad" />
              </FormField>

              <FormField label="Descripción">
                <Textarea value={description} onChangeText={setDescription} placeholder="Descripción corta del lugar..." />
              </FormField>

              <Text style={s.inputLabel}>Imagen</Text>
              {imageUri ? (
                <TouchableOpacity onPress={handleImage} activeOpacity={0.9}>
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: 140, borderRadius: 12 }} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleImage} style={s.uploadBox} activeOpacity={0.9}>
                  <ImagePlus size={20} color={t.sub} />
                  <Text style={{ color: t.sub, marginTop: 6, fontSize: 12 }}>Subir imagen</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleSave} activeOpacity={0.9} style={s.primaryBtn}>
                <Text style={s.primaryBtnText}>Guardar en JSON</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

      {/* Lista Modal */}
      <Modal visible={listOpen} transparent animationType="fade" onRequestClose={() => setListOpen(false)}>
        <View style={{ flex: 1, backgroundColor: t.overlay }}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={s.listCard}>
              <View style={s.rowBetween}>
                <Text style={[s.title, { fontSize: 16 }]}>Mis lugares ({places.length})</Text>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: '#111827',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.imageUri ? (
                          <Image source={{ uri: item.imageUri }} style={{ width: 44, height: 44, borderRadius: 10 }} />
                        ) : (
                          <Camera size={18} color="#e5e7eb" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.title, { fontSize: 14 }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={[s.sub, { fontSize: 12 }]} numberOfLines={1}>
                          {item.phone || 'Sin teléfono'}
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
    </View>
  );
}

/* =========================================================
   Subcomponentes
   ========================================================= */
function PinView({ selected }: { selected: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: selected ? 44 : 34,
          height: selected ? 44 : 34,
          borderRadius: 999,
          backgroundColor: '#F59E0B',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MapPin size={selected ? 22 : 18} color="#111827" />
      </View>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: '#FCD34D',
          position: 'absolute',
          right: -2,
          top: -2,
        }}
      />
    </View>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? palette.dark : palette.light;
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: t.text, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? palette.dark : palette.light;
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
  const t = scheme === 'dark' ? palette.dark : palette.light;
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
          textAlignVertical: 'top',
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
        { resetBeforeIteration: true },
      ).start();
    loop(v1, 0);
    loop(v2, 400);
  }, [v1, v2]);

  const s1 = v1.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] });
  const o1 = v1.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  const s2 = v2.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.6] });
  const o2 = v2.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <View style={{ width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
      <View style={{ position: 'absolute', width: 64, height: 64, borderRadius: 999, backgroundColor: '#F59E0B', opacity: 0.18 }} />
      <Animated.View
        style={{
          position: 'absolute',
          width: R1,
          height: R1,
          borderRadius: 999,
          backgroundColor: '#F59E0B',
          opacity: o1,
          transform: [{ scale: s1 }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: R2,
          height: R2,
          borderRadius: 999,
          backgroundColor: '#F59E0B',
          opacity: o2,
          transform: [{ scale: s2 }],
        }}
      />
      <View style={{ width: 20, height: 20, borderRadius: 999, backgroundColor: '#FCD34D' }} />
    </View>
  );
}

/* =========================================================
   Estilos
   ========================================================= */
const styles = (t: typeof palette.light | typeof palette.dark) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    header: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      zIndex: 2,
    },
    searchWrap: { flexDirection: 'row', alignItems: 'center' },
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
    filterBtn: {
      width: 36,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FBBF24',
    },
    headerActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
    chipText: { color: '#111827', fontWeight: '700', fontSize: 12 },

    legend: {
      position: 'absolute',
      right: 10,
      bottom: 90,
      backgroundColor: t.legendBg,
      borderColor: t.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
      padding: 10,
    },
    legendTitle: { color: t.legendText, fontWeight: '800' },

    sheetWrap: { position: 'absolute', left: 12, right: 12, bottom: 12 + (Platform.OS === 'ios' ? 8 : 0) },
    sheetCard: {
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      padding: 14,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },

    formWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
    formCard: {
      backgroundColor: t.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      padding: 14,
      maxHeight: 420,
    },

    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

    title: { color: t.text, fontWeight: '800' },
    sub: { color: t.sub },

    inputLabel: { color: t.text, fontSize: 12, marginTop: 10, marginBottom: 6, fontWeight: '600' },

    uploadBox: {
      height: 140,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.card,
    },

    primaryBtn: { marginTop: 12, backgroundColor: '#FBBF24', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    primaryBtnText: { color: '#111827', fontWeight: '800' },

    btnOutlineSm: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: 'transparent',
      borderRadius: 10,
      flexDirection: 'row',
    },
    btnOutlineText: { color: t.text, fontWeight: '600', fontSize: 12 },

    listCard: {
      backgroundColor: t.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      maxHeight: '65%',
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space_between',
      justifyContent: 'space-between',
    },
  });

const chipStyles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FBBF24',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

/* =========================================================
   Estilos de mapa (Google)
   ========================================================= */
const darkStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0b132b' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a9b1c3' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b132b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c2541' }] },
  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const lightStyle = [
  { elementType: 'geometry', stylers: [{ color: '#eaeef5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];
