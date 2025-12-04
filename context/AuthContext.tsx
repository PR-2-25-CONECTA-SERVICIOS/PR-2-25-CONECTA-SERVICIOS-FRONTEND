// context/AuthContext.tsx
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { clearUserSession, loadUserSession, saveUserSession } from "../utils/secureStore";

type AuthContextType = {
  user: any;
  loading: boolean;
  login: (u: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (v: any) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null); // 👈 nunca undefined
  const [loading, setLoading] = useState(true);

  // 🔥 Cargar sesión 1 sola vez
  useEffect(() => {
    (async () => {
      try {
        const session = await loadUserSession();
        setUser(session); // null o user pero nunca undefined
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (userData: any) => {
    await saveUserSession(userData);
    const newSession = await loadUserSession();
    setUser(newSession); // 👈 solo actualiza estado, NO navega
  };

  const logout = async () => {
    await clearUserSession();
    setUser(null); // 👈 solo cambia estado, NO navega
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;
