/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Carrinho do cliente (persistido no banco de dados)
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Obter carrinho do cliente autenticado
 *     description: Retorna o carrinho ativo do cliente. Cria um carrinho vazio se ainda não existir.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     itemCount:
 *                       type: integer
 *                     subtotal:
 *                       type: number
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: integer
 *                           productPublicId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                             nullable: true
 *                           imgUrl:
 *                             type: string
 *                             nullable: true
 *                           price:
 *                             type: number
 *                           category:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           observation:
 *                             type: string
 *                             nullable: true
 *                           addedAt:
 *                             type: string
 *                             format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Apenas clientes podem acessar o carrinho
 */

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Limpar carrinho
 *     description: Remove todos os itens do carrinho do cliente.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho limpo com sucesso
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Adicionar item ao carrinho
 *     description: Adiciona um produto ao carrinho. Se o produto já existir, incrementa a quantidade.
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
 *                 description: ID numérico interno do produto
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 minimum: 1
 *               observation:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Item adicionado com sucesso
 *       400:
 *         description: Produto inativo ou dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Produto não encontrado
 */

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   patch:
 *     summary: Atualizar item do carrinho
 *     description: Atualiza quantidade e/ou observação de um item existente no carrinho.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico interno do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               observation:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Item não encontrado no carrinho
 */

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   delete:
 *     summary: Remover item do carrinho
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico interno do produto
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 *       401:
 *         description: Não autorizado
 */

export {};
