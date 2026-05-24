import { Context } from "@oak/oak";
import * as classesService from "../services/classes.service.ts";
import { generateAttendancePdf } from "../services/pdf.service.ts";
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

export async function createClass(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    const { class_code, subject_name, venue, scheduled_at, challenge_code } = body;
    if (!class_code || !subject_name || !scheduled_at) {
      ctx.response.status = 422;
      ctx.response.body = { error: "class_code, subject_name, and scheduled_at are required" };
      return;
    }
    const cls = await classesService.createClass(
      ctx.state.userId,
      class_code,
      subject_name,
      venue ?? null,
      scheduled_at,
      challenge_code
    );
    ctx.response.status = 201;
    ctx.response.body = cls;
  } catch (err) {
    handleError(ctx, err);
  }
}

export async function listClasses(ctx: Context) {
  ctx.response.body = { classes: await classesService.listClasses(ctx.state.userId) };
}

export async function getClass(ctx: Context) {
  const classId = ctx.params.id;
  const cls = await classesService.getClass(classId, ctx.state.userId);
  if (!cls) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Class not found" };
    return;
  }
  ctx.response.body = cls;
}

export async function updateClass(ctx: Context) {
  try {
    const classId = ctx.params.id;
    const body = await ctx.request.body.json();
    const updated = await classesService.updateClass(classId, ctx.state.userId, body);
    if (!updated) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Class not found" };
      return;
    }
    ctx.response.body = updated;
  } catch (err) {
    handleError(ctx, err);
  }
}

export async function deleteClass(ctx: Context) {
  const classId = ctx.params.id;
  const deleted = await classesService.deleteClass(classId, ctx.state.userId);
  if (!deleted) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Class not found" };
    return;
  }
  ctx.response.status = 204;
}

export async function getAttendance(ctx: Context) {
  const classId = ctx.params.id;
  const flaggedOnly = ctx.request.url.searchParams.get("flagged") === "true";
  const result = await classesService.getAttendanceForClass(classId, ctx.state.userId, flaggedOnly);
  if (!result) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Class not found" };
    return;
  }
  ctx.response.body = result;
}

export async function downloadReport(ctx: Context) {
  try {
    const classId = ctx.params.id;
    const pdfBytes = await generateAttendancePdf(classId, ctx.state.userId);
    if (!pdfBytes) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Class not found" };
      return;
    }
    ctx.response.headers.set("Content-Type", "application/pdf");
    ctx.response.headers.set(
      "Content-Disposition",
      `attachment; filename="attendance-${classId}.pdf"`
    );
    ctx.response.body = pdfBytes;
  } catch (err) {
    handleError(ctx, err);
  }
}

export async function pushAdmin(ctx: Context) {
  try {
    const classId = ctx.params.id;
    const result = await pushToAdmin(classId, ctx.state.userId);
    ctx.response.body = result;
  } catch (err) {
    handleError(ctx, err);
  }
}
