import { Router } from "express";
import { healthRoutes } from "@/modules/health/health.routes";
import { authRoutes } from "@/modules/auth/auth.routes";
import { createOrderRoutes } from "@/modules/order/routes/order.routes";
import { createProductRoutes } from "@/modules/product/routes/product.routes";
import { createWorkerRoutes } from "@/modules/worker/routes/worker.routes";
import { createUserRoutes } from "@/modules/user/routes/user.routes";
import { createAnalyticsRoutes } from "@/modules/analytics/analytics.routes";
import setupSwagger from "@/shared/swagger";

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

// ============================================================
// BASE ROUTES (no prefix changes)
// ============================================================
routes.use("/api", healthRoutes);
routes.use("/api", authRoutes);

// ============================================================
// UNIFIED ROUTES
// ============================================================

// Unified Order Routes: /api/orders/*
routes.use("/api/orders", createOrderRoutes(orderCtrl));

// Unified Product Routes: /api/products/*
routes.use("/api/products", createProductRoutes(productCtrl));

// Unified Worker Routes: /api/workers/*
routes.use("/api/workers", createWorkerRoutes());

// Unified User/Client Routes: /api/users/*
routes.use("/api/users", createUserRoutes());

// Analytics routes: /api/analytics/* (admin only)
routes.use("/api", createAnalyticsRoutes());

// ============================================================
// Swagger Docs
// ============================================================
setupSwagger(routes);

export default routes;
