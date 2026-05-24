import { Context } from "@oak/oak";
import * as authService from "../services/auth.service.ts";
import type { DeviceInfo } from "../utils/device-crypto.ts";

function handleError(ctx: Context, err: unknown) {
  if (err && typeof err === "object" && "status" in err) {
    const e = err as { status: number; message: string };
    ctx.response.status = e.status;
    ctx.response.body = { error: e.message };
  } else {
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

export async function registerStudent(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    const { full_name, student_number, email, password } = body;
    if (!full_name || !student_number || !email || !password) {
      ctx.response.status = 422;
      ctx.response.body = { error: "full_name, student_number, email, and password are required" };
      return;
    }
    const device = ctx.state.deviceInfo as DeviceInfo;
    const tokens = await authService.registerStudent(full_name, student_number, email, password, device);
    ctx.response.status = 201;
    ctx.response.body = tokens;
  } catch (err) {
    handleError(ctx, err);
  }
}

export async function registerLecturer(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    const { full_name, staff_number, email, password } = body;
    if (!full_name || !staff_number || !email || !password) {
      ctx.response.status = 422;
      ctx.response.body = { error: "full_name, staff_number, email, and password are required" };
      return;
    }
    const tokens = await authService.registerLecturer(full_name, staff_number, email, password);
    ctx.response.status = 201;
    ctx.response.body = tokens;
  } catch (err) {
    handleError(ctx, err);
  }
}

export async function login(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    const { email, password } = body;
    if (!email || !password) {
      ctx.response.status = 422;
      ctx.response.body = { error: "email and password are required" };
      return;
    }
    ctx.response.body = await authService.login(email, password);
  } catch (err) {
    handleError(ctx, err);
  }
}

export async function refresh(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    if (!body.refresh_token) {
      ctx.response.status = 422;
      ctx.response.body = { error: "refresh_token is required" };
      return;
    }
    ctx.response.body = await authService.refresh(body.refresh_token);
  } catch (err) {
    handleError(ctx, err);
  }
}

export async function logout(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    if (!body.refresh_token) {
      ctx.response.status = 422;
      ctx.response.body = { error: "refresh_token is required" };
      return;
    }
    await authService.logout(body.refresh_token);
    ctx.response.body = { message: "Logged out" };
  } catch (err) {
    handleError(ctx, err);
  }
}
