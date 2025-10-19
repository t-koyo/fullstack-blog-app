import { Request, Response, NextFunction } from "express";
import { RegisterDto } from "../types/user.js";
import { userService } from "../services/userService.js";

export class UserController {
  /**
   * POST /api/users/register
   * ユーザー登録
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RegisterDto = req.body;
      const user = await userService.register(data);

      res.status(201).json({
        success: true,
        data: user,
        message: "User registered successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Email already exists") {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * ユーザー情報取得
   */
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id
   * プロフィール更新
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const user = await userService.updateProfile(id, data);

      res.json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }
}

export const userController = new UserController();
