import { Context, Next } from "@oak/oak";
import { config } from "../config.ts";

export function cors() {
  return async (ctx: Context, next: Next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", config.corsOrigin);
    ctx.response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    ctx.response.headers.set(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, X-Device-Info"
    );
    ctx.response.headers.set("Access-Control-Allow-Credentials", "true");

    if (ctx.request.method === "OPTIONS") {
      ctx.response.status = 204;
      return;
    }
    await next();
  };
}
