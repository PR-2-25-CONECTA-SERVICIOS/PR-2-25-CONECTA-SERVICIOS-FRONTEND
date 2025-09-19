import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/ui/button'; // Asegúrate de que el botón esté importado correctamente

export default function RegisterScreen({ onRegister }: { onRegister: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      {/* Logo como fondo */}
      <Image
        source={require('../../assets/images/logoGris2.png')}  // Asegúrate de poner la ruta correcta de la imagen
        style={styles.logoBackground}
      />

      <Text style={styles.title}>¡Regístrate!</Text>
      <Text style={styles.subtitle}>Crea tu cuenta para comenzar a usar la app</Text>

      {/* Contenedor de los campos de input */}
      <View style={styles.inputContainer}>
        {/* Campo de Nombre Completo */}
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

        {/* Confirmación de Contraseña */}
        <View style={styles.inputField}>
          <Ionicons name="lock-closed" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            placeholderTextColor="gray"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Campo de Teléfono */}
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

        {/* Botón de Registrar */}
        <Button onPress={onRegister} style={styles.loginButton}>
          Registrar
        </Button>


      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        ¿Ya tienes cuenta?{' '}
        <Text style={styles.linkText}>Inicia sesión aquí</Text>
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
    position: 'relative', // Hacer que los elementos del fondo puedan colocarse por encima
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
    width: '50%',  // Establecer un ancho fijo
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
    marginTop: 40,
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
  },
  footerText: {
    color: 'gray',
    fontSize: 12,
    textAlign: 'center',
  },
});
