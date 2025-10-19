/**
 * Service層の設計原則
 *
 * 1. ビジネスロジックの実装
 * 2. バリデーション
 * 3. 複数Repositoryの組み合わせ
 * 4. エラーハンドリング
 */

import { postRepository } from "../repositories/postRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { PaginatedResponse, PaginationQuery } from "../types/api.js";
import {
  CreatePostDto,
  Post,
  PostResponseDto,
  UpdatePostDto,
} from "../types/post.js";

class PostService {
  /**
   * 公開記事一覧取得（ページネーション付き）
   */
  async getAllPosts(
    query: PaginationQuery
  ): Promise<PaginatedResponse<PostResponseDto>> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    // ビジネスルール: limitは最大50
    const validatedLimit = Math.min(limit, 50);

    const { posts, total } = await postRepository.findWthPagination(
      page,
      validatedLimit,
      "published"
    );

    const data = await Promise.all(
      posts.map((post) => this.toResponseDto(post))
    );
    return {
      success: true,
      data,
      pagination: {
        page,
        limit: validatedLimit,
        total,
        totalPages: Math.ceil(total / validatedLimit),
        hasNext: page * validatedLimit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 記事詳細取得
   */
  async getPostById(id: string): Promise<PostResponseDto | null> {
    const post = await postRepository.findById(id);
    if (!post) return null;

    // ビジネスルール: 公開済みまたは自分の記事のみ閲覧可能
    // （認証実装後に条件追加）
    if (post.status !== "published") {
      return null;
    }
    return this.toResponseDto(post);
  }

  /**
   * 記事作成
   */
  async createPost(
    authorId: string,
    data: CreatePostDto
  ): Promise<PostResponseDto> {
    // バリデーション
    this.validatePostData(data);

    const post = await postRepository.create({
      ...data,
      authorId,
    });

    return this.toResponseDto(post);
  }

  /**
   * 記事更新
   */
  async updatePost(
    id: string,
    authorId: string,
    data: UpdatePostDto
  ): Promise<PostResponseDto> {
    const post = await postRepository.findById(id);

    if (!post) {
      throw new Error("Post not found");
    }

    // ビジネスルール: 作成者のみ編集可能
    if (post.authorId !== authorId) {
      throw new Error("Unauthorized: You can only edit your own posts");
    }

    // バリデーション
    if (data.title !== undefined || data.content !== undefined) {
      this.validatePostData({
        title: data.title || post.title,
        content: data.content || post.content,
        status: data.status || post.status,
      });
    }

    const updated = await postRepository.update(id, data);
    if (!updated) {
      throw new Error("Failed to update post");
    }

    return this.toResponseDto(updated);
  }

  /**
   * 記事削除
   */
  async deletePost(id: string, authorId: string): Promise<void> {
    const post = await postRepository.findById(id);

    if (!post) {
      throw new Error("Post not found");
    }

    // ビジネスルール: 作成者のみ削除可能
    if (post.authorId !== authorId) {
      throw new Error("Unauthorized: You can only delete your own posts");
    }
    const deleted = await postRepository.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete post");
    }
  }

  /**
   * 記事検索
   */
  async searchPosts(
    keyword?: string,
    tag?: string
  ): Promise<PostResponseDto[]> {
    let posts;

    if (keyword) {
      posts = await postRepository.searchByKeyword(keyword);
    } else if (tag) {
      posts = await postRepository.searchByTag(tag);
    } else {
      const allPosts = await postRepository.findByStatus("published");
      posts = allPosts;
    }

    return Promise.all(posts.map((post) => this.toResponseDto(post)));
  }

  /**
   * ユーザーの記事一覧取得
   */
  async getPostsByAuthor(authorId: string): Promise<PostResponseDto[]> {
    const posts = await postRepository.findByAuthorId(authorId);

    // 公開記事のみ
    const publishedPosts = posts.filter((post) => post.status === "published");

    return Promise.all(publishedPosts.map((post) => this.toResponseDto(post)));
  }

  /**
   * バリデーション
   */

  private validatePostData(data: CreatePostDto | UpdatePostDto): void {
    // タイトルバリデーション
    if ("title" in data && data.title !== undefined) {
      if (!data.title.trim()) {
        throw new Error("Title is required");
      }
      if (data.title.length < 3) {
        throw new Error("Title must be at least 3 characters");
      }
      if (data.title.length > 200) {
        throw new Error("Title must be less than 200 characters");
      }
    }

    // 本文のバリデーション
    if ("content" in data && data.content !== undefined) {
      if (!data.content.trim()) {
        throw new Error("Content is required");
      }
      if (data.content.length < 10) {
        throw new Error("Content must be at least 10 characters");
      }
      if (data.content.length > 200) {
        throw new Error("Titke must be less than 50000 characters");
      }
    }

    // タグのバリデーション
    if ("tags" in data && data.tags !== undefined) {
      if (data.tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }

      // 各タグの長さチェック
      for (const tag of data.tags) {
        if (tag.length < 1 || tag.length > 30) {
          throw new Error("Each tag must be between 1 and 30 characters");
        }
      }
    }
  }
  /**
   * Post型をPostResponseDto型に変換
   * 作成者情報も含める
   */
  private async toResponseDto(post: Post): Promise<PostResponseDto> {
    const author = await userRepository.findById(post.authorId);

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: {
        id: author?.id || "",
        name: author?.name || "Unknown User",
        avatar: author?.avatar,
      },
      tags: post.tags,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() || null,
      status: post.status,
    };
  }
}
export const postService = new PostService();
