import { Router } from "express";
import { postController } from "../controllers/postController.js";

const router = Router();

/**
 * REST API設計原則
 *
 * リソース指向: URLは名詞、HTTPメソッドは動詞
 *
 * GET    /posts         - 一覧取得
 * GET    /posts/:id     - 詳細取得
 * POST   /posts         - 作成
 * PUT    /posts/:id     - 更新
 * DELETE /posts/:id     - 削除
 */

router.get("/", postController.getPosts.bind(postController));
router.get("/:id", postController.getPost.bind(postController));
router.post("/", postController.createPost.bind(postController));
router.put("/:id", postController.updatePost.bind(postController));
router.delete("/:id", postController.deletePost.bind(postController));

// 追加ルート
router.get(
  "/author/:authorId",
  postController.getPostByAuthor.bind(postController)
);
export default router;
