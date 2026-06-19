import { Router } from "express";
import { healthRoutes } from "@/modules/health/health.routes";
import { authRoutes } from "@/modules/auth/auth.routes";
import { userRoutes } from "@/modules/user/user.routes";
import { adminRoutes } from "@/modules/admin/admin.routes";
import { createOrderRoutes } from "@/modules/order/routes/order.routes";
import { createProductRoutes } from "@/modules/product/routes/product.routes";
import { createWorkerRoutes } from "@/modules/worker/routes/worker.routes";
import { createUserRoutes } from "@/modules/user/routes/user.routes";
import { createUserOrderRoutes } from "@/modules/order/routes/order.user.routes";
import { createWorkerOrderRoutes } from "@/modules/order/routes/order.worker.routes";
import { createAdminProductRoutes } from "@/modules/product/routes/product.admin.routes";
import { createAnalyticsRoutes } from "@/modules/analytics/analytics.routes";
import setupSwagger from "@/shared/swagger";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import { WorkerUpdateRequestSchema } from "@/modules/worker/worker.schema";
import validationMiddleware from "@/shared/middlewares/validation.middleware";

// Shared dependencies for controllers
import { db } from "@/config/database";
import OrderController from "@/modules/order/order.controller";
import OrderService from "@/modules/order/order.service";
import OrderRepository from "@/modules/order/order.repository";
import OrderHistoryRepository from "@/modules/order/history/orderHistory.repository";
import WorkerRepository from "@/modules/worker/worker.repository";
import UserRepository from "@/modules/user/user.repository";
import ProductRepository from "@/modules/product/product.repository";
import ProductController from "@/modules/product/product.controller";
import ProductService from "@/modules/product/product.service";
import WorkerController from "@/modules/worker/worker.controller";
import WorkerService from "@/modules/worker/worker.service";

const routes = Router();

// ============================================================
// Shared instances
// ============================================================
const orderRepo = new OrderRepository(db);
const orderHistoryRepo = new OrderHistoryRepository(db);
const workerRepo = new WorkerRepository(db);
const userRepo = new UserRepository(db);
const productRepo = new ProductRepository(db);

const orderSvc = new OrderService(orderRepo, workerRepo, orderHistoryRepo, userRepo, productRepo);
const orderCtrl = new OrderController(orderSvc);

const productSvc = new ProductService(productRepo);
const productCtrl = new ProductController(productSvc);

const workerSvc = new WorkerService(workerRepo);
const workerCtrl = new WorkerController(workerSvc);

// ============================================================
// BASE ROUTES (no prefix changes)
// ============================================================
routes.use("/api", healthRoutes);
routes.use("/api", authRoutes);

// ============================================================
// NEW UNIFIED ROUTES - Workers and Admins share same paths
// ============================================================

// Unified Order Routes: /api/orders/*
// Accessible by workers and admins (permission checked in middleware)
routes.use("/api", createOrderRoutes(orderCtrl));

// Unified Product Routes: /api/products/*
// List/get accessible by all authenticated; mutations require admin
routes.use("/api", createProductRoutes(productCtrl));

// Unified Worker Routes: /api/workers/*
// /me (worker/admin), CRUD (admin only)
// Login é via POST /auth/login (unificado)
routes.use("/api/workers", createWorkerRoutes());

// Unified User/Client Routes: /api/users/*
// /me (authenticated client), CRUD (admin only)
routes.use("/api/users", createUserRoutes());

// ============================================================
// BACKWARD COMPATIBILITY - Keep old routes working
// ============================================================

// Worker old-style order routes: /api/worker/orders/*
routes.use("/api", createWorkerOrderRoutes(orderCtrl));

// User old-style order routes: /api/user/orders/*
routes.use("/api", createUserOrderRoutes(orderCtrl));

// Worker old-style profile routes
routes.get("/api/worker/get/me", AuthMiddleware, (req, res, next) => workerCtrl.getById(req, res, next));
routes.patch("/api/worker/update/me", AuthMiddleware, validationMiddleware(WorkerUpdateRequestSchema), (req, res, next) => workerCtrl.update(req, res, next));

// Admin old-style routes: /api/admin/workers/*, /api/admin/products/*
routes.use("/api", adminRoutes);
routes.use("/api", createAdminProductRoutes(productCtrl));

// Analytics routes: /api/analytics/* (admin only)
routes.use("/api", createAnalyticsRoutes());

// User old-style profile routes: /api/user/me/*
routes.use("/api", userRoutes);

// ============================================================
// Swagger Docs
// ============================================================
setupSwagger(routes);

export default routes;
