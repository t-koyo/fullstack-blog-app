import { Router } from "express";
import { userController } from "../controllers/userController.js";

const router = Router();

router.post("/register", userController.register.bind(userController));
router.get("/:id", userController.getUser.bind(userController));
router.put("/:id", userController.updateProfile.bind(userController));

export default router;
