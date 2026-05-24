/**
 * Collect device fingerprint info and return an AES-256-GCM encrypted
 * X-Device-Info header value.
 *
 * Format: base64( IV[12 bytes] || ciphertext+authTag )
 *
 * DEVICE_ENCRYPTION_KEY must be a 64-char hex string (32 bytes) matching
 * the server's DEVICE_ENCRYPTION_KEY environment variable.
 */

import * as Device from "expo-device";
import * as Application from "expo-application";

// ─── IMPORTANT ───────────────────────────────────────────────────────────────
// Replace with the actual 64-char hex key used in your server .env file.
// For production, inject this via expo-constants / EAS build secret.
const DEVICE_ENCRYPTION_KEY_HEX = "0000000000000000000000000000000000000000000000000000000000000000";
// ─────────────────────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  const binary = Array.from(bytes).map((b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const keyBytes = hexToBytes(DEVICE_ENCRYPTION_KEY_HEX);
  cachedKey = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
  return cachedKey;
}

export interface DeviceInfo {
  deviceId: string | null;
  deviceName: string | null;
  osName: string | null;
  osVersion: string | null;
  brand: string | null;
  modelName: string | null;
  appVersion: string | null;
}

export async function collectDeviceInfo(): Promise<DeviceInfo> {
  return {
    deviceId: Application.androidId ?? (await Application.getIosIdForVendorAsync()) ?? null,
    deviceName: Device.deviceName ?? null,
    osName: Device.osName ?? null,
    osVersion: Device.osVersion ?? null,
    brand: Device.brand ?? null,
    modelName: Device.modelName ?? null,
    appVersion: Application.nativeApplicationVersion ?? null,
  };
}

export async function getDeviceInfoHeader(): Promise<string> {
  const info = await collectDeviceInfo();
  const plaintext = new TextEncoder().encode(JSON.stringify(info));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);
  return bytesToBase64(combined);
}
