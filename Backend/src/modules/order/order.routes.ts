import { Router } from "express";
import OrderController from "./order.controller";
import OrderService from "./order.service";
import OrderRepository from "./order.repository";
import OrderHistoryRepository from "./history/orderHistory.repository";
import WorkerRepository from "@/modules/worker/worker.repository";
import UserRepository from "@/modules/user/user.repository";
import ProductRepository from "@/modules/product/product.repository";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import {
  CreateOrderRequestSchema,
  GetOrdersByStatusRequestSchema,
  UpdateOrderStatusRequestSchema,
} from "./order.schema";
import { db } from "@/config/database";

const orderRoutes = Router();

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
// User Order Routes (authenticated user)
// ============================================================

/**
 * @swagger
 * /api/user/orders:
 *   post:
 *     summary: Criar um novo pedido para o usuário autenticado
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: number
 *                     quantity:
 *                       type: number
 *                     observation:
 *                       type: string
 *                       nullable: true
 *               paymentMethod:
 *                 type: string
 *               observation:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                     code:
 *                       type: string
 *                     status:
 *                       type: string
 *                     totalPrice:
 *                       type: number
 *                     paymentMethod:
 *                       type: string
 *                       nullable: true
 *                     observation:
 *                       type: string
 *                       nullable: true
 *                     itens:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Não encontrado
 */
orderRoutes.post(
  "/user/orders",
  AuthMiddleware,
  validationMiddleware(CreateOrderRequestSchema),
  (req, res, next) => orderCtrl.create(req, res, next),
);

/**
 * @swagger
 * /api/user/orders/{publicId}/cancel:
 *   post:
 *     summary: Cancelar um pedido do usuário autenticado
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                     code:
 *                       type: string
 *                     status:
 *                       type: string
 *                     totalPrice:
 *                       type: number
 *                     paymentMethod:
 *                       type: string
 *                       nullable: true
 *                     observation:
 *                       type: string
 *                       nullable: true
 *                     itens:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 */

orderRoutes.post(
  "/user/orders/:publicId/cancel",
  AuthMiddleware,
  (req, res, next) => orderCtrl.cancelOrder(req, res, next),
);

/**
 * @swagger
 * /api/user/orders:
 *   get:
 *     summary: Listar pedidos do usuário por status
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - PENDING
 *             - IN PROGRESS
 *             - COMPLETED
 *             - LATE
 *             - CANCELLED
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       publicId:
 *                         type: string
 *                       code:
 *                         type: string
 *                       status:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *                       paymentMethod:
 *                         type: string
 *                         nullable: true
 *                       observation:
 *                         type: string
 *                         nullable: true
 *                       itens:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: number
 *                             name:
 *                               type: string
 *                             price:
 *                               type: number
 *                             quantity:
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       401:
 *         description: Não autorizado
 */
orderRoutes.get(
  "/user/orders",
  AuthMiddleware,
  validationMiddleware(GetOrdersByStatusRequestSchema, "query"),
  (req, res, next) => orderCtrl.getByStatus(req, res, next),
);

// ============================================================
// Worker Order Routes (authenticated worker)
// ============================================================

/**
 * @swagger
 * /api/worker/orders/{publicId}:
 *   get:
 *     summary: Buscar pedido por ID (worker)
 *     tags:
 *       - Orders (Worker)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                     code:
 *                       type: string
 *                     status:
 *                       type: string
 *                     totalPrice:
 *                       type: number
 *                     paymentMethod:
 *                       type: string
 *                       nullable: true
 *                     observation:
 *                       type: string
 *                       nullable: true
 *                     itens:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                           observation:
 *                             type: string
 *                             nullable: true
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 */
orderRoutes.get("/worker/orders/:publicId", AuthMiddleware, (req, res, next) =>
  orderCtrl.getByPublicId(req, res, next),
);

/**
 * @swagger
 * /api/worker/orders:
 *   get:
 *     summary: Listar todos os pedidos (worker)
 *     tags:
 *       - Orders (Worker)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       publicId:
 *                         type: string
 *                       code:
 *                         type: string
 *                       status:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *                       paymentMethod:
 *                         type: string
 *                         nullable: true
 *                       observation:
 *                         type: string
 *                         nullable: true
 *                       itens:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: number
 *                             name:
 *                               type: string
 *                             price:
 *                               type: number
 *                             quantity:
 *                               type: number
 *                             observation:
 *                               type: string
 *                               nullable: true
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 */

orderRoutes.get("/worker/orders", AuthMiddleware, (req, res, next) =>
  orderCtrl.getallByWorker(req, res, next),
);

/**
 * @swagger
 * /api/worker/orders/{publicId}/status:
 *   patch:
 *     summary: Atualizar status do pedido (worker)
 *     tags:
 *       - Orders (Worker)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - IN PROGRESS
 *                   - COMPLETED
 *                   - LATE
 *                   - CANCELLED
 *     responses:
 *       200:
 *         description: Status atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                     code:
 *                       type: string
 *                     status:
 *                       type: string
 *                     totalPrice:
 *                       type: number
 *                     paymentMethod:
 *                       type: string
 *                       nullable: true
 *                     observation:
 *                       type: string
 *                       nullable: true
 *                     itens:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                           observation:
 *                             type: string
 *                             nullable: true
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Transição de status inválida
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 */
orderRoutes.patch(
  "/worker/orders/:publicId/status",
  AuthMiddleware,
  validationMiddleware(UpdateOrderStatusRequestSchema),
  (req, res, next) => orderCtrl.updateStatus(req, res, next),
);

export { orderRoutes };
