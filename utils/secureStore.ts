import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "USER_SESSION";

export async function saveUserSession(user: any) {

  const fixed = {
    ...user,
    id: user._id,   // 👈 GUARDA TAMBIÉN id
    _id: user._id,  // 👈 Y GUARDA _id
  };

  const value = JSON.stringify(fixed);

  if (Platform.OS === "web") {
    localStorage.setItem(KEY, value);
  } else {
    await SecureStore.setItemAsync(KEY, value);
  }
}


export async function loadUserSession() {
  if (Platform.OS === "web") {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : null;
  } else {
    const stored = await SecureStore.getItemAsync(KEY);
    return stored ? JSON.parse(stored) : null;
  }
}

export async function clearUserSession() {
  if (Platform.OS === "web") {
    localStorage.removeItem(KEY);
  } else {
    await SecureStore.deleteItemAsync(KEY);
  }
}
