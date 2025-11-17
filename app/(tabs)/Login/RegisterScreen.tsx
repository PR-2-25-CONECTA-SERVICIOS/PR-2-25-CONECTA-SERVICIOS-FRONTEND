import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "../../../components/ui/button";

// ===========================
// 🔗 URL BACKEND
// ===========================
const API_URL = "http://192.168.1.68:3000/api/auth/register";  
// ⚠️ Cambia la IP por la tuya si es necesario

export default function RegisterScreen() {
  const router = useRouter();

  // --------------------------
  // STATE
  // --------------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // --------------------------
  // 📌 HANDLER DEL REGISTRO
  // --------------------------
  const handleRegister = async () => {
    if (!name || !email || !password) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

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
        return;
      }

      router.push("/Login/LoginScreen");

    } catch (error) {
      console.log("❌ Error en el registro:", error);
    }
  };

  // ===========================
  // 🌟 UI
  // ===========================
  return (
    <View style={styles.container}>

      {/* LOGO DE FONDO */}
      <Image
        source={require("../../../assets/images/logoGris2.png")}
        style={styles.logoBackground}
      />

      <Text style={styles.title}>¡Regístrate!</Text>
      <Text style={styles.subtitle}>Crea tu cuenta para comenzar a usar la app</Text>

      <View style={styles.inputContainer}>

        {/* Nombre */}
        <View style={styles.inputField}>
          <Ionicons name="person" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre Completo"
            placeholderTextColor="gray"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Correo */}
        <View style={styles.inputField}>
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

        {/* Contraseña */}
        <View style={styles.inputField}>
          <Ionicons name="lock-closed" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="gray"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Confirmar Contraseña */}
        <View style={styles.inputField}>
          <Ionicons name="lock-closed" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            placeholderTextColor="gray"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Teléfono */}
        <View style={styles.inputField}>
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

        {/* Botón Registrar */}
        <Button style={styles.loginButton} onPress={handleRegister}>
          Registrar
        </Button>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        ¿Ya tienes cuenta?{" "}
        <Link href="/Login/LoginScreen">
          <Text style={styles.linkText}>Inicia sesión aquí</Text>
        </Link>
      </Text>

    </View>
  );
}

// ===========================
// 🎨 ESTILOS
// ===========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111111",
    padding: 16,
    position: "relative",
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
    marginBottom: 20,
    alignItems: "center",
  },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    marginBottom: 20,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: "100%",
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "white",
  },
  loginButton: {
    backgroundColor: "#FFEB3B",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    marginTop: 40,
  },
  linkText: {
    color: "#FFEB3B",
    fontWeight: "bold",
  },
  footerText: {
    color: "gray",
    fontSize: 12,
    textAlign: "center",
  },
});
