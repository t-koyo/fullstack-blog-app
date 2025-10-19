/**
 * 記事に関する型定義
 *
 * 設計方針:
 * - DB層の型（Post）は全てのフィールドを持つ
 * - DTO（Data Transfer Object）で入出力を制御
 * - レスポンスDTOでは機密情報を除外
 */

// 記事
export type Post = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  status: "draft" | "published";
};

// 作成時のDTO: IDとタイムスタンプは自動生成
export type CreatePostDto = {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  status: "draft" | "published";
};

// 更新時のDTO:　Pertial(全てのデータをオプショナルに変更)
export type UpdatePostDto = Partial<CreatePostDto>;

// レスポンスDTO: 作成者情報を含む
export type PostResponseDto = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  status: "draft" | "published";
};
