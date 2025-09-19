import React from 'react';
import { StyleSheet, View } from 'react-native';

// Tipos para las propiedades del componente
interface CreativeBackgroundProps {
  children: React.ReactNode;   // Contenido dentro del fondo creativo
  variant: 'splash' | 'auth' | 'catalog' | 'map' | 'detail' | 'history' | 'rating' | 'provider' | 'business' | 'admin';
  className?: string;
}

export default function CreativeBackground({ children, variant, className = '' }: CreativeBackgroundProps) {
  const getBackgroundPattern = () => {
    switch (variant) {
      case 'splash':
        return (
          <View style={styles.backgroundContainer}>
            {/* Gradiente de fondo y formas geométricas */}
            <View style={[styles.shape, styles.circle1]} />
            <View style={[styles.shape, styles.circle2]} />
            <View style={[styles.shape, styles.square]} />
          </View>
        );
      case 'auth':
        return (
          <View style={styles.authBackground}>
            {/* Otro fondo específico para la pantalla de autenticación */}
            <View style={[styles.shape, styles.hexagon1]} />
          </View>
        );
      case 'catalog':
        return (
          <View style={styles.catalogBackground}>
            {/* Fondo para catálogo de servicios */}
            <View style={[styles.shape, styles.wave]} />
          </View>
        );
      default:
        return <View style={styles.defaultBackground}></View>;
    }
  };

  return (
    <View className={`relative min-h-screen ${className}`}>
      {getBackgroundPattern()}
      <View style={styles.content}>{children}</View>
    </View>
  );
}
const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: -1,  // Para que esté detrás del contenido
  },
  shape: {
    position: 'absolute',
    borderRadius: 50,
  },
  circle1: {
    width: 100,
    height: 100,
    backgroundColor: '#D4B500',
    top: 20,
    left: 40,
    opacity: 0.3,
  },
  circle2: {
    width: 120,
    height: 120,
    backgroundColor: '#B48A00',
    top: 140,
    left: 100,
    opacity: 0.3,
  },
  square: {
    width: 100,
    height: 100,
    backgroundColor: '#9A6D00',
    top: 230,
    left: 50,
    opacity: 0.3,
  },
  hexagon1: {
    width: 100,
    height: 100,
    backgroundColor: '#FFEB3B',
    transform: [
      { rotate: '45deg' }, // Esto hace que la forma parezca un hexágono
    ],
    opacity: 0.5,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 100,
    backgroundColor: 'transparent',
    // Usando un gradiente o SVG
  },
  authBackground: {
    // Gradiente específico para auth
    backgroundColor: 'gray',
  },
  catalogBackground: {
    // Fondo para el catálogo de servicios
    backgroundColor: '#333',
  },
  defaultBackground: {
    backgroundColor: '#111',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
