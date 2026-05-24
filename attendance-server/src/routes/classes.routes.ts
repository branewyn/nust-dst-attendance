import { Router } from "@oak/oak";
import * as classes from "../controllers/classes.controller.ts";
import { authenticate, requireRole } from "../middleware/auth.middleware.ts";

const router = new Router({ prefix: "/api/v1/classes" });

const guard = [authenticate(), requireRole("LECTURER")];

router.post("/", ...guard, classes.createClass);
router.get("/", ...guard, classes.listClasses);
router.get("/:id", ...guard, classes.getClass);
router.put("/:id", ...guard, classes.updateClass);
router.delete("/:id", ...guard, classes.deleteClass);
router.get("/:id/attendance", ...guard, classes.getAttendance);
router.get("/:id/report", ...guard, classes.downloadReport);
router.post("/:id/push-admin", ...guard, classes.pushAdmin);

export default router;
