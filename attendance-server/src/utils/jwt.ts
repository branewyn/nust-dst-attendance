import { create, verify, getNumericDate } from "@zaubrik/djwt";
import { config } from "../config.ts";

export interface AccessPayload {
  sub: string;
  role: string;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createAccessToken(userId: string, role: string): Promise<string> {
  const key = await importHmacKey(config.jwtAccessSecret);
  return create(
    { alg: "HS256", typ: "JWT" },
    { sub: userId, role, exp: getNumericDate(config.jwtAccessTtlMinutes * 60) },
    key
  );
}

export async function verifyAccessToken(token: string): Promise<AccessPayload> {
  const key = await importHmacKey(config.jwtAccessSecret);
  const payload = await verify(token, key);
  return { sub: payload.sub as string, role: payload.role as string };
}

export async function createRefreshToken(userId: string): Promise<string> {
  const key = await importHmacKey(config.jwtRefreshSecret);
  return create(
    { alg: "HS256", typ: "JWT" },
    { sub: userId, exp: getNumericDate(config.jwtRefreshTtlDays * 24 * 60 * 60) },
    key
  );
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string }> {
  const key = await importHmacKey(config.jwtRefreshSecret);
  const payload = await verify(token, key);
  return { sub: payload.sub as string };
}
