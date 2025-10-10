// app/ProfileViewScreen.tsx
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Edit,
  Image as ImgIcon,
  Mail,
  Phone,
  Plus,
  Star,
  Tag,
  Trash2,
  X
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Service = {
  id: string;
  name: string;
  category: string;
  hourlyPrice: string;
  description: string;
  location: string;
  hours: string;
  tags: string[];
  photo?: string;
};

type Profile = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  verified?: boolean;
  rating?: number;
  reviews?: number;
  services: Service[];
};

export default function ProfileViewScreen({
  profile = {
    name: 'Carlos Mendoza',
    email: 'c.mendoza@email.com',
    phone: '+1 234 567 8900',
    avatar: '',
    verified: true,
    rating: 4.8,
    reviews: 127,
    services: [
      {
        id: 's1',
        name: 'Plomería general',
        category: 'Plomería',
        hourlyPrice: '$50-80/h',
        description: 'Servicio profesional de plomería residencial y comercial.',
        location: 'Cobertura en toda la ciudad',
        hours: 'Lun–Dom: 24h',
        tags: ['emergencias', 'reparación'],
        photo:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop'
      },
      {
        id: 's2',
        name: 'Destape de tuberías',
        category: 'Plomería',
        hourlyPrice: '$60-90/h',
        description: 'Destape y limpieza de tuberías con equipo especializado.',
        location: 'Zona norte y centro',
        hours: 'Lun–Sáb: 8am–8pm',
        tags: ['destape', 'urgente']
      }
    ]
  },
  onBack,
  onEdit
}: {
  profile?: Profile;
  onBack?: () => void;
  onEdit?: () => void;
}) {
  const router = useRouter();

  // ----------------- STATE -----------------
  const [services, setServices] = useState<Service[]>(profile.services ?? []);

  // Create/Edit modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draft, setDraft] = useState<Service>({
    id: '',
    name: '',
    category: '',
    hourlyPrice: '',
    description: '',
    location: '',
    hours: '',
    tags: [],
    photo: undefined
  });
  const [tagInput, setTagInput] = useState('');

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ----------------- NAV -----------------
  const handleBack = () => (onBack ? onBack() : router.back());
  const handleEditProfile = () =>
    router.push('/(tabs)/profile-stack/edit-profile');

  // ----------------- CREATE / EDIT -----------------
  const openCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setDraft({
      id: '',
      name: '',
      category: '',
      hourlyPrice: '',
      description: '',
      location: '',
      hours: '',
      tags: [],
      photo: undefined
    });
    setTagInput('');
    setModalVisible(true);
  };

  const openEdit = (svc: Service) => {
    setIsEditing(true);
    setEditingId(svc.id);
    setDraft({ ...svc });
    setTagInput('');
    setModalVisible(true);
  };

  const pickServicePhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9
    });
    if (!res.canceled && res.assets?.length) {
      setDraft(prev => ({ ...prev, photo: res.assets[0].uri }));
    }
  };

  const canSave = useMemo(() => {
    const { name, category, hourlyPrice, description, location, hours } =
      draft;
    return (
      name.trim() &&
      category.trim() &&
      hourlyPrice.trim() &&
      description.trim() &&
      location.trim() &&
      hours.trim()
    );
  }, [draft]);

  const saveService = () => {
    if (!canSave) return;
    if (isEditing && editingId) {
      // Update existing
      setServices(prev =>
        prev.map(s => (s.id === editingId ? { ...draft, id: editingId } : s))
      );
    } else {
      // Create new
      const newService: Service = { ...draft, id: `svc_${Date.now()}` };
      setServices(prev => [newService, ...prev]);
    }
    setModalVisible(false);
  };

  // ----------------- TAGS -----------------
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!draft.tags.includes(t))
      setDraft(prev => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput('');
  };
  const removeTag = (t: string) =>
    setDraft(prev => ({ ...prev, tags: prev.tags.filter(x => x !== t) }));

  // ----------------- DELETE -----------------
  const confirmDelete = (id: string) => setDeleteId(id);
  const doDelete = () => {
    if (!deleteId) return;
    setServices(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
  };

  // ----------------- UI -----------------
  const handleServiceClick = (_svc: Service) => {
    router.push('/ServiceProviderScreen');
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
          <ArrowLeft size={18} color="#e5e7eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {/* Perfil */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatarWrap}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>
                    {profile.name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{profile.name}</Text>
              {(profile.rating || profile.reviews) && (
                <View style={[styles.row, { marginTop: 6 }]}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.ratingText}>
                    {profile.rating?.toFixed(1)}{' '}
                    <Text style={styles.grayText}>({profile.reviews})</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ marginTop: 14, gap: 10 }}>
            <View style={styles.kv}>
              <Phone size={16} color="#e5e7eb" />
              <Text style={styles.kvValue}>{profile.phone}</Text>
            </View>
            <View style={styles.kv}>
              <Mail size={16} color="#e5e7eb" />
              <Text style={styles.kvValue}>{profile.email}</Text>
            </View>
          </View>
        </View>

        {/* Servicios */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Servicios que ofrece</Text>
            <TouchableOpacity onPress={openCreate} style={styles.addBtn}>
              <Plus size={14} color="#111827" />
              <Text style={styles.addBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {services.length === 0 ? (
            <Text style={[styles.grayText, { marginTop: 4 }]}>
              Aún no has agregado servicios. Toca “Agregar”.
            </Text>
          ) : (
            <View style={{ gap: 10 }}>
              {services.map(svc => (
                <View key={svc.id} style={styles.serviceItem}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', flex: 1 }}
                    onPress={() => handleServiceClick(svc)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.serviceThumb}>
                      {svc.photo ? (
                        <Image
                          source={{ uri: svc.photo }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      ) : (
                        <View style={styles.serviceThumbFallback}>
                          <ImgIcon size={16} color="#9ca3af" />
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.serviceName}>{svc.name}</Text>
                      <Text style={styles.serviceMeta}>
                        {svc.category} • {svc.hourlyPrice}
                      </Text>
                      <Text numberOfLines={2} style={styles.serviceDesc}>
                        {svc.description}
                      </Text>

                      {svc.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                          {svc.tags.slice(0, 3).map(t => (
                            <View key={`${svc.id}-${t}`} style={styles.tagChipSm}>
                              <Tag size={10} color="#9ca3af" />
                              <Text style={styles.tagChipSmText}>{t}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Acciones editar / eliminar */}
                  <View style={styles.actionCol}>
                    <TouchableOpacity
                      onPress={() => openEdit(svc)}
                      style={[styles.smallActionBtn, { backgroundColor: '#fbbf24' }]}
                    >
                      <Edit size={14} color="#111827" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => confirmDelete(svc.id)}
                      style={[styles.smallActionBtn, { backgroundColor: '#ef4444' }]}
                    >
                      <Trash2 size={14} color="#111827" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Editar perfil */}
        <TouchableOpacity
          style={styles.editBigBtn}
          onPress={onEdit ?? handleEditProfile}
        >
          <Edit size={16} color="#111827" />
          <Text style={styles.editBigBtnText}> Editar perfil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL: Crear/Editar servicio */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Editar servicio' : 'Agregar servicio'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={16} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            {/* Foto */}
            <TouchableOpacity
              style={styles.photoPicker}
              onPress={pickServicePhoto}
            >
              {draft.photo ? (
                <Image source={{ uri: draft.photo }} style={styles.photoPreview} />
              ) : (
                <>
                  <ImgIcon size={18} color="#cbd5e1" />
                  <Text style={styles.photoPickerText}>
                    Añadir foto del servicio
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Campos */}
            <TextInput
              style={styles.input}
              placeholder="Nombre del servicio"
              placeholderTextColor="#94a3b8"
              value={draft.name}
              onChangeText={v => setDraft(p => ({ ...p, name: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Categoría (p. ej. Plomería)"
              placeholderTextColor="#94a3b8"
              value={draft.category}
              onChangeText={v => setDraft(p => ({ ...p, category: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio por hora (ej. $50-80/h)"
              placeholderTextColor="#94a3b8"
              value={draft.hourlyPrice}
              onChangeText={v => setDraft(p => ({ ...p, hourlyPrice: v }))}
            />
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Descripción breve"
              placeholderTextColor="#94a3b8"
              multiline
              value={draft.description}
              onChangeText={v => setDraft(p => ({ ...p, description: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Ubicación / Cobertura"
              placeholderTextColor="#94a3b8"
              value={draft.location}
              onChangeText={v => setDraft(p => ({ ...p, location: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Horario (ej. Lun–Dom: 24h)"
              placeholderTextColor="#94a3b8"
              value={draft.hours}
              onChangeText={v => setDraft(p => ({ ...p, hours: v }))}
            />

            {/* Tags */}
            <View style={{ gap: 8 }}>
              <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Etiquetas</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, height: 42, marginBottom: 0 }]}
                  placeholder="Añadir etiqueta (ej. emergencias)"
                  placeholderTextColor="#94a3b8"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.tagAddBtn} onPress={addTag}>
                  <Plus size={14} color="#111827" />
                </TouchableOpacity>
              </View>

              {draft.tags.length > 0 && (
                <View style={styles.tagsWrap}>
                  {draft.tags.map(t => (
                    <View key={t} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>#{t}</Text>
                      <TouchableOpacity onPress={() => removeTag(t)}>
                        <X size={12} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, !canSave && { opacity: 0.6 }]}
              onPress={saveService}
              disabled={!canSave}
            >
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Guardar cambios' : 'Guardar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: Confirmar eliminación */}
      <Modal
        visible={!!deleteId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { width: '86%' }]}>
            <Text style={styles.modalTitle}>Eliminar servicio</Text>
            <Text style={{ color: '#cbd5e1', marginTop: 6 }}>
              Esta acción no se puede deshacer. ¿Deseas continuar?
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#ef4444', flex: 1 }]}
                onPress={doDelete}
              >
                <Text style={[styles.saveBtnText, { color: '#111827' }]}>
                  Eliminar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelBtn, { flex: 1 }]}
                onPress={() => setDeleteId(null)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🎨 Estilos
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0b0b' },

  header: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#0f0f10',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(251,191,36,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: { color: '#e5e7eb', fontWeight: '700', fontSize: 16 },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: '#111113'
  },

  card: {
    backgroundColor: '#0f0f10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)'
  },

  row: { flexDirection: 'row', alignItems: 'center' },

  avatarWrap: { width: 64, height: 64, borderRadius: 999, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: {
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarFallbackText: { color: '#e5e7eb', fontWeight: '700', fontSize: 18 },

  name: { color: '#e5e7eb', fontWeight: '800', fontSize: 18 },

  ratingText: { color: '#e5e7eb', marginLeft: 6, fontWeight: '600', fontSize: 12 },
  grayText: { color: '#9ca3af' },

  kv: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111113',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  kvValue: { color: '#e5e7eb', fontWeight: '600' },

  // Servicios list
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  sectionTitle: { color: '#e5e7eb', fontWeight: '700', marginBottom: 0 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  addBtnText: { color: '#111827', fontWeight: '800', fontSize: 12 },

  serviceItem: {
    flexDirection: 'row',
    backgroundColor: '#111113',
    borderRadius: 12,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.2)'
  },
  actionCol: { justifyContent: 'space-between', marginLeft: 8 },
  smallActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },

  serviceThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0f0f10',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)'
  },
  serviceThumbFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  serviceName: { color: '#e5e7eb', fontWeight: '800' },
  serviceMeta: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  serviceDesc: { color: '#cbd5e1', fontSize: 12, marginTop: 2 },
  tagsRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  tagChipSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f0f10',
    borderColor: 'rgba(148,163,184,0.25)',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999
  },
  tagChipSmText: { color: '#9ca3af', fontSize: 11, fontWeight: '700' },

  // CTA editar
  editBigBtn: {
    marginTop: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  editBigBtnText: { color: '#111827', fontWeight: '800' },

  // Modal base
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  modalCard: {
    width: '92%',
    backgroundColor: '#1b1b1b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 10
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)'
  },

  photoPicker: {
    height: 140,
    borderRadius: 12,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  photoPickerText: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  photoPreview: { width: '100%', height: '100%', borderRadius: 12 },

  input: {
    width: '100%',
    height: 46,
    borderColor: '#333',
    borderWidth: 1,
    color: '#fff',
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 14,
    backgroundColor: '#121212'
  },

  tagInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  tagAddBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f0f10',
    borderColor: 'rgba(148,163,184,0.25)',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  tagChipText: { color: '#e5e7eb', fontSize: 12, fontWeight: '700' },

  saveBtn: {
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnText: { color: '#111827', fontWeight: '900' },

  cancelBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  cancelBtnText: { color: '#e5e7eb', fontWeight: '700' }
});
