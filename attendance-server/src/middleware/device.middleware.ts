import { Context, Next } from "@oak/oak";
import { decryptDeviceInfo } from "../utils/device-crypto.ts";

/**
 * Decrypts the X-Device-Info header and attaches the result to ctx.state.deviceInfo.
 * Returns 400 if the header is missing or decryption fails.
 */
export function decryptDevice() {
  return async (ctx: Context, next: Next) => {
    const header = ctx.request.headers.get("X-Device-Info");
    if (!header) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing X-Device-Info header" };
      return;
    }

    try {
      ctx.state.deviceInfo = await decryptDeviceInfo(header);
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : "Invalid X-Device-Info header",
      };
      return;
    }

    await next();
  };
}
