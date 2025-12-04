import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image, Platform, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useAuth } from "../../context/AuthContext";
import { loadUserSession, saveUserSession } from "../../utils/secureStore";

const API_URL = "https://pr-2-25-conecta-servicios-backend.onrender.com/api/usuarios/";

export default function EditProfileScreen() {
  const router = useRouter();
  const { loading: authLoading, setUser } = useAuth();

  const [userId, setUserId] = useState<string | null>(null);

const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [photo, setPhoto] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [errors, setErrors] = useState<{name?:string, phone?:string, email?:string}>({});

  /* ---------------------------------------------
      CARGAR PERFIL DESDE SESIÓN + BACKEND
  ----------------------------------------------*/
  useEffect(() => {
    if (authLoading) return;

    const loadProfile = async () => {
      try {
        const session = await loadUserSession();

        if (!session?._id) {
          router.replace("/inicio/LoginScreen");
          return;
        }

        setUserId(session._id);

        const res = await fetch(API_URL + session._id);
        const data = await res.json();

        setName(data.nombre);
        setPhone(data.telefono ?? "");
        setEmail(data.correo);
        setPhoto(data.avatar ?? null);
      } catch (err) {
        console.log("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authLoading]);

  /* ---------------------------------------------
     SUBIR IMAGEN A CLOUDINARY
  ----------------------------------------------*/
  const uploadImageToCloudinary = async (uri: string) => {
    try {
      const data = new FormData();

      let file: any;

      if (Platform.OS === "web") {
        // WEB → convertir la URL en Blob
        const response = await fetch(uri);
        const blob = await response.blob();
        file = blob;
      } else {
        // MOBILE → enviar como archivo nativo
        file = {
          uri,
          type: "image/jpeg",
          name: "upload.jpg",
        };
      }

      data.append("file", file);
      data.append("upload_preset", "imagescloudexp");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/deqxfxbaa/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const json = await res.json();

      if (!json.secure_url) {
        console.log("❌ Error Cloudinary:", json);
        return null;
      }

      return json.secure_url;
    } catch (err) {
      console.log("❌ ERROR subida Cloudinary:", err);
      return null;
    }
  };

  /* ---------------------------------------------
     SELECCIONAR FOTO
  ----------------------------------------------*/
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;

      // Preview
      setPhoto(localUri);

      const cloudUrl = await uploadImageToCloudinary(localUri);

      if (cloudUrl) {
        setPhoto(cloudUrl);
      } else {
        alert("Error subiendo la imagen a Cloudinary");
      }
    }
  };
const validateForm = () => {
  const newErrors: any = {};

  // Nombre no vacío
  if (!name.trim()) newErrors.name = "El nombre no puede estar vacío.";

  // Teléfono Bolivia
  if (!/^(6|7)\d{7}$/.test(phone.trim())) 
    newErrors.phone = "Debe tener 8 dígitos y comenzar con 6 o 7.";

  // Email válido
  if (!email.trim()) newErrors.email = "El correo no puede estar vacío.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) 
    newErrors.email = "Formato de correo no válido.";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  /* ---------------------------------------------
     GUARDAR PERFIL
  ----------------------------------------------*/
  const handleSave = async () => {
      if (!validateForm()) return; // ⛔ detiene si hay errores

    if (!userId) return;

    try {
      setSaving(true);

    const body = {
      nombre: name.trim(),
      telefono: phone.trim(),
      correo: email.trim(),
      avatar: photo ?? "",
    };

      const res = await fetch(API_URL + userId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const updated = await res.json();

      const updatedUser = {
        id: userId,
        _id: userId,

        nombre: updated.user.nombre,
        correo: updated.user.correo,
        telefono: updated.user.telefono,
        avatar: updated.user.avatar,
        rol: updated.user.rol,
      };

      await saveUserSession(updatedUser);
      setUser(updatedUser);

      router.replace("/ProfileViewScreen");
    } catch (err) {
      alert("Error al guardar cambios");
      console.log("❌ Error guardando:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------
     LOADING SCREEN
  ----------------------------------------------*/
  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Cargando perfil...</Text>
      </View>
    );
  }

  /* ---------------------------------------------
     UI PRINCIPAL
  ----------------------------------------------*/
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color="#e5e7eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* FORM */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* FOTO */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
          <View style={styles.imagePicker}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.image} />
            ) : (
              <Text style={styles.selectImageText}>Seleccionar foto</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* INPUTS */}
        {/* NOMBRE */}
<TextInput
  style={[styles.input, errors.name && {borderColor:"red"}]}
  placeholder="Nombre"
  placeholderTextColor="#888"
  value={name}
  onChangeText={(t)=>{ setName(t); setErrors({...errors}); }}
/>
{errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

{/* TELÉFONO */}
<TextInput
  style={[styles.input, errors.phone && {borderColor:"red"}]}
  placeholder="Teléfono (8 dígitos)"
  placeholderTextColor="#888"
  keyboardType="phone-pad"
  maxLength={8}
  value={phone}
  onChangeText={(t)=>{ setPhone(t.replace(/[^0-9]/g,"")); setErrors({...errors}); }}
/>
{errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

{/* EMAIL ahora editable */}
<TextInput
  style={[styles.input, errors.email && {borderColor:"red"}]}
  placeholder="Correo"
  placeholderTextColor="#888"
  value={email}
  onChangeText={(t)=>{ setEmail(t); setErrors({...errors}); }}
  keyboardType="email-address"
/>
{errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* GUARDAR */}
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

/* ---------------------------------------------
   ESTILOS MEJORADOS
----------------------------------------------*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e0f",
  },

  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#111",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fbbf24",
    fontWeight: "800",
    fontSize: 18,
  },
  errorText:{
  color:"red",
  fontSize:13,
  marginBottom:10,
  alignSelf:"flex-start"
}
,
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 20,
    alignItems: "center",
  },

  imagePicker: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: "#fbbf24",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "#222",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  selectImageText: {
    color: "#bbb",
    fontSize: 15,
  },

  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1b1b1d",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#fff",
    marginBottom: 16,
    fontSize: 15,
  },

  saveButton: {
    backgroundColor: "#fbbf24",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "800",
  },
});
