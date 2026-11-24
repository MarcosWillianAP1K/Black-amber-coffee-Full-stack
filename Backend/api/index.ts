import { Router } from "express";
import { healthRoutes } from "./health/routes/health.routes.js";
import { authRoutes } from "./auth/routes/auth.routes.js";
import { workerRoutes } from "./worker/routes/worker.routes.js";
import { userRoutes } from "./user/routes/user.routes.js";
import { productRoutes } from "./product/routes/product.routes.js";
import { inventoryRoutes } from "./inventory/routes/inventory.routes.js";
import { orderRoutes } from "./order/routes/order.routes.js";
import { cartRoutes } from "./cart/routes/cart.routes.js";
import { paymentRoutes } from "./payment/routes/payment.routes.js";
import { analyticsRoutes } from "./analytics/routes/analytics.routes.js";

export const apiRouter = Router();

apiRouter.use("/", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/workers", workerRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/inventory", inventoryRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/cart", cartRoutes);
apiRouter.use("/payments", paymentRoutes);
apiRouter.use("/analytics", analyticsRoutes);
