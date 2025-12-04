// app/Splash.tsx
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Splash() {
  const { user } = useAuth();
  const router = useRouter();

  const fade = useRef(new Animated.Value(0)).current;
  const c1 = useRef(new Animated.Value(0)).current;
  const c2 = useRef(new Animated.Value(0)).current;
  const sq = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade,{ toValue:1,duration:1500,useNativeDriver:true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(c1,{ toValue:1,duration:2000,useNativeDriver:true }),
        Animated.timing(c1,{ toValue:0,duration:2000,useNativeDriver:true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(c2,{ toValue:1,duration:2500,useNativeDriver:true }),
        Animated.timing(c2,{ toValue:0,duration:2500,useNativeDriver:true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sq,{ toValue:1,duration:3000,useNativeDriver:true }),
        Animated.timing(sq,{ toValue:0,duration:3000,useNativeDriver:true }),
      ])
    ).start();

    setTimeout(()=>{
      user ? router.replace("/(tabs)") : router.replace("/Login/LoginScreen");
    },2500);
  },[]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.shape,styles.circle1,{opacity:c1}]}/>
      <Animated.View style={[styles.shape,styles.circle2,{opacity:c2}]}/>
      <Animated.View style={[styles.shape,styles.square,{opacity:sq}]}/>

      <Animated.View style={[styles.logoContainer,{opacity:fade}]}>
        <Image source={require("../assets/images/logoBlanco.png")} style={styles.logo}/>
      </Animated.View>

      <Text style={styles.title}>¡Bienvenido a Conecta Servicios!</Text>
      <Text style={styles.subtitle}>Encuentra y conecta con los mejores servicios cerca de ti</Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Versión 1.0</Text>
        <Text style={styles.footerText}>© 2025 Conecta Servicios</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#111"},
  shape:{position:"absolute",borderRadius:50},
  circle1:{width:100,height:100,backgroundColor:"#D4B500",top:10,left:20},
  circle2:{width:120,height:120,backgroundColor:"#B48A00",top:120,left:-50},
  square:{width:100,height:100,backgroundColor:"#9A6D00",top:180,right:-50},
  logoContainer:{marginBottom:40},logo:{width:200,height:200},
  title:{fontSize:28,fontWeight:"bold",color:"#fff",marginTop:10,textAlign:'center'},
  subtitle:{color:"#ccc",fontSize:14,textAlign:"center",width:"80%",marginTop:6},
  footer:{position:"absolute",bottom:15,alignItems:"center"},
  footerText:{color:"#777",fontSize:12},
});
