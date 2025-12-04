// app/(tabs)/ProfileViewScreen.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import ProfileViewScreenContent from "../ProfileViewScreenContent";

export default function ProfileViewScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🟡 Mientras carga auth mostramos loading
  if (loading) return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#000"}}>
      <ActivityIndicator size="large" color="#fbbf24"/>
    </View>
  );

  // 🔴 Si no hay usuario -> SACARLO DE TABS AUTOMÁTICO
  useEffect(()=>{
    if(!user){
      router.replace("/Login/LoginScreen");
    }
  },[user]);

  // ⛔ Evitar acceder a user._id si no existe
  if(!user) return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#000"}}>
      <ActivityIndicator size="large" color="#fbbf24"/>
    </View>
  );

  // 🟢 Si hay sesión → mostrar contenido real del perfil
  return <ProfileViewScreenContent key={user._id}/>;
}
