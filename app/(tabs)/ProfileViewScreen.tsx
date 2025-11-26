import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import ProfileViewScreenContent from "./../ProfileViewScreenContent";

export default function ProfileViewScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 1️⃣ Loading real
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  // 2️⃣ Sin usuario → redirigir, NUNCA return null
  if (!user || !user._id) {
    router.replace("/(tabs)/Login/LoginScreen");
    return null; // pero solo después de redirigir
  }

  // 3️⃣ Key del usuario está PERFECTO
  return <ProfileViewScreenContent key={user._id} />;
}
