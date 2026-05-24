import { Router } from "@oak/oak";
import * as admin from "../controllers/admin.controller.ts";
import { authenticate, requireRole } from "../middleware/auth.middleware.ts";

const router = new Router({ prefix: "/api/v1/admin" });

const guard = [authenticate(), requireRole("ADMIN")];

router.get("/users", ...guard, admin.listUsers);
router.post("/users", ...guard, admin.createAdmin);
router.get("/users/:id", ...guard, admin.getUser);
router.put("/users/:id", ...guard, admin.updateUser);
router.delete("/users/:id", ...guard, admin.deleteUser);

router.get("/classes", ...guard, admin.listAllClasses);
router.get("/classes/:id/attendance", ...guard, admin.getClassAttendance);
router.post("/classes/:id/push-admin", ...guard, admin.triggerPush);

router.get("/attendance", ...guard, admin.listAllAttendance);
router.get("/push-logs", ...guard, admin.listPushLogs);

export default router;
