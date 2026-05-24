import { Context, Next } from "@oak/oak";
import { verifyAccessToken } from "../utils/jwt.ts";

/**
 * Verifies the Bearer token and attaches userId + userRole to ctx.state.
 */
export function authenticate() {
  return async (ctx: Context, next: Next) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Missing or invalid Authorization header" };
      return;
    }

    const token = authHeader.slice(7);
    try {
      const payload = await verifyAccessToken(token);
      ctx.state.userId = payload.sub;
      ctx.state.userRole = payload.role;
    } catch {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid or expired access token" };
      return;
    }

    await next();
  };
}

/**
 * Guards a route to the specified roles only.
 */
export function requireRole(...roles: string[]) {
  return async (ctx: Context, next: Next) => {
    if (!roles.includes(ctx.state.userRole)) {
      ctx.response.status = 403;
      ctx.response.body = { error: "Forbidden" };
      return;
    }
    await next();
  };
}
