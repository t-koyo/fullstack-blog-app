import { userRepository } from "../repositories/userRepository.js";
import { RegisterDto, User, UserResponseDto } from "../types/user.js";
import * as crypto from "crypto";

class UserService {
  // ユーザー登録
  async register(data: RegisterDto): Promise<UserResponseDto> {
    // バリデーション
    this.validateRegisterData(data);

    // メールアドレスの重複チェック
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // パスワードハッシュ化（仮実装）
    // 後でbcryptに置き換え
    const hashedPassword = this.hashPassword(data.password);
    const user = await userRepository.create({
      ...data,
      hashedPassword,
    });

    return this.toResponseDto(user);
  }

  //   ユーザー取得
  async getUserById(id: string): Promise<UserResponseDto | null> {
    const user = await userRepository.findById(id);
    if (!user) return null;

    return this.toResponseDto(user);
  }

  //   プロフィール更新

  async updateProfile(
    id: string,
    data: { name?: string; bio?: string; avatar?: string }
  ): Promise<UserResponseDto> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updated = await userRepository.update(id, data);
    if (!updated) {
      throw new Error("Failed to update user");
    }

    return this.toResponseDto(updated);
  }

  // バリデーション
  private validateRegisterData(data: RegisterDto): void {
    // メールアドレス
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("'Invalid email format'");
    }

    // パスワード
    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    if (data.password.length > 100) {
      throw new Error("Password must be less than 100 characters");
    }

    // 名前
    if (!data.name.trim()) {
      throw new Error("Name is required");
    }
    if (data.name.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }
    if (data.name.length > 50) {
      throw new Error("Name must be less thann 50 characters");
    }
  }

  //   パスワードハッシュ化（仮実装）
  private hashPassword(password: string): string {
    // TODO: bcryptに置き換え
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  // User型をUserResponseDto型に変換
  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
    };
  }
}

export const userService = new UserService();
