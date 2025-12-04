import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/ui/button'; // Asegúrate de que el Button esté bien importado

export default function SplashScreen({ onNext }: { onNext: () => void }) {
  const circle1Animation = useRef(new Animated.Value(0)).current;
  const circle2Animation = useRef(new Animated.Value(0)).current;
  const squareAnimation = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    // Animaciones para las formas geométricas
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle1Animation, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(circle1Animation, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(circle2Animation, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(circle2Animation, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(squareAnimation, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(squareAnimation, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Formas geométricas animadas */}
      <Animated.View
        style={[styles.shape, styles.circle1, { opacity: circle1Animation }]}
      />
      <Animated.View
        style={[styles.shape, styles.circle2, { opacity: circle2Animation }]}
      />
      <Animated.View
        style={[styles.shape, styles.square, { opacity: squareAnimation }]}
      />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logoBlanco.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Texto y botón */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>¡Bienvenido a Conecta Servicios!</Text>
        <Text style={styles.subtitle}>
          Encuentra y conecta con los mejores servicios y negocios cerca de ti
        </Text>
        <Button onPress={() => router.push('/inicio/LoginScreen')} style={styles.button}>
          Comenzar
        </Button>
      </View>

      {/* Pie de página */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Versión 1.0</Text>
        <Text style={styles.footerText}>© 2025 Conecta Servicios</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
    position: 'relative',
    padding: 16,
  },
  shape: {
    position: 'absolute',
    borderRadius: 50,
  },
  circle1: {
    width: 100,
    height: 100,
    backgroundColor: '#D4B500',
    top: 10,
    left: 20,
  },
  circle2: {
    width: 120,
    height: 120,
    backgroundColor: '#B48A00',
    top: 120,
    left: -50,
  },
  square: {
    width: 100,
    height: 100,
    backgroundColor: '#9A6D00',
    top: 180,
    right: -50,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  textContainer: {
    alignItems: 'center',
    textAlign: 'center',
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
  button: {
    backgroundColor: '#FFEB3B',  // Usamos el color amarillo como fondo del botón
    color: 'black',
    paddingVertical: 15,
    paddingHorizontal: 30,
    fontWeight: 'bold',
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'gray',
  },
});
