import { Router } from "express";
import { healthRoutes } from "@/modules/health/health.routes";
import { authRoutes } from "@/modules/auth/auth.routes";
import { userRoutes } from "@/modules/user/user.routes";
import { workerRoutes } from "@/modules/worker/worker.routes";
import { orderRoutes } from "@/modules/order/order.routes";
import { productRoutes } from "@/modules/product/product.routes";
import { adminRoutes } from "@/modules/admin/admin.routes";
import setupSwagger from "@/shared/swagger";

const routes = Router();

routes.use("/api", healthRoutes);
routes.use("/api", authRoutes);
routes.use("/api", userRoutes);
routes.use("/api", workerRoutes);
routes.use("/api", orderRoutes);
routes.use("/api", productRoutes);
routes.use("/api", adminRoutes);

setupSwagger(routes);

export default routes;
