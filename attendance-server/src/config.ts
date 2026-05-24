function required(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

export const config = {
  port: Number(Deno.env.get("PORT") ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessTtlMinutes: Number(Deno.env.get("JWT_ACCESS_TTL_MINUTES") ?? 15),
  jwtRefreshTtlDays: Number(Deno.env.get("JWT_REFRESH_TTL_DAYS") ?? 7),
  qrHmacSecret: required("QR_HMAC_SECRET"),
  deviceEncryptionKey: required("DEVICE_ENCRYPTION_KEY"),
  adminStoreUrl: Deno.env.get("ADMIN_STORE_URL") ?? "",
  adminStoreApiKey: Deno.env.get("ADMIN_STORE_API_KEY") ?? "",
  corsOrigin: Deno.env.get("CORS_ORIGIN") ?? "http://localhost:5173",
};
