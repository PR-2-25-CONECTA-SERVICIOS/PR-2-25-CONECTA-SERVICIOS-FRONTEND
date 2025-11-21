import { useRouter } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { clearUserSession, loadUserSession, saveUserSession } from "../utils/secureStore";

type AuthContextType = {
  user: any;
  login: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  setUser: (u: any) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🚀 Cargar sesión solo una vez
  useEffect(() => {
    (async () => {
      try {
        const session = await loadUserSession();
        setUser(session ?? null);
      } finally {
        setLoading(false); // RootLayout listo
      }
    })();
  }, []);

const login = async (userData: any) => {
  await saveUserSession(userData);

  // 🔥 Recargar sesión real desde secureStore
  const newSession = await loadUserSession();
  setUser(newSession);

  router.replace("/(tabs)");
};


const logout = async () => {
  await clearUserSession();
  setUser(null);
  router.replace("/Login/LoginScreen");
};


  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;
