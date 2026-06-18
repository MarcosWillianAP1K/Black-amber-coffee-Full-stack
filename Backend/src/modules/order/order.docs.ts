/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Rotas de pedidos para clientes
 *   - name: Orders (Worker)
 *     description: Rotas de pedidos para funcionários (Workers e Admins)
 */

// ============================================================
// Worker Routes
// ============================================================

/**
 * @swagger
 * /api/worker/orders:
 *   post:
 *     summary: Criar um pedido (Worker/Admin)
 *     tags: [Orders (Worker)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientPublicId:
 *                 type: string
 *                 description: ID público do cliente (opcional para clientes de balcão)
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     observation:
 *                       type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [CREDIT_CARD, DEBIT_CARD, CASH, PIX]
 *               observation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/worker/orders:
 *   get:
 *     summary: Listar todos os pedidos (Worker/Admin)
 *     tags: [Orders (Worker)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/worker/orders/{publicId}:
 *   get:
 *     summary: Buscar pedido por ID (Worker/Admin)
 *     tags: [Orders (Worker)]
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
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 */

/**
 * @swagger
 * /api/worker/orders/{publicId}/status:
 *   patch:
 *     summary: Atualizar status do pedido (Worker/Admin)
 *     tags: [Orders (Worker)]
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
 *                 enum: [PENDING, IN PROGRESS, COMPLETED, LATE, CANCELLED]
 *     responses:
 *       200:
 *         description: Status atualizado
 *       400:
 *         description: Transição inválida
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/worker/orders/{publicId}/cancel:
 *   post:
 *     summary: Cancelar um pedido (Worker/Admin)
 *     tags: [Orders (Worker)]
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
 *         description: Pedido cancelado
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 */

// ============================================================
// User Routes
// ============================================================

/**
 * @swagger
 * /api/user/orders:
 *   post:
 *     summary: Criar um novo pedido para o usuário autenticado
 *     tags: [Orders]
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
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     observation:
 *                       type: string
 *               paymentMethod:
 *                 type: string
 *               observation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/user/orders:
 *   get:
 *     summary: Listar pedidos do usuário por status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, IN PROGRESS, COMPLETED, LATE, CANCELLED]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/user/orders/{publicId}/cancel:
 *   post:
 *     summary: Cancelar um pedido do usuário autenticado
 *     tags: [Orders]
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
 *         description: Pedido cancelado
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Pedido não encontrado
 */
