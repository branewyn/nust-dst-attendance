import { Context } from "@oak/oak";
import * as adminService from "../services/admin.service.ts";
import { pushToAdmin } from "../services/admin-push.service.ts";

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

export async function listUsers(ctx: Context) {
  const role = ctx.request.url.searchParams.get("role") ?? undefined;
  ctx.response.body = { users: await adminService.listUsers(role) };
}

export async function getUser(ctx: Context) {
  const user = await adminService.getUser(ctx.params.id);
  if (!user) { ctx.response.status = 404; ctx.response.body = { error: "User not found" }; return; }
  ctx.response.body = user;
}

export async function updateUser(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    const updated = await adminService.updateUser(ctx.params.id, body);
    if (!updated) { ctx.response.status = 404; ctx.response.body = { error: "User not found" }; return; }
    ctx.response.body = updated;
  } catch (err) { handleError(ctx, err); }
}

export async function deleteUser(ctx: Context) {
  const deleted = await adminService.deleteUser(ctx.params.id);
  if (!deleted) { ctx.response.status = 404; ctx.response.body = { error: "User not found" }; return; }
  ctx.response.status = 204;
}

export async function createAdmin(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    const { full_name, email, password } = body;
    if (!full_name || !email || !password) {
      ctx.response.status = 422;
      ctx.response.body = { error: "full_name, email, and password are required" };
      return;
    }
    const user = await adminService.createAdmin(full_name, email, password);
    ctx.response.status = 201;
    ctx.response.body = user;
  } catch (err) { handleError(ctx, err); }
}

export async function listAllClasses(ctx: Context) {
  ctx.response.body = { classes: await adminService.listAllClasses() };
}

export async function listAllAttendance(ctx: Context) {
  const classId = ctx.request.url.searchParams.get("class_id") ?? undefined;
  ctx.response.body = { records: await adminService.listAllAttendance(classId) };
}

export async function getClassAttendance(ctx: Context) {
  const records = await adminService.listAllAttendance(ctx.params.id);
  ctx.response.body = { records };
}

export async function listPushLogs(ctx: Context) {
  ctx.response.body = { logs: await adminService.listPushLogs() };
}

export async function triggerPush(ctx: Context) {
  try {
    // Admin can push for any class — use class lecturer_id lookup
    const { queryOne } = await import("../db.ts");
    const cls = await queryOne<{ lecturer_id: string }>(
      "SELECT lecturer_id FROM classes WHERE id = $1",
      [ctx.params.id]
    );
    if (!cls) { ctx.response.status = 404; ctx.response.body = { error: "Class not found" }; return; }
    const result = await pushToAdmin(ctx.params.id, cls.lecturer_id);
    ctx.response.body = result;
  } catch (err) { handleError(ctx, err); }
}
