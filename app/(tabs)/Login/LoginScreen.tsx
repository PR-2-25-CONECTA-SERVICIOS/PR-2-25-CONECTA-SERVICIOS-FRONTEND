import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui/button'; // Asegúrate de que el botón esté importado correctamente

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../../assets/images/logoGris2.png')}  // Asegúrate de poner la ruta correcta de la imagen
        style={styles.logoBackground}
      />


      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.subtitle}>Ingresa tus datos para acceder a tu cuenta</Text>

      {/* Contenedor de los campos de input */}
      <View style={styles.inputContainer}>
        {/* Campo de Correo Electrónico */}
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

        {/* Campo de Contraseña */}
        <View style={styles.inputField}>
          <Ionicons name="lock-closed" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Botón de Iniciar Sesión */}
        <Button onPress={() => router.push('/(tabs)')} style={styles.loginButton}>
          Iniciar Sesión
        </Button>

        {/* Olvidaste tu contraseña */}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      {/* Opción para registrarse */}
      <View style={styles.registerContainer}>

<View style={styles.registerContainer}>
  <Text style={styles.registerText}>
    ¿No tienes cuenta?{' '}
    <Link href="/Login/RegisterScreen">
      <Text style={styles.linkText}>Regístrate aquí</Text>
    </Link>
  </Text>
</View>

      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        Al continuar, aceptas nuestros{' '}
        <Text style={styles.linkText}>Términos de Servicio</Text> y{' '}
        <Text style={styles.linkText}>Política de Privacidad</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
    padding: 16,
  },
  logo: {
    width: 150,  // Ajusta el tamaño de la imagen del logo
    height: 150,  // Ajusta el tamaño de la imagen del logo
    marginBottom: 40,  // Espacio entre el logo y el título
  },
    logoBackground: {
    position: 'absolute',  // Esto coloca el logo en la parte inferior como fondo
    top: 0,
    left: '17%',
    right: '50%',
    opacity: 0.05, // Hacemos el logo un poco transparente para que no opaque el contenido
    zIndex: -1,  // Coloca el logo por debajo de los demás componentes

  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30,
  },
  inputContainer: {
    width: '80%',  // Establecer un ancho fijo
    marginBottom: 20,
    alignItems: 'center',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    marginBottom: 20,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  loginButton: {
    backgroundColor: '#FFEB3B',
    paddingVertical: 15,
    paddingHorizontal: 40,
    fontSize: 16,
    fontWeight: 'bold',
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    textAlign: 'center',  // Centrar el texto
    justifyContent: 'center',  // Vertically center
    alignItems: 'center',  // Horizontally center
  },
  forgotPassword: {
    color: '#FFEB3B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  registerContainer: {
    marginTop: 10,
  },
  registerText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  linkText: {
    color: '#FFEB3B',
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  footerText: {
    color: 'gray',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20
  },
});
