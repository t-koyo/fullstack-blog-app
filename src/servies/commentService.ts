import { throwDeprecation } from "process";
import { commentReposititory } from "../repositories/commentRepository";
import { postRepository } from "../repositories/postRepository";
import {
  Comment,
  CommentResponseDto,
  CreateCommentDto,
} from "../types/comment";
import { userRepository } from "../repositories/userRepository";

class CommentService {
  // 記事のコメント一覧取得
  async getCommentsByPostId(postId: string): Promise<CommentResponseDto[]> {
    // 記事の存在確認
    const post = await postRepository.findById(postId);
    if (!post || post.status !== "published") {
      throw new Error("Post not found");
    }

    const comments = await commentReposititory.findByPostId(postId);
    return Promise.all(comments.map((comment) => this.toResponseDto(comment)));
  }

  //   コメント作成

  async createComment(
    authorId: string,
    data: CreateCommentDto
  ): Promise<CommentResponseDto> {
    // 記事の存在確認
    const post = await postRepository.findById(data.postId);
    if (!post || post.status !== "published") {
      throw new Error("Post not found");
    }

    // バリデーション
    if (!data.content.trim()) {
      throw new Error("Comment content is required");
    }
    if (data.content.length < 1 || data.content.length > 1000) {
      throw new Error("Comment must be between 1 and 1000 characters");
    }

    const comment = await commentReposititory.create({
      ...data,
      authorId,
    });
    return this.toResponseDto(comment);
  }

  //   コメント更新
  async updateComment(
    id: string,
    authorId: string,
    content: string
  ): Promise<CommentResponseDto> {
    const comment = await commentReposititory.findById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // ビジネスルール: 作成者のみ編集可能
    if (comment.authorId !== authorId) {
      throw new Error("Unauthorized: You can only edit your own comments");
    }

    // バリデーション
    if (!content.trim()) {
      throw new Error("Comment content is required");
    }
    if (content.length < 1 || content.length > 1000) {
      throw new Error("Comment must be between 1 and 1000 characters");
    }

    const updated = await commentReposititory.update(id, content);
    if (!updated) {
      throw new Error("Failed to update comment");
    }

    return this.toResponseDto(updated);
  }

  //   コメント削除
  async deleteComment(id: string, authorId: string): Promise<void> {
    const comment = await commentReposititory.findById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // 作成者のみ削除可能
    if (comment.authorId !== authorId) {
      throw new Error("Unauthorized: You can only delete your own comments");
    }

    const deleted = await commentReposititory.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete comment");
    }
  }
  //   Comment型をCommentResponseDto型に変換

  private async toResponseDto(comment: Comment): Promise<CommentResponseDto> {
    const author = await userRepository.findById(comment.authorId);

    return {
      id: comment.id,
      postId: comment.postId,
      author: {
        id: author?.id || "",
        name: author?.name || "Unknown User",
        avatar: author?.avatar,
      },
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }
}

export const commentService = new CommentService();
