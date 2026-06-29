import { Router } from "express";
import CartController from "../cart.controller";
import { AuthMiddleware } from "../../auth/auth.middleware";
import { requireRole } from "../../../shared/middlewares/permission.middleware";
import validationMiddleware from "../../../shared/middlewares/validation.middleware";
import { AddCartItemSchema, UpdateCartItemSchema } from "../cart.schema";

export function createCartRoutes(cartCtrl: CartController): Router {
  const router = Router();

  router.use(AuthMiddleware);
  router.use(requireRole("user"));

  /**
   * @swagger
   * /api/cart:
   *   get:
   *     summary: Retorna o carrinho do cliente logado
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Carrinho retornado com sucesso
   *       401:
   *         description: Não autorizado
   */
  router.get("/", (req, res, next) => cartCtrl.getCart(req, res, next));

  /**
   * @swagger
   * /api/cart/items:
   *   post:
   *     summary: Adiciona um item ao carrinho
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - productId
   *             properties:
   *               productId:
   *                 type: integer
   *                 example: 1
   *               quantity:
   *                 type: integer
   *                 example: 2
   *               observation:
   *                 type: string
   *                 example: "Sem açúcar"
   *     responses:
   *       200:
   *         description: Item adicionado
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   */
  router.post(
    "/items",
    validationMiddleware(AddCartItemSchema),
    (req, res, next) => cartCtrl.addItem(req, res, next),
  );

  /**
   * @swagger
   * /api/cart/items/{productId}:
   *   patch:
   *     summary: Atualiza quantidade ou observação de um item no carrinho
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID numérico do produto
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               quantity:
   *                 type: integer
   *                 example: 3
   *               observation:
   *                 type: string
   *                 example: "Com bastante gelo"
   *     responses:
   *       200:
   *         description: Item atualizado
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   */
  router.patch(
    "/items/:productId",
    validationMiddleware(UpdateCartItemSchema),
    (req, res, next) => cartCtrl.updateItem(req, res, next),
  );

  /**
   * @swagger
   * /api/cart/items/{productId}:
   *   delete:
   *     summary: Remove um item do carrinho
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID numérico do produto
   *     responses:
   *       200:
   *         description: Item removido
   *       401:
   *         description: Não autorizado
   */
  router.delete("/items/:productId", (req, res, next) =>
    cartCtrl.removeItem(req, res, next),
  );

  /**
   * @swagger
   * /api/cart:
   *   delete:
   *     summary: Limpa todo o carrinho
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Carrinho limpo
   *       401:
   *         description: Não autorizado
   */
  router.delete("/", (req, res, next) => cartCtrl.clearCart(req, res, next));

  return router;
}
