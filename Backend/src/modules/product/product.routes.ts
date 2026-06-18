import { Router } from "express";
import ProductController from "./product.controller";
import ProductService from "./product.service";
import ProductRepository from "./product.repository";
import { db } from "@/config/database";
import { createPublicProductRoutes } from "./routes/product.public.routes";
import { createAdminProductRoutes } from "./routes/product.admin.routes";

const productRoutes = Router();

// ============================================================
// Initialize dependencies (single instance for all sub-routers)
// ============================================================
const productRepo = new ProductRepository(db);
const productSvc = new ProductService(productRepo);
const productCtrl = new ProductController(productSvc);

// ============================================================
// Mount sub-routers by context (role)
// ============================================================

// Public product routes: GET /products, GET /products/categories
productRoutes.use(createPublicProductRoutes(productCtrl));

// Admin product routes:  /admin/products/...
productRoutes.use(createAdminProductRoutes(productCtrl));

export { productRoutes };
