import { db } from "../config/database";
import {
  clients,
  workers,
  products,
  orders,
  orderItems,
  payments,
  orderStatusHistory,
  stocks,
} from "../db/schema";
import SecurityUtils from "../core/security";
import { generateId } from "../core/gereteId";
import { OrderStatus } from "../core/enuns/orederStatus";
import { eq } from "drizzle-orm";
import { generateOrderCode } from "@/shared/utils/code.gerator";

const workerSeedData = [
  {
    fullName: "Gerente Black Amber",
    email: "admin@blackamber.com",
    phone: "11999999999",
    role: "gerente" as const,
  },
  {
    fullName: "João Barista",
    email: "barista@blackamber.com",
    phone: "11988888888",
    role: "barista" as const,
  },
  {
    fullName: "Carlos Caixa",
    email: "caixa@blackamber.com",
    phone: "11977777777",
    role: "caixa" as const,
  },
  {
    fullName: "Maria Atendente",
    email: "atendente@blackamber.com",
    phone: "11966666666",
    role: "atendente" as const,
  },
];

export async function seed() {
  console.log("🌱 Iniciando seed...");

  try {
    // If SEED_FORCE_RESET is set, remove existing seeded data so seed becomes "fresh"
    if (process.env.SEED_FORCE_RESET === "true") {
      console.log(
        "⚠️ SEED_FORCE_RESET=true — removendo dados existentes antes de semear...",
      );
      await db.transaction(async (tx) => {
        // Delete in dependency order (children first, parents last)
        await tx
          .delete(orderStatusHistory)
          .where(eq(orderStatusHistory.id, orderStatusHistory.id));
        await tx
          .delete(payments)
          .where(eq(payments.id, payments.id));
        await tx
          .delete(orderItems)
          .where(eq(orderItems.orderId, orderItems.orderId));
        await tx
          .delete(orders)
          .where(eq(orders.id, orders.id));
        await tx
          .delete(stocks)
          .where(eq(stocks.productId, stocks.productId));
        await tx
          .delete(products)
          .where(eq(products.id, products.id));
        await tx
          .delete(workers)
          .where(eq(workers.id, workers.id));
        await tx
          .delete(clients)
          .where(eq(clients.id, clients.id));
      });
    }

    // Quick connectivity check to provide clearer error when DB is unreachable
    try {
      await db.select().from(clients).limit(1);
    } catch (connErr) {
      console.error(
        "❌ Não foi possível conectar ao banco de dados. Verifique `DATABASE_URL` e a conectividade.",
      );
      throw connErr;
    }

    const now = new Date();
    const hashedPassword = await SecurityUtils.hashPassword("123456");

    // Create missing workers
    const existingWorkers = await db
      .select()
      .from(workers)
      .limit(1);

    if (existingWorkers.length === 0) {
      console.log("👷 Criando workers...");
      await db.insert(workers).values(
        workerSeedData.map((worker) => ({
          email: worker.email,
          password: hashedPassword,
          fullName: worker.fullName,
          phone: worker.phone,
          avatarUrl: null,
          role: worker.role,
          salary: "0",
          isActive: true,
          isAdmin: worker.role === "gerente",
          createdAt: now,
          updatedAt: now,
        })),
      );
    } else {
      console.log("🔍 Verificando workers existentes e inserindo ausentes...");
      for (const seed of workerSeedData) {
        const found = await db
          .select()
          .from(workers)
          .where(eq(workers.email, seed.email))
          .limit(1);

        if (!found.length) {
          await db.insert(workers).values({
            email: seed.email,
            password: hashedPassword,
            fullName: seed.fullName,
            phone: seed.phone,
            avatarUrl: null,
            role: seed.role,
            salary: "0",
            isActive: true,
            isAdmin: seed.role === "gerente",
            createdAt: now,
            updatedAt: now,
          });
          console.log(`+ Inserido worker ${seed.email}`);
        }
      }
    }

    // Ensure test client exists (insert if missing)
    const existingClient = await db
      .select()
      .from(clients)
      .where(eq(clients.email, "cliente@teste.com"))
      .limit(1);

    if (!existingClient.length) {
      console.log("👤 Criando cliente de teste...");
      await db.insert(clients).values({
        email: "cliente@teste.com",
        password: hashedPassword,
        fullName: "Cliente Teste",
        phone: "11955555555",
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    // ============================================================
    // Products seed
    // ============================================================
    const productSeedData = [
      {
        name: "Café Expresso",
        description: "Café puro e encorpado",
        price: "5.00",
        category: "cafe",
      },
      {
        name: "Café Latte",
        description: "Café com leite vaporizado",
        price: "8.00",
        category: "cafe",
      },
      {
        name: "Cappuccino",
        description: "Café com leite e espuma cremosa",
        price: "10.00",
        category: "cafe",
      },
      {
        name: "Mocha",
        description: "Café com chocolate e leite",
        price: "12.00",
        category: "cafe",
      },
      {
        name: "Suco de Laranja",
        description: "Suco natural de laranja",
        price: "7.00",
        category: "suco",
      },
      {
        name: "Água Mineral",
        description: "Água sem gás 500ml",
        price: "3.00",
        category: "outro",
      },
      {
        name: "Croissant",
        description: "Croissant artesanal de manteiga",
        price: "6.00",
        category: "lanche",
      },
      {
        name: "Bolo de Cenoura",
        description: "Fatia de bolo de cenoura com cobertura de chocolate",
        price: "8.00",
        category: "sobremesa",
      },
      {
        name: "Sanduíche Natural",
        description: "Sanduíche integral com frango e salada",
        price: "15.00",
        category: "lanche",
      },
    ];

    const existingProducts = await db
      .select()
      .from(products)
      .limit(1);

    if (existingProducts.length === 0) {
      console.log("☕ Criando produtos...");
      const insertedProducts = await db.insert(products).values(
        productSeedData.map((product) => ({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category as any,
          isActive: true,
          imgUrl: null,
          createdAt: now,
          updatedAt: now,
        })),
      ).returning();

      // ============================================================
      // Stocks seed
      // ============================================================
      console.log("📦 Criando estoque para os produtos...");
      const stockData = [
        { name: "Café Expresso", quantity: 50, minQuantity: 10 },
        { name: "Café Latte", quantity: 40, minQuantity: 10 },
        { name: "Cappuccino", quantity: 30, minQuantity: 8 },
        { name: "Mocha", quantity: 20, minQuantity: 5 },
        { name: "Suco de Laranja", quantity: 25, minQuantity: 5 },
        { name: "Água Mineral", quantity: 60, minQuantity: 15 },
        { name: "Croissant", quantity: 15, minQuantity: 5 },
        { name: "Bolo de Cenoura", quantity: 8, minQuantity: 3 },
        { name: "Sanduíche Natural", quantity: 12, minQuantity: 4 },
      ];

      await db.insert(stocks).values(
        stockData.map((s) => {
          const product = insertedProducts.find((p) => p.name === s.name)!;
          return {
            productId: product.id,
            quantity: s.quantity,
            minQuantity: s.minQuantity,
            updatedAt: now,
          };
        }),
      );
    } else {
      console.log("☕ Produtos já existem, verificando ausentes...");
      for (const seed of productSeedData) {
        const found = await db
          .select()
          .from(products)
          .where(eq(products.name, seed.name))
          .limit(1);

        if (!found.length) {
          const [inserted] = await db.insert(products).values({
            name: seed.name,
            description: seed.description,
            price: seed.price,
            category: seed.category as any,
            isActive: true,
            imgUrl: null,
            createdAt: now,
            updatedAt: now,
          }).returning();
          console.log(`+ Inserido produto ${seed.name}`);

          // Create stock for the new product
          await db.insert(stocks).values({
            productId: inserted.id,
            quantity: 20,
            minQuantity: 5,
            updatedAt: now,
          });
        }
      }

      // Ensure stocks exist for existing products that might not have them
      const allProds = await db.select().from(products);
      for (const prod of allProds) {
        const existingStock = await db
          .select()
          .from(stocks)
          .where(eq(stocks.productId, prod.id))
          .limit(1);

        if (!existingStock.length) {
          await db.insert(stocks).values({
            productId: prod.id,
            quantity: 20,
            minQuantity: 5,
            updatedAt: now,
          });
          console.log(`+ Criado estoque para ${prod.name}`);
        }
      }
    }

    // ============================================================
    // Additional clients seed
    // ============================================================
    const additionalClients = [
      { email: "maria@email.com", name: "Maria Silva", phone: "11911111111" },
      { email: "joao@email.com", name: "João Pereira", phone: "11922222222" },
      { email: "ana@email.com", name: "Ana Costa", phone: "11933333333" },
    ];

    for (const c of additionalClients) {
      const exists = await db
        .select()
        .from(clients)
        .where(eq(clients.email, c.email))
        .limit(1);

      if (!exists.length) {
        await db.insert(clients).values({
          email: c.email,
          password: hashedPassword,
          fullName: c.name,
          phone: c.phone,
          avatarUrl: null,
          createdAt: now,
          updatedAt: now,
        });
        console.log(`+ Cliente ${c.email}`);
      }
    }

    // ============================================================
    // Orders seed
    // ============================================================
    const existingOrders = await db.select().from(orders).limit(1);

    if (existingOrders.length === 0) {
      const allClients = await db.select().from(clients);
      const allProducts = await db.select().from(products);
      const allWorkers = await db.select().from(workers);

      if (allClients.length > 0 && allProducts.length > 0) {
        const testClientId = allClients.find((c) => c.email === "cliente@teste.com")!.id;
        const otherClientIds = allClients
          .filter((c) => c.email !== "cliente@teste.com")
          .map((c) => c.id);

        // Get first worker for history reference
        const firstWorkerId = allWorkers.length > 0 ? allWorkers[0].id : null;

        // Helper to find a product by name
        const findProduct = (name: string) =>
          allProducts.find((p) => p.name === name)!;

        console.log("📦 Criando pedidos de exemplo...");

        // Helper to get a date relative to now
        const daysAgo = (days: number) => {
          const d = new Date(now);
          d.setDate(d.getDate() - days);
          return d;
        };

        const orderSeeds: Array<{
            status: (typeof OrderStatus.VALUES)[number];
            paymentMethod: "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | null;
            observation: string | null;
            clientId: number;
            createdAt: Date;
            items: Array<{ productId: number; quantity: number; unitPrice: string }>;
          }> = [
            // Today's orders
            {
              status: OrderStatus.CRIADO,
              paymentMethod: "pix",
              observation: "Cliente solicita canela extra",
              clientId: testClientId,
              createdAt: now,
              items: [
                { productId: findProduct("Café Latte").id, quantity: 2, unitPrice: findProduct("Café Latte").price },
                { productId: findProduct("Croissant").id, quantity: 1, unitPrice: findProduct("Croissant").price },
              ],
            },
            {
              status: OrderStatus.EM_PREPARO,
              paymentMethod: "cartao_credito",
              observation: null,
              clientId: testClientId,
              createdAt: now,
              items: [
                { productId: findProduct("Cappuccino").id, quantity: 1, unitPrice: findProduct("Cappuccino").price },
              ],
            },
            {
              status: OrderStatus.FINALIZADO,
              paymentMethod: "dinheiro",
              observation: "Mesa 5",
              clientId: otherClientIds[0],
              createdAt: now,
              items: [
                { productId: findProduct("Café Expresso").id, quantity: 3, unitPrice: findProduct("Café Expresso").price },
                { productId: findProduct("Bolo de Cenoura").id, quantity: 2, unitPrice: findProduct("Bolo de Cenoura").price },
                { productId: findProduct("Suco de Laranja").id, quantity: 1, unitPrice: findProduct("Suco de Laranja").price },
              ],
            },
            {
              status: OrderStatus.PRONTO,
              paymentMethod: "pix",
              observation: "Pedido pronto - cliente aguardando",
              clientId: otherClientIds[1],
              createdAt: now,
              items: [
                { productId: findProduct("Sanduíche Natural").id, quantity: 1, unitPrice: findProduct("Sanduíche Natural").price },
                { productId: findProduct("Suco de Laranja").id, quantity: 1, unitPrice: findProduct("Suco de Laranja").price },
              ],
            },
            {
              status: OrderStatus.CANCELADO,
              paymentMethod: null,
              observation: "Cliente desistiu",
              clientId: testClientId,
              createdAt: now,
              items: [
                { productId: findProduct("Mocha").id, quantity: 1, unitPrice: findProduct("Mocha").price },
              ],
            },
            // Yesterday's orders (for analytics comparison)
            {
              status: OrderStatus.FINALIZADO,
              paymentMethod: "pix",
              observation: null,
              clientId: testClientId,
              createdAt: daysAgo(1),
              items: [
                { productId: findProduct("Café Expresso").id, quantity: 5, unitPrice: findProduct("Café Expresso").price },
                { productId: findProduct("Croissant").id, quantity: 3, unitPrice: findProduct("Croissant").price },
              ],
            },
            {
              status: OrderStatus.FINALIZADO,
              paymentMethod: "cartao_credito",
              observation: "Mesa 2",
              clientId: otherClientIds[2],
              createdAt: daysAgo(1),
              items: [
                { productId: findProduct("Mocha").id, quantity: 2, unitPrice: findProduct("Mocha").price },
                { productId: findProduct("Bolo de Cenoura").id, quantity: 1, unitPrice: findProduct("Bolo de Cenoura").price },
              ],
            },
            {
              status: OrderStatus.FINALIZADO,
              paymentMethod: "dinheiro",
              observation: null,
              clientId: otherClientIds[0],
              createdAt: daysAgo(2),
              items: [
                { productId: findProduct("Cappuccino").id, quantity: 4, unitPrice: findProduct("Cappuccino").price },
                { productId: findProduct("Sanduíche Natural").id, quantity: 2, unitPrice: findProduct("Sanduíche Natural").price },
                { productId: findProduct("Água Mineral").id, quantity: 3, unitPrice: findProduct("Água Mineral").price },
              ],
            },
            {
              status: OrderStatus.FINALIZADO,
              paymentMethod: "pix",
              observation: null,
              clientId: testClientId,
              createdAt: daysAgo(3),
              items: [
                { productId: findProduct("Café Latte").id, quantity: 2, unitPrice: findProduct("Café Latte").price },
                { productId: findProduct("Bolo de Cenoura").id, quantity: 1, unitPrice: findProduct("Bolo de Cenoura").price },
              ],
            },
          ];

        for (const seed of orderSeeds) {
          const orderCode = generateOrderCode();

          const totalAmount = seed.items
            .reduce(
              (sum, item) =>
                sum + Number(item.unitPrice) * item.quantity,
              0,
            )
            .toFixed(2);

          await db.transaction(async (tx) => {
            const [createdOrder] = await tx
              .insert(orders)
              .values({
                code: orderCode,
                clientId: seed.clientId,
                totalAmount,
                status: seed.status as any,
                observation: seed.observation,
                createdAt: seed.createdAt,
                updatedAt: seed.createdAt,
              })
              .returning();

            await tx.insert(orderItems).values(
              seed.items.map((item) => ({
                orderId: createdOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            );

            if (seed.paymentMethod) {
              await tx.insert(payments).values({
                orderId: createdOrder.id,
                amount: totalAmount,
                method: seed.paymentMethod as any,
                createdAt: now,
                updatedAt: now,
              });
            }

            // Add order history entry
            await tx.insert(orderStatusHistory).values({
              orderId: createdOrder.id,
              changedByWorker: firstWorkerId,
              previousStatus: seed.status as any,
              newStatus: seed.status as any,
            });
          });

          console.log(
            `   📄 Pedido ${orderCode} — ${seed.status} (${seed.items.length} itens, R$ ${totalAmount})`,
          );
        }
      }
    } else {
      console.log("📦 Pedidos já existem, pulando...");
    }

    console.log("✅ Seed concluída com sucesso!");
    console.log("\n📧 Credenciais de teste:");
    console.log("   Gerente: admin@blackamber.com / 123456");
    console.log("   Barista: barista@blackamber.com / 123456");
    console.log("   Caixa: caixa@blackamber.com / 123456");
    console.log("   Atendente: atendente@blackamber.com / 123456");
    console.log("   Cliente: cliente@teste.com / 123456");
  } catch (error) {
    console.error("❌ Erro na seed:", error);
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Falha ao executar seed:", error);
      process.exit(1);
    });
}
