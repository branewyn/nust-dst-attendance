import { api } from "./client.ts";
import type { AuthTokens } from "../types/index.ts";

export const registerLecturer = (data: {
  full_name: string;
  staff_number: string;
  email: string;
  password: string;
}) => api.post<AuthTokens>("/auth/register/lecturer", data);

export const login = (email: string, password: string) =>
  api.post<AuthTokens>("/auth/login", { email, password });

export const logout = (refreshToken: string) =>
  api.post("/auth/logout", { refresh_token: refreshToken });
