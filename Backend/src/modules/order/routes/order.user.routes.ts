import { Router } from "express";
import OrderController from "../order.controller";
import { AuthMiddleware } from "@/modules/auth/auth.middleware";
import validationMiddleware from "@/shared/middlewares/validation.middleware";
import {
  CreateOrderRequestSchema,
  GetOrdersByStatusRequestSchema,
} from "../order.schema";

/**
 * Creates user-facing order routes.
 * All routes require authentication (AuthMiddleware applied at router level).
 *
 * Endpoints:
 *   POST /user/orders                  → Create a new order
 *   POST /user/orders/:publicId/cancel → Cancel an order
 *   GET  /user/orders                  → List orders by status
 */
export function createUserOrderRoutes(orderCtrl: OrderController): Router {
  const router = Router();

  // All user order routes require authentication
  router.use(AuthMiddleware);

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
  router.post(
    "/user/orders",
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
  router.post(
    "/user/orders/:publicId/cancel",
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
  router.get(
    "/user/orders",
    validationMiddleware(GetOrdersByStatusRequestSchema, "query"),
    (req, res, next) => orderCtrl.getByStatus(req, res, next),
  );

  return router;
}
