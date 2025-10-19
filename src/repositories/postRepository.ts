import { v4 as uuidv4 } from "uuid";
import type { CreatePostDto, Post, UpdatePostDto } from "../types/post.js";

/**
 * Repository層の設計原則
 *
 * 1. データアクセスのみに責務を限定
 * 2. ビジネスロジックは含めない
 * 3. 将来的にPrismaに置き換え可能な設計
 */

class PostRepository {
  private posts: Post[] = [];

  //   全記事取得
  async findAll(): Promise<Post[]> {
    return [...this.posts];
  }

  //   ID指定で取得
  async findById(id: string): Promise<Post | null> {
    return this.posts.find((post) => post.id === id) || null;
  }

  //   作成者IDで取得
  async findByAuthorId(authorId: string): Promise<Post[]> {
    return this.posts.filter((post) => post.authorId === authorId);
  }

  //   ステータスで取得
  async findByStatus(status: "draft" | "published"): Promise<Post[]> {
    return this.posts.filter((post) => post.status === status);
  }

  // ページネーション付き取得
  async findWthPagination(
    page: number,
    limit: number,
    status?: "draft" | "published"
  ): Promise<{ posts: Post[]; total: number }> {
    let filteredPosts = this.posts;

    if (status) {
      filteredPosts = filteredPosts.filter((post) => post.status === status);
    }

    const total = filteredPosts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      posts: filteredPosts.slice(startIndex, endIndex),
      total,
    };
  }

  // 記事作成
  async create(data: CreatePostDto & { authorId: string }): Promise<Post> {
    const now = new Date();
    const post: Post = {
      id: uuidv4(),
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || this.generateExcerpt(data.content),
      authorId: data.authorId,
      tags: data.tags || [],
      status: data.status,
      publishedAt: data.status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    this.posts.push(post);
    return post;
  }

  //   記事更新
  async update(id: string, data: UpdatePostDto): Promise<Post | null> {
    const index = this.posts.findIndex((post) => post.id === id);
    if (index === -1) return null;

    const post = this.posts[index];
    const now = new Date();

    const updated: Post = {
      ...post,
      ...data,
      updatedAt: now,
      publishedAt:
        data.status === "published" && post.status === "draft"
          ? now
          : post.publishedAt,
    };

    this.posts[index] = updated;
    return updated;
  }

  // 記事削除
  async delete(id: string): Promise<boolean> {
    const index = this.posts.findIndex((post) => post.id === id);
    if (index === -1) return false;

    this.posts.splice(index, 1);
    return true;
  }

  // タグ検索

  async searchByTag(tag: string): Promise<Post[]> {
    return this.posts.filter(
      (post) => post.tags.includes(tag) && post.status === "published"
    );
  }

  // キーワードで検索（タイトルと本文）
  async searchByKeyword(keyword: string): Promise<Post[]> {
    const lowerKeyword = keyword.toLowerCase();
    return this.posts.filter(
      (post) =>
        (post.title.toLowerCase().includes(lowerKeyword) ||
          post.content.toLowerCase().includes(lowerKeyword)) &&
        post.status === "published"
    );
  }

  // 本文から要約を自動生成

  private generateExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  }
}

export const postRepository = new PostRepository();
