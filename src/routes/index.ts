import { Router } from "express";
import postRoutes from "./postRoutes.js";
import userRoutes from "./userRoutes.js";
import commentRoutes from "./commentRoutes.js";

const router = Router();

router.use("/posts", postRoutes);
router.use("/users", userRoutes);
router.use("/comments", commentRoutes);

export default router;
