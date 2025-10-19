import { Request, Response, NextFunction } from "express";
import { commentService } from "../services/commentService.js";
import { CreateCommentDto } from "../types/comment.js";

export class CommentController {
  /**
   * GET /api/posts/:postId/comments
   * 記事のコメント一覧
   */
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const comments = await commentService.getCommentsByPostId(postId);

      res.json({
        success: true,
        data: comments,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Post not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * POST /api/comments
   * コメント作成
   */
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: 認証から取得
      const authorId = req.body.tempAuthorId || "temp-user-id";
      const data: CreateCommentDto = req.body;

      const comment = await commentService.createComment(authorId, data);

      res.status(201).json({
        success: true,
        data: comment,
        message: "Commnet created successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * PUT /api/comments/:id
   * コメント更新
   */
  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // TODO: 認証から取得
      const authorId = req.body.tempAuthorId || "temp-user-id";
      const { content } = req.body;

      const comment = await commentService.updateComment(id, authorId, content);

      res.json({
        success: true,
        data: comment,
        message: "Comment updated successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
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
   * DELETE /api/comments/:id
   * コメント削除
   */
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // TODO: 認証から取得
      const authorId = req.body.tempAuthorId || "temp-user-id";

      await commentService.deleteComment(id, authorId);

      res.json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Comment not found") {
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
}

export const commentController = new CommentController();
