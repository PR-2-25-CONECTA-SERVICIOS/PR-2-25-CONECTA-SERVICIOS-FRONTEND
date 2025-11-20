import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { loadUserSession, saveUserSession } from "../../utils/secureStore";

const API_URL = "http://192.168.1.68:3000/api/usuarios/";

export default function EditProfileScreen() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ---------------------------------------------
      🔹 CARGAR PERFIL DESDE LA SESIÓN Y BACKEND
  ----------------------------------------------*/
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const session = await loadUserSession();
        if (!session || !session.id) {
          return router.replace("/Login/LoginScreen");
        }

        setUserId(session.id);

        const r = await fetch(API_URL + session.id);
        const raw = await r.text();
        const data = JSON.parse(raw);

        setName(data.nombre);
        setPhone(data.telefono || "");
        setEmail(data.correo);
        setPhoto(data.avatar || null);
      } catch (err) {
        console.log("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);
  const uploadImageToCloudinary = async (imageUri: string) => {
    try {
      const uri = imageUri;

      const data = new FormData();
      data.append("file", {
        uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);

      data.append("upload_preset", "imagescloudexp"); // solo esto
      // ❌ NO añadir cloud_name aquí

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/deqxfxbaa/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const json = await res.json();
      console.log("CLOUDINARY RESPONSE:", json);

      return json.secure_url;
    } catch (err) {
      console.log("ERROR SUBIENDO A CLOUDINARY:", err);
      return null;
    }
  };

  /* ---------------------------------------------
      🔹 SELECCIONAR FOTO
  ----------------------------------------------*/
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const localUri = result.assets[0].uri;

      // 1. Mostrar preview temporal
      setPhoto(localUri);

      // 2. Subir a Cloudinary
      const cloudUrl = await uploadImageToCloudinary(localUri);

      // 3. Reemplazar con el link final
      setPhoto(cloudUrl);

      console.log("📤 Imagen subida:", cloudUrl);
    }
  };

  /* ---------------------------------------------
      🔹 GUARDAR CAMBIOS → BACKEND
  ----------------------------------------------*/
  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);

      const body = {
        nombre: name.trim(),
        telefono: phone.trim(),
        avatar: photo || "",
      };

      const res = await fetch(API_URL + userId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      const updated = JSON.parse(raw);

      // 🔄 Actualizar sesión local
      await saveUserSession({
        id: userId,
        nombre: updated.user.nombre,
        correo: updated.user.correo,
        telefono: updated.user.telefono,
        avatar: updated.user.avatar,
        rol: updated.user.rol,
      });

      // ⬅️ Volver al perfil
      router.replace("/ProfileViewScreen");
    } catch (err) {
      console.log("Error guardando cambios:", err);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------
      🔹 LOADING
  ----------------------------------------------*/
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  /* ---------------------------------------------
      🔹 UI PRINCIPAL
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

      <ScrollView contentContainerStyle={styles.content}>
        {/* FOTO */}
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.imagePicker}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.image} />
            ) : (
              <Text style={styles.selectImageText}>Seleccionar foto</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* CAMPOS */}
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          editable={false}
          value={email}
          placeholder="Correo"
          placeholderTextColor="#aaa"
        />

        {/* GUARDAR */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
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
  headerTitle: { color: "#e5e7eb", fontWeight: "700", fontSize: 17 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.25)",
    backgroundColor: "#111113",
  },

  content: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },

  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#fbbf24",
    marginBottom: 25,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  selectImageText: {
    color: "#aaa",
    fontSize: 16,
  },

  input: {
    width: "100%",
    height: 50,
    borderColor: "#333",
    borderWidth: 1,
    marginBottom: 15,
    color: "#fff",
    paddingLeft: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#1a1a1a",
  },

  saveButton: {
    backgroundColor: "#fbbf24",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
});
