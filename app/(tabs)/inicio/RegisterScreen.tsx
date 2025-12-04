import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../components/ui/button";

const API_URL =
  "https://pr-2-25-conecta-servicios-backend.onrender.com/api/auth/register";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);

  // --------------------------
  // VALIDACIONES
  // --------------------------
  const validate = () => {
    let valid = true;
    let newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Ingrese un correo válido";
      valid = false;
    }

    if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      valid = false;
    }

    if (phone.trim().length > 0 && !/^[67]\d{7}$/.test(phone)) {
      newErrors.phone =
        "Número inválido (Bolivia: empieza en 6 o 7 y tiene 8 dígitos)";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // --------------------------
  // REGISTRO
  // --------------------------
  const handleRegister = async () => {
    if (!validate()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: name,
          correo: email,
          password,
          telefono: phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Error backend:", data);
        return;
      }

      // MOSTRAR MODAL 🎉
      setModalVisible(true);

    } catch (error) {
      console.log("❌ Error en el registro:", error);
    }
  };

  // ===========================
  // UI
  // ===========================
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/logoGris2.png")}
        style={styles.logoBackground}
      />

      <Text style={styles.title}>¡Regístrate!</Text>
      <Text style={styles.subtitle}>Crea tu cuenta para comenzar a usar la app</Text>

      <View style={styles.inputContainer}>

        {/* Nombre */}
        <View style={[styles.inputField, errors.name && styles.errorBorder]}>
          <Ionicons name="person" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre Completo"
            placeholderTextColor="gray"
            value={name}
            onChangeText={setName}
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* Email */}
        <View style={[styles.inputField, errors.email && styles.errorBorder]}>
          <Ionicons name="mail" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* Contraseña */}
        <View style={[styles.inputField, errors.password && styles.errorBorder]}>
          <Ionicons name="lock-closed" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="gray"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="white" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        {/* Confirmar contraseña */}
        <View
          style={[styles.inputField, errors.confirmPassword && styles.errorBorder]}
        >
          <Ionicons name="lock-closed" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            placeholderTextColor="gray"
            secureTextEntry={!showConfirmPass}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
            <Ionicons
              name={showConfirmPass ? "eye-off" : "eye"}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}

        {/* Teléfono */}
        <View style={[styles.inputField, errors.phone && styles.errorBorder]}>
          <Ionicons name="call" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Teléfono (opcional)"
            placeholderTextColor="gray"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Button style={styles.loginButton} onPress={handleRegister}>
          Registrar
        </Button>
      </View>

      {/* FOOTER */}
      <Text style={styles.footerText}>
        ¿Ya tienes cuenta?{" "}
        <Link href="/inicio/LoginScreen" style={styles.linkText}>
          Inicia sesión aquí
        </Link>
      </Text>

      {/* =======================
          MODAL DE ÉXITO 🎉
      ======================= */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registro exitoso</Text>
            <Text style={styles.modalMessage}>Bienvenido {name}!</Text>

            <Button
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                router.push("/inicio/LoginScreen"); // 👉 REDIRECCIÓN AL LOGIN
              }}
            >
              Ir al login
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ===========================
// ESTILOS
// ===========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111111",
    padding: 16,
  },
  logoBackground: {
    position: "absolute",
    top: 0,
    left: "17%",
    opacity: 0.05,
    zIndex: -1,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 30,
  },
  inputContainer: {
    width: "80%",
  },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    marginBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 50,
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "white" },
  loginButton: {
    backgroundColor: "#FFEB3B",
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    marginTop: 20,
  },
  linkText: { color: "#FFEB3B", fontWeight: "bold" },
  footerText: { color: "gray", fontSize: 12, marginTop: 20, textAlign: "center" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#222",
    width: "80%",
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFEB3B",
    marginBottom: 10,
  },
  modalMessage: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#FFEB3B",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
  },
});
