import { Router } from "express";
import { AuthMiddleware } from "../../../core/middlewares/auth.middleware.js";
import { requireAdmin, requireWorker } from "../../../core/middlewares/permission.middleware.js";
import { avatarUploadMiddleware } from "../../../core/middlewares/upload.middleware.js";
import { validateSchemaMiddleware } from "../../../core/middlewares/validation.middleware.js";
import { WorkerController } from "../controllers/worker.controller.js";
import {
  RegisterWorkerSchema,
  ToggleWorkerStatusSchema,
  UpdateWorkerAdminSchema,
  UpdateWorkerSelfSchema,
} from "../validators/worker.validator.js";

export const workerRoutes = Router();

workerRoutes.use(AuthMiddleware);

workerRoutes.get("/me", requireWorker(), (req, res, next) =>
  void WorkerController.getMe(req, res, next),
);

workerRoutes.patch(
  "/me",
  requireWorker(),
  avatarUploadMiddleware,
  validateSchemaMiddleware(UpdateWorkerSelfSchema),
  (req, res, next) => void WorkerController.updateMe(req, res, next),
);

workerRoutes.get("/", requireAdmin(), (req, res, next) =>
  void WorkerController.listAll(req, res, next),
);

workerRoutes.post(
  "/",
  requireAdmin(),
  validateSchemaMiddleware(RegisterWorkerSchema),
  (req, res, next) => void WorkerController.register(req, res, next),
);

workerRoutes.get("/:publicId", requireAdmin(), (req, res, next) =>
  void WorkerController.getById(req, res, next),
);

workerRoutes.put(
  "/:publicId",
  requireAdmin(),
  validateSchemaMiddleware(UpdateWorkerAdminSchema),
  (req, res, next) => void WorkerController.updateAdmin(req, res, next),
);

workerRoutes.patch(
  "/:publicId/status",
  requireAdmin(),
  validateSchemaMiddleware(ToggleWorkerStatusSchema),
  (req, res, next) => void WorkerController.toggleStatus(req, res, next),
);

workerRoutes.delete("/:publicId", requireAdmin(), (req, res, next) =>
  void WorkerController.remove(req, res, next),
);
