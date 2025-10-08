// app/(tabs)/history.tsx
import { CheckCircle, Clock, MessageSquare, Repeat2, Star, XCircle } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

type Status = 'finalizado' | 'pendiente' | 'cancelado';
type HistItem = {
  id: number; title: string; category: string; subtitle: string;
  date: string; price: string; status: Status; rating?: number; image?: string;
};

const DATA: HistItem[] = [
  { id: 1, title: 'Plomería Express', category: 'Plomería', subtitle: 'Reparación de tubería en cocina', date: '26 ene • 14:30', price: '$75', status: 'finalizado' },
  { id: 2, title: 'Restaurante La Casa', category: 'Restaurante', subtitle: 'Cena para 2 personas', date: '25 ene • 19:00', price: '$45', status: 'finalizado', rating: 5,
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop' },
  { id: 3, title: 'Delivery Rápido', category: 'Delivery', subtitle: 'Entrega de documentos', date: '24 ene • 12:15', price: '$12', status: 'pendiente',
    image: 'https://images.unsplash.com/photo-1592194882307-9f22f95a6ab1?q=80&w=800&auto=format&fit=crop' },
  { id: 4, title: 'Limpieza ProClean', category: 'Limpieza', subtitle: 'Limpieza de apartamento', date: '23 ene • 09:00', price: '$60', status: 'cancelado',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop' },
];

const statusPill = (s: Status) => {
  switch (s) {
    case 'finalizado': return { text: 'Finalizado', color: '#34D399', Icon: CheckCircle };
    case 'pendiente':  return { text: 'Pendiente',  color: '#F59E0B', Icon: Clock };
    case 'cancelado':  return { text: 'Cancelado',  color: '#EF4444', Icon: XCircle };
  }
};

const TABS = ['Todos', 'Finalizados', 'Pendientes', 'Cancelados'] as const;

// ---------- theme tokens ----------
const palette = {
  light: {
    bg: '#F4F6FA',
    card: '#FFFFFF',
    text: '#111827',
    sub: '#6B7280',
    border: '#E5E7EB',
    ghost: '#F3F4F6',
    headerBg: '#0C1221',
    headerSub: 'rgba(255,255,255,0.75)',
    tabTrack: '#0F1A33',
    tabActiveBg: '#FFFFFF',
    tabActiveText: '#0C1221',
    shadow: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  },
  dark: {
    bg: '#0b0b0b',
    card: '#0f0f10',
    text: '#e5e7eb',
    sub: '#9ca3af',
    border: 'rgba(148,163,184,0.2)',
    ghost: '#111827',
    headerBg: '#0f0f10',
    headerSub: 'rgba(255,255,255,0.75)',
    tabTrack: '#111827',
    tabActiveBg: '#e5e7eb',
    tabActiveText: '#0b0b0b',
    shadow: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  },
} as const;

export default function HistoryScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? palette.dark : palette.light;

  const [tab, setTab] = useState<(typeof TABS)[number]>('Todos');

  const filtered = useMemo(() => {
    if (tab === 'Todos') return DATA;
    if (tab === 'Finalizados') return DATA.filter(i => i.status === 'finalizado');
    if (tab === 'Pendientes') return DATA.filter(i => i.status === 'pendiente');
    return DATA.filter(i => i.status === 'cancelado');
  }, [tab]);

  const counts = useMemo(() => ({
    fin: DATA.filter(i => i.status === 'finalizado').length,
    pen: DATA.filter(i => i.status === 'pendiente').length,
    can: DATA.filter(i => i.status === 'cancelado').length,
  }), []);

  const s = styles(theme);

  return (
    <View style={s.screen}>
      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Mi Historial</Text>
        <Text style={s.headerSub}>Revisa tus servicios contratados</Text>

        <View style={s.tabs}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              activeOpacity={0.9}
              style={[s.tabBtn, tab === t && s.tabBtnActive]}
            >
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 26 }}>
        <View style={{ gap: 12 }}>
          {filtered.map((item, idx) => (
            <AnimatedCard key={item.id} index={idx}>
              <HistoryCard item={item} s={s} theme={theme} />
            </AnimatedCard>
          ))}
        </View>

        {/* Resumen */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Resumen</Text>
          <View style={s.summaryRow}>
            <SummaryBox s={s} label="Completados" value={counts.fin} color="#34D399" />
            <SummaryBox s={s} label="Pendientes" value={counts.pen} color="#F59E0B" />
            <SummaryBox s={s} label="Cancelados" value={counts.can} color="#EF4444" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  const a = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 350, delay: index * 70, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, [a, index]);
  return (
    <Animated.View style={{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

function HistoryCard({ item, s, theme }: { item: HistItem; s: ReturnType<typeof styles>; theme: any }) {
  const pill = statusPill(item.status);
  const press = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(press, { toValue: 0.98, useNativeDriver: true, friction: 6 }).start();
  const onPressOut = () => Animated.spring(press, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  return (
    <Animated.View style={[s.card, { transform: [{ scale: press }] }]}>
      <TouchableOpacity activeOpacity={0.9} onPressIn={onPressIn} onPressOut={onPressOut} style={{ flexDirection: 'row' }}>
        <View style={s.thumbWrap}>
          {item.image ? <Image source={{ uri: item.image }} style={s.thumb} /> : <View style={[s.thumb, s.thumbFallback]} />}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.price}>{item.price}</Text>
          </View>
          <Text style={s.category}>{item.category}</Text>
          <Text style={s.subtitle}>{item.subtitle}</Text>

          <View style={s.metaRow}>
            <Text style={s.metaText}>{item.date}</Text>
            {!!item.rating && (
              <View style={s.ratingRow}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={s.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>

          <View style={s.actionsRow}>
            {item.status === 'finalizado' && (
              <BtnOutline s={s}>
                <Star size={14} color={theme === palette.dark ? '#e5e7eb' : '#111827'} />
                <Text style={s.btnOutlineText}>  Calificar</Text>
              </BtnOutline>
            )}
            {item.status !== 'cancelado' && (
              <BtnGhost s={s}>
                <Repeat2 size={14} color={s.btnGhostText.color as string} />
                <Text style={s.btnGhostText}>  Repetir</Text>
              </BtnGhost>
            )}
            {item.status === 'pendiente' && (
              <BtnGhost s={s}>
                <MessageSquare size={14} color={s.btnGhostText.color as string} />
                <Text style={s.btnGhostText}>  Chat</Text>
              </BtnGhost>
            )}
          </View>
        </View>

        <View style={s.statusWrap}>
          <View style={[s.pill, { borderColor: pill.color }]}>
            <pill.Icon size={12} color={pill.color} />
            <Text style={[s.pillText, { color: pill.color }]}>{pill.text}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SummaryBox({ s, label, value, color }: { s: ReturnType<typeof styles>; label: string; value: number; color: string }) {
  return (
    <View style={s.sumBox}>
      <Text style={[s.sumValue, { color }]}>{value}</Text>
      <Text style={s.sumLabel}>{label}</Text>
    </View>
  );
}

function BtnOutline({ children, s }: { children: React.ReactNode; s: ReturnType<typeof styles> }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={s.btnOutline}>
      {children}
    </TouchableOpacity>
  );
}
function BtnGhost({ children, s }: { children: React.ReactNode; s: ReturnType<typeof styles> }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={s.btnGhost}>
      {children}
    </TouchableOpacity>
  );
}

// ---------- dynamic styles (dependen del theme) ----------
const styles = (t: typeof palette.light | typeof palette.dark) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },

    header: {
      backgroundColor: t.headerBg,
      paddingTop: 18, paddingHorizontal: 16, paddingBottom: 12,
      borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
    },
    headerTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
    headerSub: { color: t.headerSub, marginTop: 2, marginBottom: 10 },

    tabs: { flexDirection: 'row', backgroundColor: t.tabTrack, borderRadius: 999, padding: 4, gap: 6 },
    tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
    tabBtnActive: { backgroundColor: t.tabActiveBg },
    tabText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 12 },
    tabTextActive: { color: t.tabActiveText },

    card: {
      backgroundColor: t.card, borderRadius: 14, padding: 12,
      borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, ...t.shadow,
    },

    thumbWrap: { width: 56, height: 56, marginRight: 10, borderRadius: 10, overflow: 'hidden' },
    thumb: { width: '100%', height: '100%' },
    thumbFallback: { backgroundColor: t.ghost },

    title: { fontWeight: '800', color: t.text, fontSize: 15, marginRight: 8 },
    price: { color: t.text, fontWeight: '800' },
    category: { color: t.sub, marginTop: 2 },
    subtitle: { color: t.sub, marginTop: 2 },

    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
    metaText: { color: t.sub, fontSize: 12 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { color: t.text, fontWeight: '700', fontSize: 12 },

    actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },

    btnOutline: {
      borderWidth: 1, borderColor: t.border, paddingVertical: 6, paddingHorizontal: 10,
      borderRadius: 10, flexDirection: 'row', alignItems: 'center',
    },
    btnOutlineText: { color: t.text, fontWeight: '700', fontSize: 12 },

    btnGhost: {
      paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: t.ghost,
      flexDirection: 'row', alignItems: 'center',
    },
    btnGhostText: { color: t.text, fontWeight: '700', fontSize: 12 },

    statusWrap: { marginLeft: 8, alignItems: 'flex-end' },
    pill: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1, alignSelf: 'flex-start',
      backgroundColor: 'transparent',
    },
    pillText: { fontSize: 11, fontWeight: '800' },

    summaryCard: {
      marginTop: 14, backgroundColor: t.card, borderRadius: 14, padding: 12,
      borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, ...t.shadow,
    },
    summaryTitle: { fontWeight: '800', color: t.text, marginBottom: 8 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
    sumBox: { alignItems: 'center', flex: 1 },
    sumValue: { fontSize: 22, fontWeight: '900' },
    sumLabel: { color: t.sub, marginTop: 2 },
  });
