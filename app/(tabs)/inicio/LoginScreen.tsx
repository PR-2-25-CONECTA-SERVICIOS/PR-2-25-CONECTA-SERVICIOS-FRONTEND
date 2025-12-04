import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


const API_URL = "https://pr-2-25-conecta-servicios-backend.onrender.com/api/auth/login";

export default function LoginScreen() {
  const router = useRouter();
const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
const [hasError, setHasError] = useState(false);

  const handleLogin = async () => {
  setMsg("");
  setHasError(false); // reset color rojo

  if (!email || !password) {
    setMsg("Correo o contraseña incorrectos");
    setHasError(true);
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Error genérico
      setMsg("Correo o contraseña incorrectos");
      setHasError(true);
      return;
    }

    await login({
      _id: data.usuario._id,
      nombre: data.usuario.nombre,
      correo: data.usuario.correo,
      rol: data.usuario.rol,
      avatar: data.usuario.avatar,
    });

    router.push("/(tabs)");

  } catch (err) {
    console.log("Error:", err);
    setMsg("Error de conexión");
    setHasError(true);
  }
};


  return (
    <View style={styles.container}>
      {/* LOGO BACKGROUND */}
      <Image
        source={require("../../../assets/images/logoGris2.png")}
        style={styles.logoBackground}
      />

      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.subtitle}>
        Ingresa tus datos para acceder a tu cuenta
      </Text>

      <View style={styles.inputContainer}>
        {/* Email */}
        <View style={[styles.inputField, hasError && styles.errorBorder]}>

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

        {/* Password */}
        <View style={[styles.inputField, hasError && styles.errorBorder]}>

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

        {/* Mensaje de error */}
        {msg.length > 0 && <Text style={styles.msg}>{msg}</Text>}

        {/* Botón Login */}
<TouchableOpacity
  style={[styles.loginButton, { alignItems: "center" }]}
  onPress={handleLogin}
>
  <Text style={{ fontWeight: "700" }}>Iniciar Sesión</Text>
</TouchableOpacity>


      </View>

      {/* Registro */}
      <Text style={styles.registerText}>
        ¿No tienes cuenta?{" "}
        <Link href="/inicio/RegisterScreen">
          <Text style={styles.linkText}>Regístrate aquí</Text>
        </Link>
      </Text>

      {/* Footer */}
      <Text style={styles.footerText}>
        Al continuar, aceptas nuestros{" "}
        <Text style={styles.linkText}>Términos de Servicio</Text> y{" "}
        <Text style={styles.linkText}>Política de Privacidad</Text>
      </Text>
    </View>
  );
}

/* ============================
   🎨 ESTILOS
============================ */
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
  errorBorder: {
  borderWidth: 1,
  borderColor: "#ff4d4d",
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
    borderRadius: 8,
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPassword: {
    color: "#FFEB3B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
  },
  registerText: {
    fontSize: 14,
    color: "white",
    marginTop: 4,
    textAlign: "center",
  },
  linkText: {
    color: "#FFEB3B",
    fontWeight: "bold",
  },
  footerText: {
    color: "gray",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
  msg: {
    color: "#f87171",
    marginBottom: 4,
    fontSize: 13,
  },
});
