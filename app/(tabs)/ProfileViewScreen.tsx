import { useAuth } from "../../context/AuthContext";
import ProfileViewScreenContent from "./../ProfileViewScreenContent";

export default function ProfileViewScreen() {
  const { user } = useAuth();

  // Si no hay usuario cargado aún, evita renderizar basura
  if (!user || !user._id) return null;

  // 🔥 Esta línea es la que soluciona tu problema:
  // Cada vez que cambia el ID del usuario, React REMONTA toda la pantalla
  return <ProfileViewScreenContent key={user._id} />;
}
