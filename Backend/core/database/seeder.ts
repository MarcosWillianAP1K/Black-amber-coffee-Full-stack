import { pool, withTransaction } from "./postgres.client.js";
import { SecurityUtils } from "../security/security.utils.js";
import { OrderStatus, type OrderStatusType, type PaymentMethodType, type WorkerRole } from "../enums/index.js";
import { logger } from "../errors/index.js";

const WORKER_SEEDS: ReadonlyArray<{
  fullName: string;
  email: string;
  phone: string;
  role: WorkerRole;
  salary: number;
}> = [
  { fullName: "Gerente Black Amber", email: "admin@blackamber.com", phone: "11999999999", role: "gerente", salary: 5500 },
  { fullName: "João Barista", email: "barista@blackamber.com", phone: "11988888888", role: "barista", salary: 2800 },
  { fullName: "Carlos Caixa", email: "caixa@blackamber.com", phone: "11977777777", role: "caixa", salary: 2500 },
  { fullName: "Maria Atendente", email: "atendente@blackamber.com", phone: "11966666666", role: "atendente", salary: 2400 },
];

const CLIENT_SEEDS: ReadonlyArray<{
  email: string;
  fullName: string;
  phone: string;
}> = [
  { email: "cliente@teste.com", fullName: "Cliente Teste", phone: "11955555555" },
  { email: "maria@email.com", fullName: "Maria Silva", phone: "11911111111" },
  { email: "joao@email.com", fullName: "João Pereira", phone: "11922222222" },
  { email: "ana@email.com", fullName: "Ana Costa", phone: "11933333333" },
];

const PRODUCT_SEEDS: ReadonlyArray<{
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  minQuantity: number;
}> = [
  { name: "Café Expresso", description: "Café puro e encorpado", price: 5.0, category: "cafe", quantity: 50, minQuantity: 10 },
  { name: "Café Latte", description: "Café com leite vaporizado", price: 8.0, category: "cafe", quantity: 40, minQuantity: 10 },
  { name: "Cappuccino", description: "Café com leite e espuma cremosa", price: 10.0, category: "cafe", quantity: 30, minQuantity: 8 },
  { name: "Mocha", description: "Café com chocolate e leite", price: 12.0, category: "cafe", quantity: 20, minQuantity: 5 },
  { name: "Suco de Laranja", description: "Suco natural de laranja", price: 7.0, category: "suco", quantity: 25, minQuantity: 5 },
  { name: "Água Mineral", description: "Água sem gás 500ml", price: 3.0, category: "outro", quantity: 60, minQuantity: 15 },
  { name: "Croissant", description: "Croissant artesanal de manteiga", price: 6.0, category: "lanche", quantity: 15, minQuantity: 5 },
  { name: "Bolo de Cenoura", description: "Fatia de bolo de cenoura com cobertura de chocolate", price: 8.0, category: "sobremesa", quantity: 8, minQuantity: 3 },
  { name: "Sanduíche Natural", description: "Sanduíche integral com frango e salada", price: 15.0, category: "lanche", quantity: 12, minQuantity: 4 },
];

const INVENTORY_SEEDS: ReadonlyArray<{
  code: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
}> = [
  { code: "INV-001", name: "Grãos de Café Arábica", description: "Torra média especial para espresso", category: "Matéria-Prima", quantity: 25, unit: "kg", minQuantity: 10 },
  { code: "INV-002", name: "Leite Integral", description: "Leite UHT para vaporização", category: "Laticínios", quantity: 8, unit: "L", minQuantity: 10 },
  { code: "INV-003", name: "Copo Térmico 300ml", description: "Copo descartável com tampa", category: "Embalagens", quantity: 120, unit: "un", minQuantity: 30 },
  { code: "INV-004", name: "Calda de Chocolate Belga", description: "Calda para Mocha e sobremesas", category: "Insumos", quantity: 0, unit: "L", minQuantity: 5 },
  { code: "INV-005", name: "Açúcar Demerara", description: "Pacote 1kg para balcão e cozinha", category: "Insumos", quantity: 14, unit: "kg", minQuantity: 5 },
];

/**
 * Populates initial workers, clients, products, stocks, inventory items, and demo orders idempotently.
 */
export async function runSeed(): Promise<void> {
  const hashedPassword = await SecurityUtils.hashPassword("123456");

  for (const w of WORKER_SEEDS) {
    await pool.query(
      `INSERT INTO public.workers (email, password, full_name, phone, role, salary, is_admin, is_active)
       VALUES ($1, $2, $3, $4, $5::public.worker_roles, $6, $7, TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [w.email, hashedPassword, w.fullName, w.phone, w.role, w.salary, w.role === "gerente"],
    );
  }

  for (const c of CLIENT_SEEDS) {
    await pool.query(
      `INSERT INTO public.clients (email, password, full_name, phone, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [c.email, hashedPassword, c.fullName, c.phone],
    );
  }

  for (const p of PRODUCT_SEEDS) {
    const existing = await pool.query<{ id: number }>(
      "SELECT id FROM public.products WHERE name = $1 LIMIT 1",
      [p.name],
    );

    let productId: number;
    if (existing.rows.length === 0) {
      const inserted = await pool.query<{ id: number }>(
        `INSERT INTO public.products (name, description, price, category, is_active)
         VALUES ($1, $2, $3, $4::public.product_category, TRUE)
         RETURNING id`,
        [p.name, p.description, p.price, p.category],
      );
      productId = inserted.rows[0].id;
    } else {
      productId = existing.rows[0].id;
    }

    await pool.query(
      `INSERT INTO public.stocks (product_id, quantity, min_quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id) DO NOTHING`,
      [productId, p.quantity, p.minQuantity],
    );
  }

  for (const inv of INVENTORY_SEEDS) {
    await pool.query(
      `INSERT INTO public.inventory_items (code, name, description, category, quantity, unit, min_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (code) DO NOTHING`,
      [inv.code, inv.name, inv.description, inv.category, inv.quantity, inv.unit, inv.minQuantity],
    );
  }

  const orderCountResult = await pool.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM public.orders");
  const existingOrdersCount = Number(orderCountResult.rows[0]?.total ?? 0);

  if (existingOrdersCount === 0) {
    const clientsRes = await pool.query<{ id: number; email: string }>("SELECT id, email FROM public.clients");
    const productsRes = await pool.query<{ id: number; name: string; price: string }>(
      "SELECT id, name, price FROM public.products",
    );
    const workersRes = await pool.query<{ id: number }>("SELECT id FROM public.workers LIMIT 1");

    const clientTest = clientsRes.rows.find((c) => c.email === "cliente@teste.com") ?? clientsRes.rows[0];
    const otherClients = clientsRes.rows.filter((c) => c.id !== clientTest?.id);
    const firstWorkerId = workersRes.rows[0]?.id ?? null;

    if (clientTest && productsRes.rows.length > 0) {
      const findProduct = (name: string) =>
        productsRes.rows.find((p) => p.name === name) ?? productsRes.rows[0];

      const now = new Date();
      const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000);

      const sampleOrders: Array<{
        status: OrderStatusType;
        paymentMethod: PaymentMethodType | null;
        observation: string | null;
        clientId: number;
        createdAt: Date;
        items: Array<{ name: string; quantity: number }>;
      }> = [
        {
          status: OrderStatus.CRIADO,
          paymentMethod: "pix",
          observation: "Cliente solicita canela extra",
          clientId: clientTest.id,
          createdAt: now,
          items: [
            { name: "Café Latte", quantity: 2 },
            { name: "Croissant", quantity: 1 },
          ],
        },
        {
          status: OrderStatus.EM_PREPARO,
          paymentMethod: "cartao_credito",
          observation: null,
          clientId: clientTest.id,
          createdAt: now,
          items: [{ name: "Cappuccino", quantity: 1 }],
        },
        {
          status: OrderStatus.PRONTO,
          paymentMethod: "pix",
          observation: "Pedido pronto - cliente aguardando",
          clientId: otherClients[0]?.id ?? clientTest.id,
          createdAt: now,
          items: [
            { name: "Sanduíche Natural", quantity: 1 },
            { name: "Suco de Laranja", quantity: 1 },
          ],
        },
        {
          status: OrderStatus.FINALIZADO,
          paymentMethod: "dinheiro",
          observation: "Mesa 5",
          clientId: otherClients[1]?.id ?? clientTest.id,
          createdAt: daysAgo(1),
          items: [
            { name: "Café Expresso", quantity: 3 },
            { name: "Bolo de Cenoura", quantity: 2 },
          ],
        },
        {
          status: OrderStatus.CANCELADO,
          paymentMethod: null,
          observation: "Cliente desistiu",
          clientId: clientTest.id,
          createdAt: daysAgo(2),
          items: [{ name: "Mocha", quantity: 1 }],
        },
      ];

      for (const orderData of sampleOrders) {
        await withTransaction(async (client) => {
          const orderItems = orderData.items.map((it) => {
            const prod = findProduct(it.name);
            return {
              productId: prod.id,
              quantity: it.quantity,
              unitPrice: Number(prod.price),
            };
          });

          const totalAmount = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
          const code = SecurityUtils.generateOrderCode();

          const insertedOrder = await client.query<{ id: number }>(
            `INSERT INTO public.orders (code, client_id, status, total_amount, observation, created_at, updated_at)
             VALUES ($1, $2, $3::public.order_status, $4, $5, $6, $6)
             RETURNING id`,
            [code, orderData.clientId, orderData.status, totalAmount.toFixed(2), orderData.observation, orderData.createdAt],
          );

          const orderId = insertedOrder.rows[0].id;

          for (const item of orderItems) {
            await client.query(
              `INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
               VALUES ($1, $2, $3, $4)`,
              [orderId, item.productId, item.quantity, item.unitPrice.toFixed(2)],
            );
          }

          if (orderData.paymentMethod) {
            const paymentStatus = orderData.status === OrderStatus.FINALIZADO ? "confirmado" : "pendente";
            await client.query(
              `INSERT INTO public.payments (order_id, amount, method, status, paid_at, created_at, updated_at)
               VALUES ($1, $2, $3::public.payment_method, $4::public.payment_status, $5, $6, $6)`,
              [
                orderId,
                totalAmount.toFixed(2),
                orderData.paymentMethod,
                paymentStatus,
                paymentStatus === "confirmado" ? orderData.createdAt : null,
                orderData.createdAt,
              ],
            );
          }

          await client.query(
            `INSERT INTO public.order_status_history (order_id, previous_status, new_status, changed_by_worker, changed_at)
             VALUES ($1, $2::public.order_status, $3::public.order_status, $4, $5)`,
            [orderId, orderData.status, orderData.status, firstWorkerId, orderData.createdAt],
          );
        });
      }
    }
  }

  logger.info("[Seed] Dados iniciais verificados com sucesso.");
}
