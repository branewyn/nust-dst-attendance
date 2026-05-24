import { Router } from "@oak/oak";
import * as auth from "../controllers/auth.controller.ts";
import { decryptDevice } from "../middleware/device.middleware.ts";

const router = new Router({ prefix: "/api/v1/auth" });

router.post("/register/student", decryptDevice(), auth.registerStudent);
router.post("/register/lecturer", auth.registerLecturer);
router.post("/login", auth.login);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);

export default router;
