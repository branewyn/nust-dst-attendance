import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth.api.ts";
import type { User } from "../types/index.ts";

interface AuthContextValue {
  user: Pick<User, "id" | "full_name" | "role"> | null;
  loginFn: (email: string, password: string) => Promise<void>;
  registerLecturerFn: (data: {
    full_name: string;
    staff_number: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logoutFn: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): Pick<User, "id" | "full_name" | "role"> | null {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Pick<User, "id" | "full_name" | "role"> | null>(loadUser);

  const loginFn = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const registerLecturerFn = useCallback(
    async (formData: { full_name: string; staff_number: string; email: string; password: string }) => {
      const { data } = await authApi.registerLecturer(formData);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    },
    []
  );

  const logoutFn = useCallback(async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    }
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loginFn, registerLecturerFn, logoutFn, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
