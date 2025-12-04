// app/ProfileViewScreen.tsx
import * as ImagePicker from "expo-image-picker";
import { useRootNavigationState, useRouter } from "expo-router";

import { useFocusEffect } from "@react-navigation/native";
import { ArrowLeft, X } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";

// 🔥 TU BACKEND REAL
const API_URL =
  "https://pr-2-25-conecta-servicios-backend.onrender.com/api/usuarios/";

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

type LocalItem = {
  id: string;
  name: string;
  address: string;
  verified: boolean;
  thumb?: string;
  photos?: string[];
  specialTags?: string[];
  url?: string;
  amenities?: string[];
  claims?: any[]; // 🔥 nuevo
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
  locals?: LocalItem[];
};

export default function ProfileViewScreenContent() {
  const router = useRouter();
  const { user, logout } = useAuth();


  const rootState = useRootNavigationState();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [locals, setLocals] = useState<LocalItem[]>([]);
  const [loading, setLoading] = useState(true);
  type DropdownOption = {
    label: string;
    value: string;
  };
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<"service" | "local" | null>(
    null
  );
  const [hours, setHours] = useState({
    lunes: { open: "", close: "" },
    martes: { open: "", close: "" },
    miercoles: { open: "", close: "" },
    jueves: { open: "", close: "" },
    viernes: { open: "", close: "" },
    sabado: { open: "", close: "" },
    domingo: { open: "", close: "" },
  });

  type DropdownProps = {
    value: string;
    onChange: (value: string) => void;
    options: DropdownOption[];
    placeholder?: string;
  };

  const Dropdown: React.FC<DropdownProps> = ({
    value,
    onChange,
    options,
    placeholder = "Selecciona una categoría",
  }) => {
    const [open, setOpen] = useState(false);

    return (
      <View style={{ marginBottom: 10 }}>
        {/* LABEL */}
        <Text style={{ color: "#aaa", marginBottom: 4 }}>Categoría</Text>

        {/* BOTÓN */}
        <TouchableOpacity
          onPress={() => setOpen(!open)}
          style={{
            backgroundColor: "#222",
            borderWidth: 1,
            borderColor: "#333",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: value ? "#fff" : "#666" }}>
            {value || placeholder}
          </Text>

          <Text style={{ color: "#fbbf24" }}>▼</Text>
        </TouchableOpacity>

        {/* LISTA */}
        {open && (
          <View
            style={{
              backgroundColor: "#181818",
              marginTop: 5,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#333",
              overflow: "hidden",
            }}
          >
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#222",
                }}
              >
                <Text style={{ color: "#fff" }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  /* ============================================
       CARGAR PERFIL DESDE BACKEND
  ============================================ */
  const loadCategories = async () => {
    try {
      const res = await fetch(
        "https://pr-2-25-conecta-servicios-backend.onrender.com/api/categorias"
      );
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.log("❌ Error cargando categorías:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!user || !user._id) {
        router.replace("/(tabs)/Login/LoginScreen");
        return;
      }

      let active = true;
      setLoading(true);

      loadCategories();

      const loadProfile = async () => {
        try {
          const res = await fetch(API_URL + user._id);
          const raw = await res.text();
          const data = JSON.parse(raw);

          if (!active) return;

          setProfile({
            name: data.nombre,
            email: data.correo,
            phone: data.telefono,
            avatar: data.avatar,
            verified: data.verificado,
            rating: data.calificacion,
            reviews: data.reseñas,
            services: [],
            locals: [],
          });

          const parsedServices = (data.servicios || []).map((srv: any) => ({
            id: srv._id,
            name: srv.nombre,
            category: srv.categoria,
            hourlyPrice: srv.precio,
            description: srv.descripcion,
            location: srv.direccion,
            hours: srv.horas,
            tags: srv.especialidades,
            photo: srv.imagen,
          }));

          setServices(parsedServices);

          const parsedLocals = (data.locales || []).map((loc: any) => ({
            id: loc._id,
            name: loc.nombre,
            address: loc.direccion,
            verified: loc.verificado,
            thumb: loc.thumb || loc.imagen || loc.fotoPrincipal,
            photos: loc.fotos || [],
            specialTags: loc.tagsEspeciales || [],
            url: loc.url || "",
            amenities: loc.servicios || [],
            claims: loc.reclamos || [],
          }));

          setLocals(parsedLocals);
        } catch (err) {
          console.log("❌ Error cargando perfil:", err);
        } finally {
          if (active) setLoading(false);
        }
      };

      loadProfile();

      return () => {
        active = false;
      };
    }, [user?._id])
  );

  /* ============================================
       LOGOUT
  ============================================ */
  const handleLogout = async () => {
    await logout();
  };

  /* ============================================
       MODAL SERVICIOS
  ============================================ */
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draft, setDraft] = useState<Service>({
    id: "",
    name: "",
    category: "",
    hourlyPrice: "",
    description: "",
    location: "",
    hours: "",
    tags: [],
    photo: undefined,
  });

  const [tagInput, setTagInput] = useState("");

  const openCreate = () => {
    setDraft({
      id: "",
      name: "",
      category: "",
      hourlyPrice: "",
      description: "",
      location: "",
      hours: "",
      tags: [],
      photo: undefined,
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEdit = (svc: Service) => {
    setDraft(svc);
    setEditingId(svc.id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const canSave = useMemo(() => {
    return (
      draft.name.trim() &&
      draft.category.trim() &&
      draft.hourlyPrice.trim() &&
      draft.description.trim() &&
      draft.location.trim() &&
      draft.hours.trim()
    );
  }, [draft]);

  const saveService = async () => {
    if (!canSave) return;

    try {
      if (!user || !user._id) {
        alert("Sesión no válida, vuelve a iniciar sesión.");
        return;
      }

      const userId = user._id;

      // 👇 Lo que tu backend espera según tu schema de Service
      const payload = {
        nombre: draft.name,
        categoria: draft.category,
        precio: draft.hourlyPrice, // field correcto en el back
        descripcion: draft.description,
        direccion: draft.location, // en el schema es "direccion"
        horas: draft.hours,
        especialidades: draft.tags, // en el schema es "especialidades"
        imagen: draft.photo?.startsWith("file://") ? "" : draft.photo || "",
      };

      let url = "";
      let method: "POST" | "PUT" = "POST";

      if (isEditing && editingId) {
        // 🟡 actualizar
        url = `${API_URL}${userId}/servicios/${editingId}`;
        method = "PUT";
      } else {
        // 🟢 crear
        url = `${API_URL}${userId}/servicios`;
        method = "POST";
      }

      console.log("🔥 ENVIANDO A:", url, payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("📥 RESPUESTA SERVICIO:", res.status, raw);

      if (!res.ok) {
        throw new Error("Error backend " + res.status);
      }

      const data = JSON.parse(raw);

      // addUserService responde: { mensaje, servicio: nuevoServicio }
      const srv = data.servicio || data;

      const adapted: Service = {
        id: srv._id,
        name: srv.nombre,
        category: srv.categoria,
        hourlyPrice: srv.precio, // 👈 aquí también viene de "precio"
        description: srv.descripcion,
        location: srv.direccion || "",
        hours: srv.horas || "",
        tags: srv.especialidades || [],
        photo: srv.imagen,
      };

      if (isEditing && editingId) {
        // actualizar en UI
        setServices((prev) =>
          prev.map((s) => (s.id === editingId ? adapted : s))
        );
      } else {
        // agregar en UI
        setServices((prev) => [adapted, ...prev]);
      }

      setModalVisible(false);
    } catch (err) {
      console.log("❌ Error guardando servicio:", err);
      alert("Error al guardar el servicio.");
    }
  };
  const openDeleteModal = (type: "service" | "local", item: any) => {
    setDeleteType(type);
    setDeleteTarget(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteType) return;

    try {
      if (deleteType === "service") {
        // DELETE servicio
        await fetch(`${API_URL}${user._id}/servicios/${deleteTarget.id}`, {
          method: "DELETE",
        });

        // Actualizar UI
        setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      }

      if (deleteType === "local") {
        // DELETE local
        await fetch(
          `https://pr-2-25-conecta-servicios-backend.onrender.com/api/locales/${deleteTarget.id}`,
          {
            method: "DELETE",
          }
        );

        // Actualizar UI
        setLocals((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      }
    } catch (err) {
      console.log("❌ Error eliminando:", err);
    }

    setDeleteModalOpen(false);
  };

  const pickServicePhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // 👈 Nueva API correcta
      allowsEditing: true,
      quality: 0.8,
    });

    if (res.canceled) return;

    const asset = res.assets[0];

    const localUri = asset.uri;
    const mimeType = asset.mimeType ?? "image/jpeg";

    console.log("🔥 URI FINAL:", localUri);
    console.log("🔥 MIME:", mimeType);

    const cloudUrl = await uploadToCloudinary(localUri, mimeType);

    if (!cloudUrl) {
      alert("Error subiendo foto a Cloudinary");
      return;
    }

    setDraft((prev) => ({ ...prev, photo: cloudUrl }));
  };

  const uploadToCloudinary = async (uri: string, mimeType: string) => {
    try {
      const data = new FormData();

      data.append("file", {
        uri: uri,
        name: "photo.jpg",
        type: mimeType || "image/jpeg",
      } as any);

      data.append("upload_preset", "imagescloudexp");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/deqxfxbaa/image/upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: data,
        }
      );

      const json = await res.json();
      console.log("🔥 Cloudinary:", json);

      return json.secure_url || null;
    } catch (err) {
      console.log("❌ CLOUD ERROR:", err);
      return null;
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!draft.tags.includes(t)) {
      setDraft((p) => ({ ...p, tags: [...p.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setDraft((p) => ({
      ...p,
      tags: p.tags.filter((x) => x !== t),
    }));
  };

  /* ============================================
       MODAL LOCAL
  ============================================ */
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const [activeLocal, setActiveLocal] = useState<LocalItem | null>(null);

  const [localUrl, setLocalUrl] = useState("");
  const [localPhotos, setLocalPhotos] = useState<string[]>([]);
  const [localAmenities, setLocalAmenities] = useState<string[]>([]);
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [localAmenityInput, setLocalAmenityInput] = useState("");
  const [localTagInput, setLocalTagInput] = useState("");
  const [categories, setCategories] = useState<
    { _id: string; nombre: string }[]
  >([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const openLocalModal = (loc: LocalItem) => {
    setActiveLocal(loc);
    setLocalUrl(loc.url || "");
    setLocalPhotos(loc.photos || []);
    setLocalAmenities(loc.amenities || []);
    setLocalTags(loc.specialTags || []);
    setLocalModalOpen(true);
  };
  const saveLocalCompletion = async () => {
    if (!activeLocal) return;

    try {
      const res = await fetch(
        `https://pr-2-25-conecta-servicios-backend.onrender.com/api/locales/${activeLocal.id}/completar`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: localUrl.trim(),
            photos: localPhotos,
            amenities: localAmenities,
            tags: localTags,
          }),
        }
      );

      let json = null;
      try {
        json = await res.json();
      } catch {
        console.log("⚠️ Backend devolvió algo que NO es JSON");
      }

      console.log("🔥 Local actualizado:", json);

      // 🔄 actualizar UI sin recargar app
      setLocals((prev) =>
        prev.map((l) =>
          l.id === activeLocal.id
            ? {
                ...l,
                url: localUrl.trim(),
                photos: localPhotos,
                amenities: localAmenities,
                specialTags: localTags,
                verified: true, // 🔥 si su reclamo fue aprobado
              }
            : l
        )
      );

      setLocalModalOpen(false);
    } catch (err) {
      console.log("❌ Error guardando local:", err);
      alert("Error al guardar los datos.");
    }
  };

  const addLocalPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (res.canceled) return;

    const asset = res.assets[0];
    const localUri = asset.uri;
    const mimeType = asset.mimeType ?? "image/jpeg";

    console.log("🔥 URI:", localUri);
    console.log("🔥 MIME:", mimeType);

    const cloudUrl = await uploadToCloudinary(localUri, mimeType);

    if (!cloudUrl) {
      alert("Error subiendo la imagen a Cloudinary");
      return;
    }

    // Guardar en tu estado
    setLocalPhotos((prev) => [cloudUrl, ...prev]);
  };

  console.log("🔄 ProfileViewScreen render, user:", user?._id);

  /* ============================================
       LOADING
  ============================================ */
  if (loading || !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Cargando perfil...</Text>
      </View>
    );
  }

  /* ============================================
       UI PRINCIPAL
  ============================================ */
  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Perfil</Text>

        <View style={{ width: 34 }} />
        {/* Align center */}
      </View>

      <ScrollView contentContainerStyle={{ padding: 14 }}>
        {/* PERFIL */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            {/* IZQUIERDA: INFO DE PERFIL */}
            <View style={styles.row}>
              <View style={styles.avatarWrap}>
                {profile.avatar ? (
                  <Image
                    source={{ uri: profile.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>
                      {profile.name[0]}
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ marginLeft: 10 }}>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.grayText}>{profile.email}</Text>
                <Text style={styles.grayText}>{profile.phone}</Text>

                <Text style={styles.ratingText}>
                  ⭐ {profile.rating} ({profile.reviews})
                </Text>
              </View>
            </View>

            {/* DERECHA: BOTÓN EDITAR PERFIL */}
            <TouchableOpacity
              style={styles.smallEditBtn}
              onPress={() => router.push("/EditProfileScreen")}
            >
              <Text style={styles.smallEditBtnText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SERVICIOS */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Servicios que ofrece</Text>

            <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
              <Text style={styles.addBtnText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>
          {services.map((svc) => (
            <TouchableOpacity
              key={svc.id}
              style={styles.serviceItem}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/ServiceProviderScreen",
                  params: { id: svc.id },
                })
              }
            >
              {/* Thumbnail */}
              <View style={styles.serviceThumb}>
                {svc.photo ? (
                  <Image
                    source={{ uri: svc.photo }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <View style={styles.serviceThumbFallback}>
                    <Text style={{ color: "#666" }}>Sin foto</Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={styles.actionCol}>
                <Text style={styles.serviceName}>{svc.name}</Text>
                <Text style={styles.serviceMeta}>
                  {svc.category} • {svc.hourlyPrice}
                </Text>
                <Text style={styles.serviceDesc}>{svc.description}</Text>

                <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
                  <TouchableOpacity onPress={() => openEdit(svc)}>
                    <Text style={{ color: "#fbbf24" }}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openDeleteModal("service", svc)}
                  >
                    <Text style={{ color: "#e63946", fontWeight: "700" }}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* LOCALES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Locales registrados</Text>

          {locals.length === 0 && (
            <Text style={{ color: "#777", marginTop: 10 }}>
              No tienes locales registrados.
            </Text>
          )}

          {locals.map((l) => (
            <View key={l.id} style={styles.localItem}>
              <TouchableOpacity
                style={{ flexDirection: "row", flex: 1 }}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/BusinessScreen",
                    params: { id: l.id },
                  })
                }
              >
                <View style={styles.localThumbWrap}>
                  {l.thumb ? (
                    <Image
                      source={{ uri: l.thumb }}
                      style={styles.localThumb}
                    />
                  ) : (
                    <View style={styles.localThumbFallback}>
                      <Text style={{ color: "#999" }}>No foto</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.localName}>{l.name}</Text>
                  <Text style={styles.localAddress}>{l.address}</Text>
                  <Text style={styles.localStatus}>
                    {l.verified ? "Verificado" : "No verificado"}
                  </Text>
                  {/* BOTÓN COMPLETAR REGISTRO */}
                  {l.verified && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#fbbf24",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        marginRight: 10,
                      }}
                      onPress={() => openLocalModal(l)}
                    >
                      <Text style={{ color: "#111", fontWeight: "900" }}>
                        Completar registro
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>

              {/* Botón eliminar */}
              <TouchableOpacity onPress={() => openDeleteModal("local", l)}>
                <Text
                  style={{ color: "#e63946", fontWeight: "900", fontSize: 16 }}
                >
                  🗑
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        {/* BOTÓN CERRAR SESIÓN */}
        <View
          style={{
            marginTop: 14,
            marginHorizontal: 80,
            backgroundColor: "#111",
          }}
        >
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#e63946",
              paddingVertical: 14,

              borderRadius: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <Text
              style={{ color: "#ffffffff", fontWeight: "800", fontSize: 16 }}
            >
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================================
            MODAL: CREAR / EDITAR SERVICIO
      ================================= */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Editar servicio" : "Agregar servicio"}
              </Text>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* FOTO DEL SERVICIO */}
            <TouchableOpacity
              style={styles.photoPicker}
              onPress={pickServicePhoto}
            >
              {draft.photo ? (
                <Image
                  source={{ uri: draft.photo }}
                  style={styles.photoPreview}
                />
              ) : (
                <>
                  <Text style={styles.photoPickerText}>Añadir foto</Text>
                </>
              )}
            </TouchableOpacity>

            {/* CAMPOS */}
            <TextInput
              placeholder="Nombre"
              placeholderTextColor="#666"
              style={styles.input}
              value={draft.name}
              onChangeText={(v) => setDraft((p) => ({ ...p, name: v }))}
            />

            {categoriesLoading ? (
              <Text style={{ color: "#666" }}>Cargando...</Text>
            ) : (
              <Dropdown
                value={draft.category}
                onChange={(v) => setDraft((p) => ({ ...p, category: v }))}
                options={categories.map((c) => ({
                  label: c.nombre,
                  value: c.nombre,
                }))}
              />
            )}

            <View style={styles.priceRow}>
              <TextInput
                placeholder="Precio por hora"
                placeholderTextColor="#666"
                style={styles.priceInput}
                keyboardType="numeric"
                value={draft.hourlyPrice}
                onChangeText={(v) =>
                  setDraft((p) => ({ ...p, hourlyPrice: v }))
                }
              />

              <View style={styles.priceSuffix}>
                <Text style={{ color: "#fff", fontWeight: "800" }}>Bs</Text>
              </View>
            </View>

            <TextInput
              placeholder="Descripción"
              placeholderTextColor="#666"
              style={styles.input}
              value={draft.description}
              onChangeText={(v) => setDraft((p) => ({ ...p, description: v }))}
            />

            <TextInput
              placeholder="Ubicación"
              placeholderTextColor="#666"
              style={styles.input}
              value={draft.location}
              onChangeText={(v) => setDraft((p) => ({ ...p, location: v }))}
            />

            <TextInput
              placeholder="Horario"
              placeholderTextColor="#666"
              style={styles.input}
              value={draft.hours}
              onChangeText={(v) => setDraft((p) => ({ ...p, hours: v }))}
            />

            {/* TAGS */}
            <View style={styles.tagInputRow}>
              <TextInput
                placeholder="Agregar tag"
                placeholderTextColor="#666"
                style={[styles.input, { flex: 1 }]}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
              />

              <TouchableOpacity style={styles.tagAddBtn} onPress={addTag}>
                <Text style={{ fontWeight: "900" }}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagsWrap}>
              {draft.tags.map((t) => (
                <View key={t} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{t}</Text>
                  <TouchableOpacity onPress={() => removeTag(t)}>
                    <X size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* BOTÓN GUARDAR */}
            <TouchableOpacity
              style={[styles.saveBtn, { opacity: canSave ? 1 : 0.4 }]}
              disabled={!canSave}
              onPress={saveService}
            >
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>

            {/* CANCELAR */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================================
            MODAL: COMPLETAR LOCAL
      ================================= */}
      <Modal visible={localModalOpen} transparent animationType="fade">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              {/* HEADER */}
              <View style={styles.modalHeaderPro}>
                <Text style={styles.modalTitlePro}>
                  Completar registro del local
                </Text>
                <TouchableOpacity onPress={() => setLocalModalOpen(false)}>
                  <X size={22} color="#fbbf24" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* URL */}
                <Text style={styles.modalLabel}>
                  Página web o link del local
                </Text>
                <TextInput
                  placeholder="https://"
                  placeholderTextColor="#777"
                  value={localUrl}
                  onChangeText={setLocalUrl}
                  style={styles.modalInputPro}
                />

                {/* FOTOS DEL LOCAL */}
                <Text style={styles.modalLabel}>Fotos del local</Text>
                <TouchableOpacity
                  style={styles.photoUploadBox}
                  onPress={addLocalPhoto}
                >
                  <Text
                    style={{
                      color: "#fbbf24",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    + Subir foto
                  </Text>
                </TouchableOpacity>

                <View style={styles.photoGallery}>
                  {localPhotos.map((p, i) => (
                    <Image
                      key={i}
                      source={{ uri: p }}
                      style={styles.galleryImg}
                    />
                  ))}
                </View>

                {/* AMENITIES */}
                <Text style={styles.modalLabel}>Amenidades</Text>
                <TextInput
                  placeholder="Ej: Wi-Fi, Estacionamiento, Mesas al aire libre..."
                  placeholderTextColor="#777"
                  value={localAmenityInput}
                  onChangeText={setLocalAmenityInput}
                  onSubmitEditing={() => {
                    if (!localAmenityInput.trim()) return;
                    setLocalAmenities((prev) => [
                      ...prev,
                      localAmenityInput.trim(),
                    ]);
                    setLocalAmenityInput("");
                  }}
                  style={styles.modalInputPro}
                />

                <View style={styles.tagList}>
                  {localAmenities.map((a, i) => (
                    <View key={i} style={styles.tagChipPro}>
                      <Text style={styles.tagChipTextPro}>{a}</Text>
                    </View>
                  ))}
                </View>

                {/* TAGS ESPECIALES */}
                <Text style={styles.modalLabel}>Hashtags especiales</Text>
                <TextInput
                  placeholder="#Familiar #Vegano #Económico"
                  placeholderTextColor="#777"
                  value={localTagInput}
                  onChangeText={setLocalTagInput}
                  onSubmitEditing={() => {
                    if (!localTagInput.trim()) return;
                    setLocalTags((prev) => [...prev, localTagInput.trim()]);
                    setLocalTagInput("");
                  }}
                  style={styles.modalInputPro}
                />

                <View style={styles.tagList}>
                  {localTags.map((t, i) => (
                    <View key={i} style={styles.tagChipPro}>
                      <Text style={styles.tagChipTextPro}>{t}</Text>
                    </View>
                  ))}
                </View>

                {/* BOTÓN GUARDAR */}
                <TouchableOpacity
                  style={styles.saveBtnPro}
                  onPress={saveLocalCompletion}
                >
                  <Text style={styles.saveBtnTextPro}>Guardar cambios</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtnPro}
                  onPress={() => setLocalModalOpen(false)}
                >
                  <Text style={styles.cancelBtnTextPro}>Cancelar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal visible={deleteModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 350 }]}>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 12,
              }}
            >
              ¿Eliminar {deleteType === "service" ? "servicio" : "local"}?
            </Text>

            <Text style={{ color: "#ccc", marginBottom: 20 }}>
              ¿Seguro que deseas eliminar "{deleteTarget?.name}"? Esta acción no
              se puede deshacer.
            </Text>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: "#e63946" }]}
              onPress={confirmDelete}
            >
              <Text style={styles.saveBtnText}>Eliminar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setDeleteModalOpen(false)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ============================================
          ESTILOS COMPLETOS
============================================ */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b0b0b",
  },

  centered: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#0f0f10",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(251,191,36,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  modalContainer: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 18,
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.25)",
    shadowColor: "#fbbf24",
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },

  modalHeaderPro: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitlePro: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 20,
  },

  modalLabel: {
    color: "#fbbf24",
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 6,
  },

  modalInputPro: {
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    marginBottom: 8,
  },

  photoUploadBox: {
    backgroundColor: "#1f1f1f",
    height: 65,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  photoGallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },

  galleryImg: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },

  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tagChipPro: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  tagChipTextPro: {
    color: "#fff",
    fontWeight: "600",
  },

  saveBtnPro: {
    backgroundColor: "#fbbf24",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },

  saveBtnTextPro: {
    color: "#111",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 16,
  },

  cancelBtnPro: {
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#444",
  },

  cancelBtnTextPro: {
    textAlign: "center",
    color: "#ddd",
    fontWeight: "700",
  },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#444",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 999,
    overflow: "hidden",
  },

  avatar: { width: "100%", height: "100%" },

  avatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarFallbackText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },

  name: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },

  grayText: {
    color: "#aaa",
  },

  ratingText: {
    color: "#fbbf24",
    marginTop: 6,
    fontWeight: "600",
  },

  /* Servicios */
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sectionTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  addBtn: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  addBtnText: {
    fontWeight: "800",
    color: "#111",
  },

  serviceItem: {
    flexDirection: "row",
    backgroundColor: "#222",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },

  serviceThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#333",
  },

  serviceThumbFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  actionCol: {
    flex: 1,
    marginLeft: 10,
  },
  dropdownBox: {
    backgroundColor: "#222",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",

    // ❌ quitar esto
    // overflow: "hidden",

    // ✔ agregar esto
    paddingHorizontal: 6,
  },

  serviceName: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  priceInput: {
    flex: 1,
    height: 45,
    backgroundColor: "#222",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 12,
    color: "#fff",
  },

  priceSuffix: {
    height: 45,
    paddingHorizontal: 14,
    backgroundColor: "#333",
    borderRadius: 10,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#444",
  },

  serviceMeta: {
    color: "#ccc",
    fontSize: 12,
  },

  serviceDesc: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },

  smallActionBtn: {
    marginTop: 6,
  },

  /* Locales */
  localCard: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  completeBtnFull: {
    backgroundColor: "#fbbf24",
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },

  completeBtnText: {
    color: "#111",
    fontWeight: "900",
    textAlign: "center",
  },

  /* Logout */
  CloseBigBtn: {
    marginTop: 12,
    backgroundColor: "#e63946",
    paddingVertical: 12,
    borderRadius: 12,
  },

  editBigBtnText: {
    color: "#000000ff",
    fontWeight: "900",
    textAlign: "center",
  },

  /* MODALES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 14,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },

  /* photo */
  photoPicker: {
    height: 120,
    borderRadius: 12,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  editBigBtn: {
    marginTop: 12,
    backgroundColor: "#fbbf24",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  photoPickerText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "700",
  },

  photoPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },

  /* Inputs */
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#222",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 12,
    color: "#fff",
    marginBottom: 10,
  },

  tagInputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  tagAddBtn: {
    width: 45,
    height: 45,
    backgroundColor: "#fbbf24",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  tagChip: {
    flexDirection: "row",
    backgroundColor: "#333",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    gap: 6,
  },

  tagChipText: {
    color: "#fff",
    fontSize: 12,
  },

  saveBtn: {
    backgroundColor: "#fbbf24",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
  },

  saveBtnText: {
    textAlign: "center",
    color: "#111",
    fontWeight: "900",
  },

  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#444",
    marginTop: 8,
  },

  cancelBtnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
  },

  addPhotoBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  localItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.15)",
  },

  localThumbWrap: {
    width: 70,
    height: 70,
    marginRight: 12,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#222",
  },

  localThumb: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },

  localThumbFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  localName: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
  },

  localAddress: {
    color: "#aaa",
    fontSize: 12,
  },

  localStatus: {
    marginTop: 6,
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "700",
  },

  localArrow: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallEditBtn: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  smallEditBtnText: {
    color: "#111",
    fontWeight: "800",
  },
});
