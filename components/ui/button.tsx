import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];  // Hacemos que 'style' acepte objetos de estilo
}

export const Button: React.FC<ButtonProps> = ({ onPress, children, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      {typeof children === "string" 
        ? <Text style={styles.text}>{children}</Text>
        : children
      }
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFEB3B',  // Color amarillo por defecto
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
  },
});
