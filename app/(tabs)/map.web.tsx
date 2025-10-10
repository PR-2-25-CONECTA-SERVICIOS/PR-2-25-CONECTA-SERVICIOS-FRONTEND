// // app/(tabs)/MapWeb.tsx
// import * as Location from 'expo-location';
// import { DivIcon } from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { Filter, List, Navigation, Star, X } from 'lucide-react-native';
// import React, { useMemo, useState } from 'react';
// import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
// import {
//   FlatList,
//   Modal,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View
// } from 'react-native';

// /* --- Datos de prueba y tema (igual) --- */
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

// const palette = {
//   light: { bg:'#F4F6FA', card:'#FFFFFF', text:'#0f1115', sub:'#6B7280', border:'#E5E7EB', overlay:'rgba(0,0,0,0.4)' },
//   dark:  { bg:'#0b0b0b', card:'#0f0f10', text:'#E5E7EB', sub:'#9CA3AF', border:'rgba(148,163,184,0.25)', overlay:'rgba(0,0,0,0.6)' },
// } as const;

// /* --- Helpers Leaflet (pines y puck) --- */
// function pinIcon(selected:boolean, available:boolean) {
//   const size = selected ? 44 : 34;
//   const pin = `
//     <div style="position:relative; display:flex; align-items:center; justify-content:center; width:${size}px;height:${size}px;border-radius:999px;background:#F59E0B;box-shadow:0 4px 10px rgba(0,0,0,.25);">
//       <svg width="${selected?22:18}" height="${selected?22:18}" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//         <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/>
//       </svg>
//       <span style="position:absolute;right:-2px;top:-2px;width:8px;height:8px;border-radius:999px;background:${available?'#FCD34D':'#9CA3AF'}"></span>
//     </div>`;
//   return new DivIcon({ html: pin, className: '', iconSize: [size, size], iconAnchor: [size/2, size/2] });
// }

// const puckCSS = `
// @keyframes pulse1 { 0%{transform:scale(.8);opacity:.45} 100%{transform:scale(1.5);opacity:0} }
// @keyframes pulse2 { 0%{transform:scale(.9);opacity:.35} 100%{transform:scale(1.6);opacity:0} }
// .leaflet-puck { width:80px;height:80px; display:flex; align-items:center; justify-content:center; }
// .leaflet-puck .glow { position:absolute; width:64px;height:64px;border-radius:999px;background:#F59E0B;opacity:.18; }
// .leaflet-puck .ring1 { position:absolute; width:48px;height:48px;border-radius:999px;background:#F59E0B; animation:pulse1 1.4s linear infinite; }
// .leaflet-puck .ring2 { position:absolute; width:40px;height:40px;border-radius:999px;background:#F59E0B; animation:pulse2 1.4s .4s linear infinite; }
// .leaflet-puck .dot { width:20px;height:20px;border-radius:999px;background:#FCD34D; position:relative; }
// `;

// function puckIcon() {
//   const html = `
//     <div class="leaflet-puck">
//       <div class="glow"></div>
//       <div class="ring1"></div>
//       <div class="ring2"></div>
//       <div class="dot"></div>
//     </div>`;
//   return new DivIcon({ html, className: '', iconSize: [80,80], iconAnchor: [40,40] });
// }

// /* --- FlyTo helper --- */
// function FlyTo({ center }:{center:[number,number]}) {
//   const map = useMap();
//   React.useEffect(()=>{ map.flyTo(center, 16, { duration: 0.6 }); },[center]);
//   return null;
// }

// export default function MapWeb() {
//   const scheme = useColorScheme();
//   const t = scheme === 'dark' ? palette.dark : palette.light;

//   const initial = useMemo(()=>[-17.3835,-66.163] as [number,number],[]);
//   const [search,setSearch] = useState('');
//   const [selected,setSelected] = useState<ProviderItem|null>(null);
//   const [listOpen,setListOpen] = useState(false);
//   const [followMe,setFollowMe] = useState(false);
//   const [userLoc,setUserLoc] = useState<[number,number] | null>(null);
//   const [flyTo,setFlyTo] = useState<[number,number] | null>(null);

//   const filtered = useMemo(()=>{
//     const q=search.trim().toLowerCase();
//     if(!q) return MOCK;
//     return MOCK.filter(i=> i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.price.toLowerCase().includes(q));
//   },[search]);

//   // seguimiento con expo-location (web necesita https o localhost)
//   React.useEffect(()=>{
//     let sub:any;
//     (async ()=>{
//       if(!followMe) return;
//       try{
//         const {status}=await Location.requestForegroundPermissionsAsync();
//         if(status!=='granted') return;
//         const curr=await Location.getCurrentPositionAsync({});
//         const c:[number,number]=[curr.coords.latitude,curr.coords.longitude];
//         setUserLoc(c); setFlyTo(c);
//         sub=await Location.watchPositionAsync(
//           { accuracy: Location.Accuracy.Balanced, timeInterval:1500, distanceInterval:2 },
//           ({coords})=>{
//             const d:[number,number]=[coords.latitude,coords.longitude];
//             setUserLoc(d); setFlyTo(d);
//           }
//         );
//       }catch{}
//     })();
//     return ()=>{ sub?.remove?.(); };
//   },[followMe]);

//   const s = styles(t);

//   return (
//     <View style={s.screen}>
//       {/* CSS animación puck */}
//       <style>{puckCSS}</style>

//       {/* Header */}
//       <View style={s.header}>
//         <View style={s.searchWrap}>
//           <TextInput placeholder="Buscar en el mapa..." placeholderTextColor={t.sub} style={s.searchInput} value={search} onChangeText={setSearch}/>
//           <TouchableOpacity activeOpacity={0.9} style={s.filterBtn}><Filter size={18} color="#111827"/></TouchableOpacity>
//         </View>
//         <View style={s.headerActions}>
//           <TouchableOpacity activeOpacity={0.9} style={chipStyles.chip} onPress={()=>setListOpen(true)}>
//             <List size={16} color="#111827"/><Text style={s.chipText}>  Lista</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={()=>setFollowMe(v=>!v)} activeOpacity={0.9} style={[chipStyles.chip, followMe && {backgroundColor:'#F59E0B'}]}>
//             <Navigation size={16} color="#111827"/><Text style={s.chipText}>  {followMe?'Siguiéndote':'Mi ubicación'}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Mapa OSM */}
//       <View style={{flex:1, borderBottomLeftRadius:18, borderBottomRightRadius:18, overflow:'hidden'}}>
//         <MapContainer
//           center={initial}
//           zoom={15}
//           style={{height:'100%',width:'100%'}}
//           zoomControl={false}
//         >
//           {/* Capa OSM (claro u oscuro) */}
//           {scheme==='dark' ? (
//             <TileLayer
//               attribution='&copy; OpenStreetMap & contributors'
//               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//             />
//           ) : (
//             <TileLayer
//               attribution='&copy; OpenStreetMap & contributors'
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />
//           )}

//           {flyTo && <FlyTo center={flyTo}/>}

//           {/* Pines */}
//           {MOCK.map(m=>(
//             <Marker
//               key={m.id}
//               position={[m.coord.latitude, m.coord.longitude]}
//               icon={pinIcon(selected?.id===m.id, m.status==='available')}
//               eventHandlers={{ click: ()=> setSelected(m) }}
//             >
//               <Popup>
//                 <b>{m.title}</b><br/>{m.category}
//               </Popup>
//             </Marker>
//           ))}

//           {/* Puck */}
//           {userLoc && (
//             <Marker position={userLoc} icon={puckIcon()} />
//           )}
//         </MapContainer>
//       </View>

//       {/* Leyenda */}
//       <View style={s.legend}>
//         <Text style={s.legendTitle}>Leyenda</Text>
//         <LegendRow color="#F59E0B" label="Disponible"/>
//         <LegendRow color="#9CA3AF" label="No disponible"/>
//         <LegendRow color="#FCD34D" label="Tu ubicación"/>
//       </View>

//       {/* Bottom-sheet (simple en web, sin anim nativa) */}
//       {selected && (
//         <View style={s.webSheet}>
//           <View style={s.rowBetween}>
//             <View>
//               <Text style={[s.title,{fontSize:16}]}>{selected.title}</Text>
//               <Text style={s.sub}>{selected.category}</Text>
//             </View>
//             <TouchableOpacity onPress={()=>setSelected(null)}><X size={18} color={t.sub}/></TouchableOpacity>
//           </View>
//           <View style={[s.row,{gap:10,marginTop:10}]}>
//             <View style={[s.row,{gap:4}]}>
//               <Star size={14} color="#F59E0B" fill="#F59E0B"/><Text style={s.textStrong}>{selected.rating.toFixed(1)}</Text>
//             </View>
//             <StatusPill status={selected.status}/>
//             <Text style={[s.textStrong,{marginLeft:'auto'}]}>{selected.price}</Text>
//           </View>
//           <TouchableOpacity style={s.primaryBtn}><Text style={s.primaryBtnText}>Solicitar Servicio</Text></TouchableOpacity>
//         </View>
//       )}

//       {/* Lista modal */}
//       <ListModal
//         open={listOpen} onClose={()=>setListOpen(false)} t={t} data={filtered}
//         onSelect={(item)=>{ setListOpen(false); setSelected(item); setFlyTo([item.coord.latitude,item.coord.longitude]); }}
//       />
//     </View>
//   );
// }

// /* ---- Subcomponentes compartidos (web) ---- */
// function LegendRow({ color, label }: { color:string; label:string }) {
//   return (
//     <View style={{flexDirection:'row',alignItems:'center',marginTop:6}}>
//       <View style={{width:8,height:8,borderRadius:999,backgroundColor:color,marginRight:8}}/>
//       <Text style={{color:'#AEB4BE',fontSize:12}}>{label}</Text>
//     </View>
//   );
// }

// function StatusPill({status}:{status:'available'|'unavailable'}) {
//   const c=status==='available'?'#F59E0B':'#9CA3AF';
//   const txt=status==='available'?'Disponible':'No disponible';
//   return <View style={{borderColor:c,borderWidth:1,borderRadius:999,paddingVertical:3,paddingHorizontal:8}}>
//     <Text style={{color:c,fontWeight:'700',fontSize:12}}>{txt}</Text>
//   </View>;
// }

// function ListModal({open,onClose,t,data,onSelect}:{open:boolean;onClose:()=>void;t:any;data:ProviderItem[];onSelect:(i:ProviderItem)=>void}) {
//   return (
//     <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={{flex:1,backgroundColor:t.overlay}}>
//         <View style={{flex:1,justifyContent:'flex-end'}}>
//           <View style={{backgroundColor:t.card,borderTopLeftRadius:18,borderTopRightRadius:18,borderWidth:StyleSheet.hairlineWidth,borderColor:t.border,maxHeight:'65%',paddingBottom:12}}>
//             <View style={{padding:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
//               <Text style={{color:t.text,fontWeight:'800',fontSize:16}}>Resultados</Text>
//               <TouchableOpacity onPress={onClose}><X size={20} color={t.sub}/></TouchableOpacity>
//             </View>
//             <FlatList
//               data={data}
//               keyExtractor={i=>String(i.id)}
//               ItemSeparatorComponent={()=> <View style={{height:8}}/>}
//               contentContainerStyle={{paddingHorizontal:12,paddingBottom:10}}
//               renderItem={({item})=>(
//                 <TouchableOpacity onPress={()=>onSelect(item)} activeOpacity={0.9}
//                   style={{backgroundColor:t.card,borderRadius:12,borderWidth:StyleSheet.hairlineWidth,borderColor:t.border,padding:12}}>
//                   <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
//                     <View>
//                       <Text style={{color:t.text,fontWeight:'800'}}>{item.title}</Text>
//                       <Text style={{color:t.sub}}>{item.category}</Text>
//                     </View>
//                     <Text style={{color:t.text,fontWeight:'800'}}>{item.price}</Text>
//                   </View>
//                   <View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:8}}>
//                     <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
//                       <Star size={14} color="#F59E0B" fill="#F59E0B"/>
//                       <Text style={{color:t.text,fontWeight:'700'}}>{item.rating.toFixed(1)}</Text>
//                     </View>
//                     <StatusPill status={item.status}/>
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

// /* ---- Estilos web ---- */
// const styles = (t:any)=>StyleSheet.create({
//   screen:{flex:1,backgroundColor:t.bg},
//   header:{paddingHorizontal:12,paddingTop:10,paddingBottom:8,position:'absolute',left:0,right:0,top:0,zIndex:1000},
//   searchWrap:{flexDirection:'row',alignItems:'center'},
//   searchInput:{flex:1,height:40,borderRadius:12,paddingHorizontal:12,backgroundColor:t.card,color:t.text,borderWidth:StyleSheet.hairlineWidth,borderColor:t.border,marginRight:8},
//   filterBtn:{width:36,height:40,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:'#FBBF24'},
//   headerActions:{flexDirection:'row',gap:10,marginTop:10},
//   chipText:{color:'#111827',fontWeight:'700',fontSize:12},
//   row:{flexDirection:'row',alignItems:'center'},
//   rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
//   legend:{position:'absolute',right:10,bottom:90,backgroundColor:t.card,borderColor:t.border,borderWidth:StyleSheet.hairlineWidth,borderRadius:12,padding:10,zIndex:1000},
//   legendTitle:{color:t.text,fontWeight:'800',marginBottom:6},
//   title:{color:t.text,fontWeight:'800'},
//   sub:{color:t.sub},
//   textStrong:{color:t.text,fontWeight:'700'},
//   primaryBtn:{marginTop:12,backgroundColor:'#FBBF24',borderRadius:12,paddingVertical:12,alignItems:'center'},
//   primaryBtnText:{color:'#111827',fontWeight:'800'},
//   webSheet:{position:'absolute',left:12,right:12,bottom:12,backgroundColor:t.card,borderRadius:16,borderWidth:StyleSheet.hairlineWidth,borderColor:t.border,padding:14,boxShadow:'0 8px 20px rgba(0,0,0,.25)',zIndex:1000},
// });
// const chipStyles=StyleSheet.create({chip:{borderRadius:10,paddingVertical:8,paddingHorizontal:12,backgroundColor:'#FBBF24',flexDirection:'row',alignItems:'center'}});
