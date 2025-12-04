import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function Splash() {
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const square = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle1,{toValue:1,duration:2000,useNativeDriver:true}),
        Animated.timing(circle1,{toValue:0,duration:2000,useNativeDriver:true}),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(circle2,{toValue:1,duration:2500,useNativeDriver:true}),
        Animated.timing(circle2,{toValue:0,duration:2500,useNativeDriver:true}),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(square,{toValue:1,duration:3000,useNativeDriver:true}),
        Animated.timing(square,{toValue:0,duration:3000,useNativeDriver:true}),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      
      <Animated.View style={[styles.shape, styles.circle1,{opacity:circle1}]} />
      <Animated.View style={[styles.shape, styles.circle2,{opacity:circle2}]} />
      <Animated.View style={[styles.shape, styles.square,{opacity:square}]} />

      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/logoBlanco.png")} style={styles.logo} contentFit="contain" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>¡Bienvenido a Conecta Servicios!</Text>
        <Text style={styles.subtitle}>Encuentra y conecta con los mejores servicios y negocios cerca de ti</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Versión 1.0</Text>
        <Text style={styles.footerText}>© 2025 Conecta Servicios</Text>
      </View>

    </View>
  );
}

// ==== Estilos iguales al original ====
const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#111',padding:16},
  shape:{position:'absolute',borderRadius:50},
  circle1:{width:100,height:100,backgroundColor:'#D4B500',top:10,left:20},
  circle2:{width:120,height:120,backgroundColor:'#B48A00',top:120,left:-50},
  square:{width:100,height:100,backgroundColor:'#9A6D00',top:180,right:-50},
  
  logoContainer:{marginBottom:40,alignItems:'center'},
  logo:{width:200,height:200},

  textContainer:{alignItems:'center'},
  title:{fontSize:30,fontWeight:'bold',color:'white',marginBottom:10,textAlign:'center'},
  subtitle:{fontSize:16,color:'gray',marginBottom:30,textAlign:'center',width:'80%'},

  footer:{position:'absolute',bottom:10,alignItems:'center'},
  footerText:{fontSize:12,color:'gray'},
});
