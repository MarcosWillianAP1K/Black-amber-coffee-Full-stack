import { Router } from "express";
import userController from "@/modules/user/user.controller";
import userService from "@/modules/user/user.service";
import userRepository from "@/modules/user/user.repository";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { avatarUploadMiddleware } from "@/shared/middlewares/upload.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import { UserUpdateRequestSchema } from "@/modules/user/user.schema";
import { db } from "@/config/database";

const userRoutes = Router();

// Initialize dependencies
const userRepo = new userRepository(db);
const userSvc = new userService(userRepo);
const userCtrl = new userController(userSvc);

// Rota de compatibilidade retroativa (backward compatibility)
// As docs oficiais estão em user/routes/user.routes.ts
userRoutes.get("/user/me", AuthMiddleware, (req, res, next) =>
  userCtrl.getById(req, res, next),
);

userRoutes.put(
  "/user/me",
  AuthMiddleware,
  avatarUploadMiddleware,
  validationMiddleware(UserUpdateRequestSchema),
  (req, res, next) => userCtrl.update(req, res, next),
);

userRoutes.delete("/user/me", AuthMiddleware, (req, res, next) =>
  userCtrl.delete(req, res, next),
);

export { userRoutes };
