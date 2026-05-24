import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as authApi from "../api/auth.api";
import type { User, AuthTokens } from "../types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loginFn: (email: string, password: string) => Promise<void>;
  registerStudentFn: (payload: { full_name: string; student_number: string; email: string; password: string }) => Promise<void>;
  logoutFn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function storeTokens(tokens: AuthTokens) {
  await SecureStore.setItemAsync("access_token", tokens.access_token);
  await SecureStore.setItemAsync("refresh_token", tokens.refresh_token);
  await SecureStore.setItemAsync("user", JSON.stringify(tokens.user));
}

async function clearTokens() {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
  await SecureStore.deleteItemAsync("user");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("user").then((raw) => {
      if (raw) setUser(JSON.parse(raw));
    }).finally(() => setReady(true));
  }, []);

  const loginFn = async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    await storeTokens(tokens);
    setUser(tokens.user);
  };

  const registerStudentFn = async (payload: { full_name: string; student_number: string; email: string; password: string }) => {
    const tokens = await authApi.registerStudent(payload);
    await storeTokens(tokens);
    setUser(tokens.user);
  };

  const logoutFn = async () => {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch { /* best effort */ }
    }
    await clearTokens();
    setUser(null);
  };

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginFn, registerStudentFn, logoutFn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
