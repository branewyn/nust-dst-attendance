import { encodeBase64, decodeBase64 } from "@std/encoding/base64";
import { config } from "../config.ts";

export interface QrPayload {
  class_id: string;
  challenge_required: boolean;
  iat: number;
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.qrHmacSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signQrToken(
  classId: string,
  challengeRequired: boolean
): Promise<string> {
  const payload: QrPayload = {
    class_id: classId,
    challenge_required: challengeRequired,
    iat: Math.floor(Date.now() / 1000),
  };
  const data = JSON.stringify(payload);
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  const dataB64 = encodeBase64(new TextEncoder().encode(data));
  const sigB64 = encodeBase64(new Uint8Array(sig));
  return `${dataB64}.${sigB64}`;
}

export async function verifyQrToken(token: string): Promise<QrPayload> {
  const dotIdx = token.indexOf(".");
  if (dotIdx === -1) throw new Error("Invalid QR token format");

  const dataB64 = token.slice(0, dotIdx);
  const sigB64 = token.slice(dotIdx + 1);

  const dataBytes = decodeBase64(dataB64);
  const sigBytes = decodeBase64(sigB64);

  const key = await getHmacKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    dataBytes
  );
  if (!valid) throw new Error("Invalid QR token signature");

  const data = new TextDecoder().decode(dataBytes);
  return JSON.parse(data) as QrPayload;
}
