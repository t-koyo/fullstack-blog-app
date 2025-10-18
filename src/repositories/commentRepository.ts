import { Comment, CreateCommentDto } from "../types/comment";
import { v4 as uuidv4 } from "uuid";

class CommentReposititory {
  private comments: Comment[] = [];

  async findAll(): Promise<Comment[]> {
    return [...this.comments];
  }

  async findById(id: string): Promise<Comment | null> {
    return this.comments.find((comment) => comment.id === id) || null;
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return this.comments.filter((comment) => comment.postId === postId);
  }

  async findByAuthorId(authorId: string): Promise<Comment[]> {
    return this.comments.filter((comment) => comment.authorId === authorId);
  }

  async create(
    data: CreateCommentDto & { authorId: string }
  ): Promise<Comment> {
    const now = new Date();

    const comment: Comment = {
      id: uuidv4(),
      postId: data.postId,
      authorId: data.authorId,
      content: data.content,
      createdAt: now,
      updatedAt: now,
    };

    this.comments.push(comment);
    return comment;
  }

  async update(id: string, content: string): Promise<Comment | null> {
    const index = this.comments.findIndex((comment) => comment.id === id);
    if (index === -1) return null;

    const now = new Date();
    this.comments[index] = {
      ...this.comments[index],
      content,
      updatedAt: now,
    };
    return this.comments[index];
  }

  async delete(postId: string): Promise<number> {
    const initaiLength = this.comments.length;
    this.comments = this.comments.filter(
      (comment) => comment.postId !== postId
    );
    return initaiLength - this.comments.length;
  }
}

export const commentReposititory = new CommentReposititory();
