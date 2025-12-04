// app/Splash.tsx
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Splash() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Animaciones
  const fade = useRef(new Animated.Value(0)).current;
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const square = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade del logo
    Animated.timing(fade,{ toValue:1,duration:1500,useNativeDriver:true }).start();

    // Círculo 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle1,{ toValue:1,duration:1800,useNativeDriver:true }),
        Animated.timing(circle1,{ toValue:0,duration:1800,useNativeDriver:true }),
      ])
    ).start();

    // Círculo 2
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle2,{ toValue:1,duration:2200,useNativeDriver:true }),
        Animated.timing(circle2,{ toValue:0,duration:2200,useNativeDriver:true }),
      ])
    ).start();

    // Cuadrado
    Animated.loop(
      Animated.sequence([
        Animated.timing(square,{ toValue:1,duration:2500,useNativeDriver:true }),
        Animated.timing(square,{ toValue:0,duration:2500,useNativeDriver:true }),
      ])
    ).start();

    // 🔥 Después del splash → decide Login o Tabs
    const timer = setTimeout(() => {
      if (!loading) { 
        user ? router.replace("/(tabs)") : router.replace("/Login/LoginScreen");
      }
    }, 2300);

    return () => clearTimeout(timer);

  }, [loading]);

  return (
    <View style={styles.container}>

      {/* Background Animations */}
      <Animated.View style={[styles.shape,styles.circle1,{opacity:circle1}]} />
      <Animated.View style={[styles.shape,styles.circle2,{opacity:circle2}]} />
      <Animated.View style={[styles.shape,styles.square,{opacity:square}]} />

      {/* Logo con Fade */}
      <Animated.View style={{ opacity: fade }}>
        <Image source={require("../assets/images/logoBlanco.png")} style={styles.logo} contentFit="contain"/>
      </Animated.View>

      <Text style={styles.title}>¡Bienvenido a Conecta Servicios!</Text>
      <Text style={styles.subtitle}>Encuentra y conecta con los mejores servicios y negocios cerca de ti</Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Versión 1.0</Text>
        <Text style={styles.footerText}>© 2025 Conecta Servicios</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#111", justifyContent:"center", alignItems:"center", padding:16 },

  shape:{ position:"absolute", borderRadius:50 },
  circle1:{ width:100,height:100,backgroundColor:"#D4B500",top:10,left:20 },
  circle2:{ width:120,height:120,backgroundColor:"#B48A00",top:120,left:-50 },
  square:{ width:100,height:100,backgroundColor:"#9A6D00",top:180,right:-50 },

  logo:{ width:200,height:200, marginBottom:15 },

  title:{ fontSize:28,fontWeight:"bold",color:"#fff",textAlign:"center",marginTop:10 },
  subtitle:{ fontSize:15,color:"#ccc",textAlign:"center",width:"80%",marginTop:6 },

  footer:{ position:"absolute",bottom:15,alignItems:"center" },
  footerText:{ fontSize:12,color:"#777" },
});
