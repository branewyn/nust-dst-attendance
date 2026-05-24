import { Router } from "@oak/oak";
import * as attendance from "../controllers/attendance.controller.ts";
import { authenticate, requireRole } from "../middleware/auth.middleware.ts";
import { decryptDevice } from "../middleware/device.middleware.ts";

const router = new Router({ prefix: "/api/v1/attendance" });

router.post(
  "/",
  authenticate(),
  requireRole("STUDENT"),
  decryptDevice(),
  attendance.capture
);

router.get(
  "/history",
  authenticate(),
  requireRole("STUDENT"),
  attendance.history
);

export default router;
