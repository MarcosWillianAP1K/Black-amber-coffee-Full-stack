/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Pagamentos simulados (checkout a partir do carrinho)
 */

/**
 * @swagger
 * /api/payments/simulate:
 *   post:
 *     summary: Simular pagamento e finalizar compra
 *     description: |
 *       Cria um pedido a partir dos itens do carrinho, registra o pagamento como **confirmado**
 *       (simulação) e limpa o carrinho. Não integra com gateway real.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [pix, cartao_credito, cartao_debito, dinheiro]
 *               observation:
 *                 type: string
 *                 nullable: true
 *                 description: Observação do pedido (não do item)
 *     responses:
 *       201:
 *         description: Pagamento simulado e pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       type: object
 *                       description: Pedido criado
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         orderId:
 *                           type: integer
 *                         amount:
 *                           type: number
 *                         method:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: confirmado
 *                         paidAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                 message:
 *                   type: string
 *                   example: Pagamento simulado com sucesso.
 *       400:
 *         description: Carrinho vazio, método inválido ou produto inativo
 *       401:
 *         description: Não autorizado
 */

export {};
