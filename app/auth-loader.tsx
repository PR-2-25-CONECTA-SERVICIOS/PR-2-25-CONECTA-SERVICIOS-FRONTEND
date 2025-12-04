import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthLoader() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setShowSplash(false), 2000);
    }
  }, [loading]);

  if (loading || showSplash) {
    return (
      <Redirect href="/Splash" />
    );
  }

  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/inicio/LoginScreen" />;
}
