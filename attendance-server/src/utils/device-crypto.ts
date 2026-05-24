import { decodeBase64 } from "@std/encoding/base64";
import { config } from "../config.ts";

export interface DeviceInfo {
  device_fingerprint: string;
  device_model: string;
  os: string;
  os_version: string;
  app_version: string;
}

let _key: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (_key) return _key;
  const keyBytes = hexToBytes(config.deviceEncryptionKey);
  if (keyBytes.length !== 32) {
    throw new Error("DEVICE_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }
  _key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  return _key;
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex string length");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Decrypts an X-Device-Info header value.
 * Expected format: base64(IV[12 bytes] || ciphertext+tag)
 */
export async function decryptDeviceInfo(headerValue: string): Promise<DeviceInfo> {
  let raw: Uint8Array;
  try {
    raw = decodeBase64(headerValue);
  } catch {
    throw new Error("X-Device-Info is not valid base64");
  }

  if (raw.length <= 12) {
    throw new Error("X-Device-Info payload too short");
  }

  const iv = raw.slice(0, 12);
  const ciphertext = raw.slice(12);

  const key = await getKey();
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  } catch {
    throw new Error("Failed to decrypt X-Device-Info — invalid key or tampered data");
  }

  const json = new TextDecoder().decode(plaintext);
  try {
    return JSON.parse(json) as DeviceInfo;
  } catch {
    throw new Error("Decrypted device info is not valid JSON");
  }
}
