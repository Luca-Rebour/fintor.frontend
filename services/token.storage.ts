import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "auth.jwt";
let inMemoryAuthToken: string | null = null;

export async function saveAuthToken(token: string): Promise<void> {
  try {
    if (typeof SecureStore.setItemAsync === "function") {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      return;
    }
  } catch {
  }

  inMemoryAuthToken = token;
}

export async function getAuthToken(): Promise<string | null> {
  try {
    if (typeof SecureStore.getItemAsync === "function") {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token) {
        return token;
      }
    }
  } catch {
  }

  return inMemoryAuthToken;
}

export async function clearAuthToken(): Promise<void> {
  try {
    if (typeof SecureStore.deleteItemAsync === "function") {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    }
  } catch {
  }

  inMemoryAuthToken = null;
}
