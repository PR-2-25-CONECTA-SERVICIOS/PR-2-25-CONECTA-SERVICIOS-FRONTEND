// app/pages/RatingScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/button'; // Usa tu botón. Si no lo tienes, activa el fallback de abajo.

// Fallback opcional si NO tienes tu Button propio:
// const Button = ({ onPress, children, style }: { onPress?: () => void; children: React.ReactNode; style?: any }) => (
//   <TouchableOpacity onPress={onPress} style={[{ paddingVertical: 14, borderRadius: 10, alignItems: 'center' }, style]}>
//     <Text style={{ fontWeight: 'bold' }}>{children}</Text>
//   </TouchableOpacity>
// );

const THEME = {
  bg: '#111111',
  card: '#1B1B1B',
  border: '#2a2a2a',
  text: '#EAEAEA',
  subtext: '#A3A3A3',
  yellow: '#FFEB3B',
  chipOn: '#FFEB3B',
  chipOff: '#3A3A3A',
  danger: '#EF4444',
};

const mockService = {
  id: 1,
  name: 'Plomería Express',
  provider: 'Carlos Mendoza',
  category: 'Plomería',
  date: '27 enero, 2025',
  time: '14:30',
  price: '$75',
  description: 'Reparación de tubería en cocina',
  image:
    'https://images.unsplash.com/photo-1604118600242-e7a6d23ec3a9?q=80&w=1080&auto=format&fit=crop',
  providerInitials: 'CM',
};

const ratingOptions = [
  { value: 5, label: 'Excelente', description: 'Superó mis expectativas' },
  { value: 4, label: 'Muy bueno', description: 'Mejor de lo esperado' },
  { value: 3, label: 'Bueno', description: 'Como lo esperaba' },
  { value: 2, label: 'Regular', description: 'Por debajo de lo esperado' },
  { value: 1, label: 'Malo', description: 'Muy por debajo de lo esperado' },
];

const quickComments = [
  'Muy puntual',
  'Excelente calidad',
  'Precio justo',
  'Muy profesional',
  'Trabajo limpio',
  'Amable y cordial',
  'Rápido y eficiente',
  'Bien explicado',
];

export default function RatingScreen({ onNext }: { onNext: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedQuickComments, setSelectedQuickComments] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleQuickCommentToggle = (label: string) => {
    setSelectedQuickComments(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label],
    );
  };

  const handleAddPhoto = () => {
    // Simulación: agrega una mini-foto desde la web.
    const demo =
      'https://images.unsplash.com/photo-1604118600242-e7a6d23ec3a9?q=80&w=400&auto=format&fit=crop';
    setPhotos(p => (p.length < 3 ? [...p, demo] : p));
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(p => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    // payload listo para enviar
    const payload = {
      serviceId: mockService.id,
      rating,
      comment,
      quickComments: selectedQuickComments,
      photos,
    };
    console.log('Enviar calificación:', payload);
    onNext?.();
  };

  const selectedLabel = ratingOptions.find(r => r.value === rating)?.label ?? '';
  const selectedDesc = ratingOptions.find(r => r.value === rating)?.description ?? '';

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNext} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={20} color={THEME.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Calificar Servicio</Text>
          <Text style={styles.headerSub}>Comparte tu experiencia</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Service Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Image source={{ uri: mockService.image }} style={styles.serviceImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{mockService.name}</Text>
              <Text style={styles.cardSub}>{mockService.description}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.muted}>
                  {mockService.date} • {mockService.time}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{mockService.price}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.avatar}>
              <Text style={{ color: '#000', fontWeight: '700' }}>{mockService.providerInitials}</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>{mockService.provider}</Text>
              <Text style={styles.cardSub}>{mockService.category}</Text>
            </View>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.card}>
          <Text style={styles.blockTitle}>¿Cómo calificarías este servicio?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(v => (
              <TouchableOpacity key={v} onPress={() => setRating(v)} activeOpacity={0.8}>
                <Ionicons
                  name={v <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={v <= rating ? THEME.yellow : '#666'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {!!rating && (
            <View style={{ alignItems: 'center', marginTop: 6 }}>
              <Text style={styles.cardTitle}>{selectedLabel}</Text>
              <Text style={styles.cardSub}>{selectedDesc}</Text>
            </View>
          )}
        </View>

        {/* Quick Comments */}
        {!!rating && (
          <View style={styles.card}>
            <Text style={styles.blockTitle}>Comentarios rápidos (opcional)</Text>
            <View style={styles.chipsWrap}>
              {quickComments.map(label => {
                const on = selectedQuickComments.includes(label);
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => handleQuickCommentToggle(label)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, on ? styles.chipTextOn : styles.chipTextOff]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Text Comment */}
        {!!rating && (
          <View style={styles.card}>
            <Text style={styles.blockTitle}>Cuéntanos más (opcional)</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Comparte más detalles sobre tu experiencia..."
              placeholderTextColor="#8A8A8A"
              style={styles.textarea}
              multiline
              numberOfLines={5}
            />
          </View>
        )}

        {/* Photos */}
        {!!rating && (
          <View style={styles.card}>
            <Text style={styles.blockTitle}>Fotos del resultado (opcional)</Text>

            <View style={styles.photosGrid}>
              {photos.map((uri, idx) => (
                <View key={idx} style={styles.photoBox}>
                  <Image source={{ uri }} style={styles.photoImg} />
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(idx)}
                    style={styles.photoRemove}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {photos.length < 3 && (
                <TouchableOpacity onPress={handleAddPhoto} style={styles.photoAdd} activeOpacity={0.8}>
                  <Ionicons name="camera" size={20} color={THEME.yellow} />
                  <Text style={{ color: THEME.subtext, fontSize: 12, marginTop: 6 }}>Agregar foto</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Submit */}
        <View style={{ paddingBottom: 16 }}>
          <Button
            onPress={handleSubmit}
            style={[
              styles.cta,
              { backgroundColor: rating === 0 ? '#5E5E5E' : THEME.yellow },
            ]}
          >
            <Text style={{ color: rating === 0 ? '#2B2B2B' : '#000', fontWeight: '700' }}>
              {rating === 0 ? 'Selecciona una calificación' : 'Enviar Calificación'}
            </Text>
          </Button>

          {!!rating && (
            <Text style={styles.helper}>
              Tu calificación ayuda a otros usuarios a tomar mejores decisiones
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2d2d2d',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerBack: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    color: THEME.text,
    fontWeight: '700',
    fontSize: 16,
  },
  headerSub: {
    color: THEME.subtext,
    fontSize: 12,
  },
  content: {
    padding: 14,
    gap: 14,
  },
  card: {
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    padding: 14,
  },
  serviceImg: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  cardTitle: {
    color: THEME.text,
    fontWeight: '600',
  },
  cardSub: {
    color: THEME.subtext,
    fontSize: 13,
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  badge: {
    backgroundColor: THEME.yellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.yellow,
  },
  blockTitle: {
    color: THEME.text,
    fontWeight: '600',
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipOn: {
    backgroundColor: THEME.chipOn,
  },
  chipOff: {
    backgroundColor: THEME.chipOff,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextOn: {
    color: '#000',
  },
  chipTextOff: {
    color: THEME.text,
  },
  textarea: {
    backgroundColor: '#242424',
    borderWidth: 1,
    borderColor: THEME.border,
    color: THEME.text,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 110,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoBox: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 6,
    borderRadius: 999,
  },
  photoAdd: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6e6e6e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
  },
  helper: {
    color: THEME.subtext,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  muted: {
  color: '#A3A3A3',   // mismo tono que usas en subtext
  fontSize: 12,
},

});
