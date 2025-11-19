// // app/(tabs)/map.tsx

// /* =========================
//    Tipos y datos de prueba
//    ========================= */
// type ProviderItem = {
//   id: number;
//   title: string;
//   category: string;
//   coord: { latitude: number; longitude: number };
//   rating: number;
//   price: string;
//   status: 'available' | 'unavailable';
// };

// const MOCK: ProviderItem[] = [
//   { id: 1, title: 'Plomería Express', category: 'Plomería', coord: { latitude: -17.382, longitude: -66.1635 }, rating: 4.8, price: '$50-80/h', status: 'available' },
//   { id: 2, title: 'Limpieza ProClean', category: 'Limpieza', coord: { latitude: -17.3845, longitude: -66.159 }, rating: 4.9, price: '$40-60/h', status: 'unavailable' },
//   { id: 3, title: 'Delivery Rápido', category: 'Delivery', coord: { latitude: -17.387, longitude: -66.1655 }, rating: 4.7, price: '$12/envío', status: 'available' },
//   { id: 4, title: 'Restaurante La Casa', category: 'Restaurante', coord: { latitude: -17.3805, longitude: -66.1675 }, rating: 4.5, price: '$15-30', status: 'available' },
// ];

// /* =========================
//    Paleta por tema
//    ========================= */
// const palette = {
//   light: {
//     bg: '#F4F6FA',
//     card: '#FFFFFF',
//     text: '#0f1115',
//     sub: '#6B7280',
//     border: '#E5E7EB',
//     chip: '#FBBF24',
//     legendBg: '#FFFFFF',
//     legendText: '#0f1115',
//     overlay: 'rgba(0,0,0,0.4)',
//   },
//   dark: {
//     bg: '#0b0b0b',
//     card: '#0f0f10',
//     text: '#E5E7EB',
//     sub: '#9CA3AF',
//     border: 'rgba(148,163,184,0.25)',
//     chip: '#FBBF24',
//     legendBg: '#0f0f10',
//     legendText: '#E5E7EB',
//     overlay: 'rgba(0,0,0,0.6)',
//   },
// } as const;

// /* =========================
//    Pantalla principal
//    ========================= */
// export default function MapScreen() {
//   const router = useRouter();
//   const scheme = useColorScheme();
//   const t = scheme === 'dark' ? palette.dark : palette.light;

//   const initialRegion: Region = useMemo(
//     () => ({
//       latitude: -17.3835,
//       longitude: -66.163,
//       latitudeDelta: 0.015,
//       longitudeDelta: 0.015,
//     }),
//     [],
//   );

//   const [region, setRegion] = useState(initialRegion);
//   const [selected, setSelected] = useState<ProviderItem | null>(null);
//   const [legendOpen] = useState(true);

//   // --- ubicación y seguimiento ---
//   const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [followMe, setFollowMe] = useState(false);
//   const mapRef = useRef<MapView | null>(null);
//   const watcher = useRef<Location.LocationSubscription | null>(null);

//   React.useEffect(() => {
//     (async () => {
//       if (!followMe) return;
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') return;

//       const curr = await Location.getCurrentPositionAsync({});
//       const center = { latitude: curr.coords.latitude, longitude: curr.coords.longitude };
//       setUserLoc(center);
//       animateTo(center);

//       watcher.current = await Location.watchPositionAsync(
//         { accuracy: Location.Accuracy.Balanced, timeInterval: 1500, distanceInterval: 2 },
//         ({ coords }) => {
//           const c = { latitude: coords.latitude, longitude: coords.longitude };
//           setUserLoc(c);
//           if (followMe) animateTo(c);
//         },
//       );
//     })();

//     return () => {
//       watcher.current?.remove();
//       watcher.current = null;
//     };
//   }, [followMe]);

//   const animateTo = (center: { latitude: number; longitude: number }) => {
//     mapRef.current?.animateToRegion(
//       {
//         latitude: center.latitude,
//         longitude: center.longitude,
//         latitudeDelta: 0.012,
//         longitudeDelta: 0.012,
//       },
//       250,
//     );
//   };

//   const onPan = () => {
//     if (followMe) setFollowMe(false);
//   };

//   // Animación bottom sheet
//   const bottom = useRef(new Animated.Value(0)).current;
//   const showSheet = () =>
//     Animated.timing(bottom, {
//       toValue: 1,
//       duration: 260,
//       easing: Easing.out(Easing.cubic),
//       useNativeDriver: true,
//     }).start();
//   const hideSheet = () =>
//     Animated.timing(bottom, {
//       toValue: 0,
//       duration: 220,
//       easing: Easing.in(Easing.cubic),
//       useNativeDriver: true,
//     }).start();

//   // Lista modal (botón "Lista")
//   const [listOpen, setListOpen] = useState(false);
//   const [search, setSearch] = useState('');
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return MOCK;
//     return MOCK.filter(
//       (i) =>
//         i.title.toLowerCase().includes(q) ||
//         i.category.toLowerCase().includes(q) ||
//         i.price.toLowerCase().includes(q),
//     );
//   }, [search]);

//   const s = styles(t);

//   return (
//     <View style={s.screen}>
//       {/* Header */}
//       <View style={s.header}>
//         {/* FILA: back + search + filtro */}
//         <View style={s.headerRow}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => router.push('/LocalesScreen')}
//             style={s.backBtn}
//           >
//             <ArrowLeft size={18} color={t.text} />
//           </TouchableOpacity>

//           <View style={s.searchWrap}>
//             <TextInput
//               placeholder="Buscar en el mapa..."
//               placeholderTextColor={t.sub}
//               style={s.searchInput}
//               value={search}
//               onChangeText={setSearch}
//             />

//           </View>
//         </View>

//         {/* Acciones (Mi ubicación / Seguir) */}
//         <View style={s.headerActions}>
//           <TouchableOpacity
//             onPress={() => setFollowMe((v) => !v)}
//             activeOpacity={0.9}
//             style={[chipStyles.chip, followMe && { backgroundColor: '#F59E0B' }]}
//           >
//             <Navigation size={16} color="#111827" />
//             <Text style={s.chipText}>  {followMe ? 'Siguiéndote' : 'Mi ubicación'}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* MAPA */}
//       <MapView
//         ref={mapRef}
//         style={{ flex: 1, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, overflow: 'hidden' }}
//         provider={PROVIDER_GOOGLE}
//         initialRegion={initialRegion}
//         onRegionChangeComplete={setRegion}
//         onPanDrag={onPan}
//         customMapStyle={scheme === 'dark' ? darkStyle : lightStyle}
//       >
//         {/* Pines mock */}
//         {MOCK.map((m) => (
//           <Pin
//             key={m.id}
//             item={m}
//             selected={selected?.id === m.id}
//             onPress={() => {
//               setSelected(m);
//               showSheet();
//             }}
//           />
//         ))}

//         {/* Puck (tu ubicación) */}
//         {userLoc && (
//           <Marker
//             coordinate={userLoc}
//             anchor={{ x: 0.5, y: 0.5 }}
//             tracksViewChanges={true}
//             zIndex={9999}
//           >
//             <UserPuck />
//           </Marker>
//         )}
//       </MapView>

//       {/* Leyenda */}
//       {legendOpen && (
//         <View style={s.legend}>
//           <Text style={s.legendTitle}>Leyenda</Text>
//           <LegendRow color="#F59E0B" label="Disponible" />
//           <LegendRow color="#9CA3AF" label="No disponible" />
//           <LegendRow color="#FCD34D" label="Tu ubicación" />
//         </View>
//       )}

//       {/* Bottom sheet detalle */}
//       <BottomSheet
//         t={t}
//         bottom={bottom}
//         onClose={() => {
//           hideSheet();
//           setSelected(null);
//         }}
//       >
//         {selected && (
//           <View>
//             <View style={s.rowBetween}>
//               <View>
//                 <Text style={[s.title, { fontSize: 16 }]}>{selected.title}</Text>
//                 <Text style={s.sub}>{selected.category}</Text>
//               </View>
//               <TouchableOpacity
//                 onPress={() => {
//                   hideSheet();
//                   setSelected(null);
//                 }}
//               >
//                 <X size={18} color={t.sub} />
//               </TouchableOpacity>
//             </View>

//             <View style={[s.row, { gap: 10, marginTop: 10 }]}>
//               <View style={[s.row, { gap: 4 }]}>
//                 <Star size={14} color="#F59E0B" fill="#F59E0B" />
//                 <Text style={s.textStrong}>{selected.rating.toFixed(1)}</Text>
//               </View>
//               <StatusPill status={selected.status} />
//               <Text style={[s.textStrong, { marginLeft: 'auto' }]}>{selected.price}</Text>
//             </View>

//             <TouchableOpacity activeOpacity={0.9} style={s.primaryBtn}>
//               <Text style={s.primaryBtnText}>Ver detalle</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </BottomSheet>

//       {/* LISTA MODAL */}
//       <ListModal
//         open={listOpen}
//         onClose={() => setListOpen(false)}
//         t={t}
//         data={filtered}
//         onSelect={(item) => {
//           setListOpen(false);
//           setSelected(item);
//           showSheet();
//           animateTo(item.coord);
//         }}
//       />
//     </View>
//   );
// }

// /* =========================
//    Subcomponentes
//    ========================= */
// function LegendRow({ color, label }: { color: string; label: string }) {
//   return (
//     <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
//       <View
//         style={{
//           width: 8,
//           height: 8,
//           borderRadius: 999,
//           backgroundColor: color,
//           marginRight: 8,
//         }}
//       />
//       <Text style={{ color: '#AEB4BE', fontSize: 12 }}>{label}</Text>
//     </View>
//   );
// }

// function UserPuck() {
//   // Punto central más grande + anillos más pequeños
//   const BOX = 80;
//   const RING1 = 48;
//   const RING2 = 40;

//   const ring1 = React.useRef(new Animated.Value(0)).current;
//   const ring2 = React.useRef(new Animated.Value(0)).current;

//   React.useEffect(() => {
//     const loop = (v: Animated.Value, delay: number) =>
//       Animated.loop(
//         Animated.timing(v, {
//           toValue: 1,
//           duration: 1400,
//           delay,
//           easing: Easing.out(Easing.quad),
//           useNativeDriver: true,
//         }),
//         { resetBeforeIteration: true },
//       ).start();
//     loop(ring1, 0);
//     loop(ring2, 400);
//   }, [ring1, ring2]);

//   const scale1 = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] });
//   const opa1 = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
//   const scale2 = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.6] });
//   const opa2 = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

//   return (
//     <View
//       style={{ width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' }}
//       pointerEvents="none"
//     >
//       {/* halo/glow */}
//       <View
//         style={{
//           position: 'absolute',
//           width: 64,
//           height: 64,
//           borderRadius: 999,
//           backgroundColor: '#F59E0B',
//           opacity: 0.18,
//         }}
//       />
//       {/* ring 1 */}
//       <Animated.View
//         style={{
//           position: 'absolute',
//           width: RING1,
//           height: RING1,
//           borderRadius: 999,
//           backgroundColor: '#F59E0B',
//           opacity: opa1,
//           transform: [{ scale: scale1 }],
//         }}
//       />
//       {/* ring 2 */}
//       <Animated.View
//         style={{
//           position: 'absolute',
//           width: RING2,
//           height: RING2,
//           borderRadius: 999,
//           backgroundColor: '#F59E0B',
//           opacity: opa2,
//           transform: [{ scale: scale2 }],
//         }}
//       />
//       {/* punto central */}
//       <View
//         style={{
//           width: 20,
//           height: 20,
//           borderRadius: 999,
//           backgroundColor: '#FCD34D',
//           borderWidth: 4,
//           borderColor: '#111827',
//         }}
//       />
//     </View>
//   );
// }

// function StatusPill({ status }: { status: 'available' | 'unavailable' }) {
//   const color = status === 'available' ? '#F59E0B' : '#9CA3AF';
//   const text = status === 'available' ? 'Disponible' : 'No disponible';
//   return (
//     <View
//       style={{
//         borderColor: color,
//         borderWidth: 1,
//         borderRadius: 999,
//         paddingVertical: 3,
//         paddingHorizontal: 8,
//       }}
//     >
//       <Text style={{ color, fontWeight: '700', fontSize: 12 }}>{text}</Text>
//     </View>
//   );
// }

// function Pin({
//   item,
//   selected,
//   onPress,
// }: {
//   item: ProviderItem;
//   selected: boolean;
//   onPress: () => void;
// }) {
//   const scale = useRef(new Animated.Value(selected ? 1.15 : 1)).current;
//   React.useEffect(() => {
//     Animated.spring(scale, {
//       toValue: selected ? 1.15 : 1,
//       useNativeDriver: true,
//       friction: 6,
//     }).start();
//   }, [selected]);

//   const outer = '#F59E0B';
//   const dot = item.status === 'available' ? '#FCD34D' : '#9CA3AF';

//   return (
//     <Marker coordinate={item.coord} onPress={onPress} tracksViewChanges={false}>
//       <Animated.View style={{ transform: [{ scale }] }}>
//         <View style={{ alignItems: 'center' }}>
//           <View
//             style={{
//               width: selected ? 44 : 34,
//               height: selected ? 44 : 34,
//               borderRadius: 999,
//               backgroundColor: outer,
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <MapPin size={selected ? 22 : 18} color="#111827" />
//           </View>
//           <View
//             style={{
//               width: 8,
//               height: 8,
//               borderRadius: 999,
//               backgroundColor: dot,
//               position: 'absolute',
//               right: -2,
//               top: -2,
//             }}
//           />
//         </View>
//       </Animated.View>
//     </Marker>
//   );
// }

// /* =========================
//    Lista Modal + BottomSheet
//    ========================= */
// function ListModal({
//   open,
//   onClose,
//   t,
//   data,
//   onSelect,
// }: {
//   open: boolean;
//   onClose: () => void;
//   t: typeof palette.light | typeof palette.dark;
//   data: ProviderItem[];
//   onSelect: (item: ProviderItem) => void;
// }) {
//   return (
//     <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={{ flex: 1, backgroundColor: t.overlay }}>
//         <View style={{ flex: 1, justifyContent: 'flex-end' }}>
//           <View
//             style={{
//               backgroundColor: t.card,
//               borderTopLeftRadius: 18,
//               borderTopRightRadius: 18,
//               borderWidth: StyleSheet.hairlineWidth,
//               borderColor: t.border,
//               maxHeight: '65%',
//               paddingBottom: Platform.OS === 'ios' ? 24 : 12,
//             }}
//           >
//             <View
//               style={{
//                 padding: 14,
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//               }}
//             >
//               <Text style={{ color: t.text, fontWeight: '800', fontSize: 16 }}>Resultados</Text>
//               <TouchableOpacity onPress={onClose}>
//                 <X size={20} color={t.sub} />
//               </TouchableOpacity>
//             </View>

//             <FlatList
//               data={data}
//               keyExtractor={(i) => String(i.id)}
//               ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
//               contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 10 }}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   onPress={() => onSelect(item)}
//                   activeOpacity={0.9}
//                   style={{
//                     backgroundColor: t.card,
//                     borderRadius: 12,
//                     borderWidth: StyleSheet.hairlineWidth,
//                     borderColor: t.border,
//                     padding: 12,
//                   }}
//                 >
//                   <View
//                     style={{
//                       flexDirection: 'row',
//                       justifyContent: 'space-between',
//                       alignItems: 'center',
//                     }}
//                   >
//                     <View>
//                       <Text style={{ color: t.text, fontWeight: '800' }}>{item.title}</Text>
//                       <Text style={{ color: t.sub }}>{item.category}</Text>
//                     </View>
//                     <Text style={{ color: t.text, fontWeight: '800' }}>{item.price}</Text>
//                   </View>
//                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
//                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//                       <Star size={14} color="#F59E0B" fill="#F59E0B" />
//                       <Text style={{ color: t.text, fontWeight: '700' }}>
//                         {item.rating.toFixed(1)}
//                       </Text>
//                     </View>
//                     <StatusPill status={item.status} />
//                   </View>
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// function BottomSheet({
//   children,
//   t,
//   bottom,
// }: {
//   children: React.ReactNode;
//   t: typeof palette.light | typeof palette.dark;
//   bottom: Animated.Value;
//   onClose?: () => void;
// }) {
//   const translateY = bottom.interpolate({ inputRange: [0, 1], outputRange: [260, 0] });
//   return (
//     <Animated.View
//       pointerEvents="box-none"
//       style={{
//         position: 'absolute',
//         left: 12,
//         right: 12,
//         bottom: 12 + (Platform.OS === 'ios' ? 8 : 0),
//         transform: [{ translateY }],
//       }}
//     >
//       <View
//         style={{
//           backgroundColor: t.card,
//           borderRadius: 16,
//           borderWidth: StyleSheet.hairlineWidth,
//           borderColor: t.border,
//           padding: 14,
//           shadowColor: '#000',
//           shadowOpacity: 0.12,
//           shadowRadius: 10,
//           shadowOffset: { width: 0, height: 4 },
//         }}
//       >
//         {children}
//       </View>
//     </Animated.View>
//   );
// }

// /* =========================
//    Estilos base
//    ========================= */
// const styles = (t: typeof palette.light | typeof palette.dark) =>
//   StyleSheet.create({
//     screen: { flex: 1, backgroundColor: t.bg },
//     header: {
//       paddingHorizontal: 12,
//       paddingTop: 10,
//       paddingBottom: 8,
//       position: 'absolute',
//       left: 0,
//       right: 0,
//       top: 0,
//       zIndex: 2,
//     },
//     headerRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 8,
//     },
//     backBtn: {
//       width: 40,
//       height: 40,
//       borderRadius: 10,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: t.card,
//       borderWidth: StyleSheet.hairlineWidth,
//       borderColor: t.border,
//     },
//     searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
//     searchInput: {
//       flex: 1,
//       height: 40,
//       borderRadius: 12,
//       paddingHorizontal: 12,
//       backgroundColor: t.card,
//       color: t.text,
//       borderWidth: StyleSheet.hairlineWidth,
//       borderColor: t.border,
//       marginRight: 8,
//     },
//     filterBtn: {
//       width: 36,
//       height: 40,
//       borderRadius: 10,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#FBBF24',
//     },
//     headerActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
//     chipText: { color: '#111827', fontWeight: '700', fontSize: 12 },

//     row: { flexDirection: 'row', alignItems: 'center' },
//     rowBetween: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },

//     legend: {
//       position: 'absolute',
//       right: 10,
//       bottom: 90,
//       backgroundColor: t.legendBg,
//       borderColor: t.border,
//       borderWidth: StyleSheet.hairlineWidth,
//       borderRadius: 12,
//       padding: 10,
//     },
//     legendTitle: { color: t.legendText, fontWeight: '800', marginBottom: 6 },

//     title: { color: t.text, fontWeight: '800' },
//     sub: { color: t.sub },
//     textStrong: { color: t.text, fontWeight: '700' },

//     primaryBtn: {
//       marginTop: 12,
//       backgroundColor: '#FBBF24',
//       borderRadius: 12,
//       paddingVertical: 12,
//       alignItems: 'center',
//     },
//     primaryBtnText: { color: '#111827', fontWeight: '800' },
//   });

// const chipStyles = StyleSheet.create({
//   chip: {
//     borderRadius: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     backgroundColor: '#FBBF24',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
// });

// /* =========================
//    Estilos de mapa (Google)
//    ========================= */
// const darkStyle = [
//   { elementType: 'geometry', stylers: [{ color: '#0b132b' }] },
//   { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
//   { elementType: 'labels.text.fill', stylers: [{ color: '#a9b1c3' }] },
//   { elementType: 'labels.text.stroke', stylers: [{ color: '#0b132b' }] },
//   { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c2541' }] },
//   { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
//   { featureType: 'transit', stylers: [{ visibility: 'off' }] },
// ];

// const lightStyle = [
//   { elementType: 'geometry', stylers: [{ color: '#eaeef5' }] },
//   { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
//   { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
//   { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
//   { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
//   { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
//   { featureType: 'transit', stylers: [{ visibility: 'off' }] },
// ];
