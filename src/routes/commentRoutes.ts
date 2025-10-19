import { Router } from "express";
import { commentController } from "../controllers/commentController.js";

const router = Router();

// 記事コメント一覧
router.get(
  "/posts/:postId/comments",
  commentController.getComments.bind(commentController)
);

// コメントCRUD
router.post("/", commentController.createComment.bind(commentController));
router.put("/:id", commentController.updateComment.bind(commentController));
router.delete("/:id", commentController.deleteComment.bind(commentController));

export default router;
