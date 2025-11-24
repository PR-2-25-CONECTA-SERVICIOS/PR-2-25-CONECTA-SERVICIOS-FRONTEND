import { useAuth } from "../../context/AuthContext";
import ProfileViewScreenContent from "./../ProfileViewScreenContent";

export default function ProfileViewScreen() {
  const { user, loading } = useAuth();

  // 1️⃣ Si AuthContext aún está cargando → mostrar loader, no null
  if (loading) {
    return null;
  }

  // 2️⃣ Si terminó de cargar y NO hay usuario → mandar a login
  if (!user || !user._id) {
    return null; // expo-router redirige solo
  }

  // 3️⃣ Este key es PERFECTO y NO se debe tocar
  return <ProfileViewScreenContent key={user._id} />;
}
