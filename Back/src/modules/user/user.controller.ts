import userService from "@/modules/user/user.service";
import {
  GetUserResponseSchema,
  UpdateUserResponseSchema,
  UserUpdateInputSchema,
} from "@/modules/user/user.schema";
import { Request, Response } from "express";
import helpers from "@/shared/helpers";

function handleError(res: Response, err: unknown) {
  const code = err instanceof Error ? err.message : "INTERNAL_ERROR";

  const mapped = helpers[code] ?? {
    status: 500,
    message: "Erro interno no servidor.",
  };

  return res.status(mapped.status).json({
    error: {
      code: mapped.status === 500 ? "INTERNAL_ERROR" : code,
      message: mapped.message,
    },
  });
}

export default class userController {
  private userService: userService;

  constructor(userService: userService) {
    this.userService = userService;
  }

  /**
   * GET /user/me
   * Retrieve authenticated user details
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await this.userService.get(publicId);

      const response = GetUserResponseSchema.parse({
        data: user,
      });

      res.status(200).json(response);
    } catch (error) {
      handleError(res, error);
    }
  }

  /**
   * PATCH /user/me
   * Update authenticated user information
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const currentUser = await this.userService.get(publicId);
      const avatarBuffer = req.file?.buffer;
      const fullName = req.body.fullName ?? req.body.name ?? currentUser.name;

      const data = UserUpdateInputSchema.parse({
        fullName,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        profile: {
          fullName,
          phone: req.body.phone ?? currentUser.profile.phone,
          avatarBuffer,
          avatarImage: currentUser.profile.avatarImage,
          createdAt: currentUser.profile.createdAt,
          updatedAt: currentUser.profile.updatedAt,
        },
      });

      const updatedUser = await this.userService.updateClient(publicId, data);

      const response = UpdateUserResponseSchema.parse({
        data: updatedUser,
        message: "User updated successfully",
      });

      res.status(200).json(response);
    } catch (error) {
      handleError(res, error);
    }
  }

  /**
   * DELETE /user/me
   * Delete authenticated user and all related data
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      await this.userService.deleteClient(publicId);

      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  }
}
