import { Application } from "@oak/oak";
import { cors } from "./middleware/cors.middleware.ts";
import authRouter from "./routes/auth.routes.ts";
import classesRouter from "./routes/classes.routes.ts";
import attendanceRouter from "./routes/attendance.routes.ts";
import adminRouter from "./routes/admin.routes.ts";

export function createApp(): Application {
  const app = new Application();

  app.use(cors());

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.error("Unhandled error:", err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  });

  app.use(authRouter.routes());
  app.use(authRouter.allowedMethods());

  app.use(classesRouter.routes());
  app.use(classesRouter.allowedMethods());

  app.use(attendanceRouter.routes());
  app.use(attendanceRouter.allowedMethods());

  app.use(adminRouter.routes());
  app.use(adminRouter.allowedMethods());

  app.use((ctx) => {
    ctx.response.status = 404;
    ctx.response.body = { error: "Not found" };
  });

  return app;
}
