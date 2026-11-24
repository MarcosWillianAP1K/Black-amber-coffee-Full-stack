import { Router } from "express";
import { AuthMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requireAdmin } from "../../../core/middlewares/permission.middleware.js";
import { avatarUploadMiddleware } from "../../../core/middlewares/upload.middleware.js";
import { validateSchemaMiddleware } from "../../../core/middlewares/validation.middleware.js";
import { UserController } from "../controllers/user.controller.js";
import {
  ToggleUserStatusSchema,
  UpdateUserAdminSchema,
  UpdateUserSelfSchema,
} from "../validators/user.validator.js";

export const userRoutes = Router();

userRoutes.use(AuthMiddleware);

userRoutes.get("/me", (req, res, next) => void UserController.getMe(req, res, next));

userRoutes.put(
  "/me",
  avatarUploadMiddleware,
  validateSchemaMiddleware(UpdateUserSelfSchema),
  (req, res, next) => void UserController.updateMe(req, res, next),
);

userRoutes.delete("/me", (req, res, next) => void UserController.deleteMe(req, res, next));

userRoutes.get("/", requireAdmin(), (req, res, next) =>
  void UserController.listAll(req, res, next),
);

userRoutes.get("/:publicId", requireAdmin(), (req, res, next) =>
  void UserController.getById(req, res, next),
);

userRoutes.put(
  "/:publicId",
  requireAdmin(),
  validateSchemaMiddleware(UpdateUserAdminSchema),
  (req, res, next) => void UserController.updateAdmin(req, res, next),
);

userRoutes.patch(
  "/:publicId/status",
  requireAdmin(),
  validateSchemaMiddleware(ToggleUserStatusSchema),
  (req, res, next) => void UserController.toggleStatus(req, res, next),
);

userRoutes.delete("/:publicId", requireAdmin(), (req, res, next) =>
  void UserController.remove(req, res, next),
);
