import client from "./client";
import type { AuthTokens } from "../types";
import { getDeviceInfoHeader } from "../utils/device";

export async function registerStudent(payload: {
  full_name: string;
  student_number: string;
  email: string;
  password: string;
}): Promise<AuthTokens> {
  const deviceHeader = await getDeviceInfoHeader();
  const { data } = await client.post<AuthTokens>("/auth/register/student", payload, {
    headers: { "X-Device-Info": deviceHeader },
  });
  return data;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await client.post<AuthTokens>("/auth/login", { email, password });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await client.post("/auth/logout", { refresh_token: refreshToken });
}
