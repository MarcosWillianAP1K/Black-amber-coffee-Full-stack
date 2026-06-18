import { Router } from "express";
import OrderController from "./order.controller";
import OrderService from "./order.service";
import OrderRepository from "./order.repository";
import OrderHistoryRepository from "./history/orderHistory.repository";
import WorkerRepository from "@/modules/worker/worker.repository";
import UserRepository from "@/modules/user/user.repository";
import ProductRepository from "@/modules/product/product.repository";
import { db } from "@/config/database";
import { createUserOrderRoutes } from "./routes/order.user.routes";
import { createWorkerOrderRoutes } from "./routes/order.worker.routes";

const orderRoutes = Router();

// ============================================================
// Initialize dependencies (single instance for all sub-routers)
// ============================================================
const orderRepo = new OrderRepository(db);
const orderHistoryRepo = new OrderHistoryRepository(db);
const workerRepo = new WorkerRepository(db);
const userRepo = new UserRepository(db);
const productRepo = new ProductRepository(db);

const orderSvc = new OrderService(
  orderRepo,
  workerRepo,
  orderHistoryRepo,
  userRepo,
  productRepo,
);
const orderCtrl = new OrderController(orderSvc);

// ============================================================
// Mount sub-routers by context (role)
// ============================================================

// User order routes:  POST/GET /user/orders/...
orderRoutes.use(createUserOrderRoutes(orderCtrl));

// Worker order routes: GET/PATCH /worker/orders/...
orderRoutes.use(createWorkerOrderRoutes(orderCtrl));

export { orderRoutes };
