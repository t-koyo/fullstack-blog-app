/**
 * Controller層の設計原則
 *
 * 1. HTTPリクエスト/レスポンスの処理のみ
 * 2. ビジネスロジックはServiceに委譲
 * 3. 適切なステータスコードの設定
 * 4. エラーハンドリング
 */

import { Request, Response, NextFunction } from "express";
import { postService } from "../services/postService.js";
import { CreatePostDto, UpdatePostDto } from "../types/post.js";

export class PostController {
  //     GET /api/posts
  //     記事一覧取得（ページネーション付き）

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const keyword = req.query.keyword as string | undefined;
      const tag = req.query.tag as string | undefined;

      const keywordExists = keyword && keyword.trim() !== "";
      const tagExists = tag && tag.trim() !== "";

      //   検索がある場合
      if (keywordExists || tagExists) {
        // 💡 サービス層に渡す
        const posts = await postService.searchPosts(keyword, tag);
        return res.json({
          success: true,
          data: posts,
        });
      }
      // 通常の一覧取得（ページネーション）
      const result = await postService.getAllPosts({ page, limit });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/posts/:id
   * 記事詳細取得
   */

  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await postService.getPostById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: "Post not found",
        });
      }
      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/posts
   * 記事作成
   */
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: 認証実装後、実際のユーザーIDを使用
      const authorId = req.body.tempAuthorId || "temp-user-id";
      const data: CreatePostDto = req.body;

      const post = await postService.createPost(authorId, data);

      res.status(201).json({
        success: true,
        data: post,
        message: "Post created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/posts/:id
   * 記事更新
   */

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      //TO認証から取得
      const authorId = req.body.tempAuthorId || "temp-user-id";
      const data: UpdatePostDto = req.body;

      const post = await postService.updatePost(id, authorId, data);

      res.json({
        success: true,
        data: post,
        message: "Post updated successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Post not found") {
          return res.status(404).json({
            success: false,
            error: error.message,
          });
        }
        if (error.message.includes("Unauthorized")) {
          return res.status(403).json({
            success: false,
            error: error.message,
          });
        }
      }
      next(error);
    }
  }

  /**
   * DELETE /api/posts/:id
   * 記事削除
   */
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // TODO: 認証から取得
      const authorId = req.body.tempAuthorId || "temp-user-id";

      await postService.deletePost(id, authorId);

      res.json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Post not found") {
          return res.status(404).json({
            success: false,
            error: error.message,
          });
        }
        if (error.message.includes("Unauthorized")) {
          return res.status(403).json({
            success: false,
            error: error.message,
          });
        }
      }
      next(error);
    }
  }

  /**
   * GET /api/posts/author/:authorId
   * ユーザーの記事一覧
   */

  async getPostByAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const { authorId } = req.params;
      const posts = await postService.getPostsByAuthor(authorId);

      res.json({
        success: true,
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
