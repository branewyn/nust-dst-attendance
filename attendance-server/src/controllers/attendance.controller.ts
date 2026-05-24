import { Context } from "@oak/oak";
import * as attendanceService from "../services/attendance.service.ts";
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

export async function capture(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    const { qr_token, challenge_code, latitude, longitude } = body;

    if (!qr_token) {
      ctx.response.status = 422;
      ctx.response.body = { error: "qr_token is required" };
      return;
    }
    if (latitude == null || longitude == null) {
      ctx.response.status = 422;
      ctx.response.body = { error: "latitude and longitude are required" };
      return;
    }

    const device = ctx.state.deviceInfo as DeviceInfo;
    const result = await attendanceService.captureAttendance(
      ctx.state.userId,
      qr_token,
      challenge_code,
      Number(latitude),
      Number(longitude),
      device
    );
    ctx.response.status = 201;
    ctx.response.body = result;
  } catch (err) {
    handleError(ctx, err);
  }
}

export async function history(ctx: Context) {
  const records = await attendanceService.getAttendanceHistory(ctx.state.userId);
  ctx.response.body = { records };
}
