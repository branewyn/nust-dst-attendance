import { query, queryOne } from "../db.ts";
import { hashPassword, verifyPassword } from "../utils/hash.ts";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.ts";
import type { DeviceInfo } from "../utils/device-crypto.ts";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  active: boolean;
  password_hash: string;
}

export async function registerStudent(
  fullName: string,
  studentNumber: string,
  email: string,
  password: string,
  device: DeviceInfo
) {
  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM users WHERE email = $1 OR student_number = $2",
    [email, studentNumber]
  );
  if (existing) throw { status: 409, message: "Email or student number already registered" };

  const hash = await hashPassword(password);
  const [user] = await query<{ id: string }>(
    `INSERT INTO users (email, password_hash, full_name, role, student_number)
     VALUES ($1, $2, $3, 'STUDENT', $4) RETURNING id`,
    [email, hash, fullName, studentNumber]
  );

  await query(
    `INSERT INTO devices (user_id, device_fingerprint, device_model, os, os_version, app_version)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      user.id,
      device.device_fingerprint,
      device.device_model,
      device.os,
      device.os_version,
      device.app_version,
    ]
  );

  return issueTokens(user.id, "STUDENT");
}

export async function registerLecturer(
  fullName: string,
  staffNumber: string,
  email: string,
  password: string
) {
  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM users WHERE email = $1 OR staff_number = $2",
    [email, staffNumber]
  );
  if (existing) throw { status: 409, message: "Email or staff number already registered" };

  const hash = await hashPassword(password);
  const [user] = await query<{ id: string }>(
    `INSERT INTO users (email, password_hash, full_name, role, staff_number)
     VALUES ($1, $2, $3, 'LECTURER', $4) RETURNING id`,
    [email, hash, fullName, staffNumber]
  );

  return issueTokens(user.id, "LECTURER");
}

export async function login(email: string, password: string) {
  const user = await queryOne<User>(
    "SELECT id, email, full_name, role, active, password_hash FROM users WHERE email = $1",
    [email]
  );
  if (!user) throw { status: 401, message: "Invalid credentials" };
  if (!user.active) throw { status: 403, message: "Account is deactivated" };

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw { status: 401, message: "Invalid credentials" };

  const tokens = await issueTokens(user.id, user.role);
  return {
    ...tokens,
    user: { id: user.id, full_name: user.full_name, role: user.role },
  };
}

export async function refresh(refreshToken: string) {
  let sub: string;
  try {
    const payload = await verifyRefreshToken(refreshToken);
    sub = payload.sub;
  } catch {
    throw { status: 401, message: "Invalid or expired refresh token" };
  }

  const tokenHash = await digestSha256(refreshToken);
  const stored = await queryOne<{ user_id: string; revoked: boolean; role: string }>(
    `SELECT rt.user_id, rt.revoked, u.role
     FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1`,
    [tokenHash]
  );

  if (!stored || stored.revoked || stored.user_id !== sub) {
    throw { status: 401, message: "Refresh token not found or revoked" };
  }

  const accessToken = await createAccessToken(sub, stored.role);
  return { access_token: accessToken };
}

export async function logout(refreshToken: string) {
  const tokenHash = await digestSha256(refreshToken);
  await query(
    "UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1",
    [tokenHash]
  );
}

async function issueTokens(userId: string, role: string) {
  const accessToken = await createAccessToken(userId, role);
  const refreshToken = await createRefreshToken(userId);
  const tokenHash = await digestSha256(refreshToken);

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [userId, tokenHash]
  );

  return { access_token: accessToken, refresh_token: refreshToken };
}

async function digestSha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
