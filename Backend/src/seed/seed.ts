import { db } from "../config/database";
import {
  clients,
  profiles,
  workers,
  workerProfiles,
  products,
  orders,
  orderItems,
  payments,
  orderHistory,
} from "../db/schema";
import SecurityUtils from "../core/security";
import { generateId } from "../core/gereteId";
import { OrderStatus } from "../core/enuns/orederStatus";
import { eq } from "drizzle-orm";
import { generateOrderCode } from "@/shared/utils/code.gerator";

const workerSeedData = [
  {
    fullName: "Admin Black Amber",
    email: "admin@blackamber.com",
    phone: "11999999999",
    role: "ADMIN" as const,
  },
  {
    fullName: "João Barista",
    email: "barista@blackamber.com",
    phone: "11988888888",
    role: "BARISTA" as const,
  },
  {
    fullName: "Carlos Barman",
    email: "barman@blackamber.com",
    phone: "11977777777",
    role: "BARMAN" as const,
  },
  {
    fullName: "Maria Garçonete",
    email: "waiter@blackamber.com",
    phone: "11966666666",
    role: "WAITER" as const,
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
        // Order -> Products
        await tx
          .delete(orderHistory)
          .where(eq(orderHistory.id, orderHistory.id));
        await tx
          .delete(payments)
          .where(eq(payments.id, payments.id));
        await tx
          .delete(orderItems)
          .where(eq(orderItems.id, orderItems.id));
        await tx
          .delete(orders)
          .where(eq(orders.id, orders.id));
        await tx
          .delete(products)
          .where(eq(products.id, products.id));

        // Workers -> Clients
        await tx
          .delete(workerProfiles)
          .where(eq(workerProfiles.id, workerProfiles.id));
        await tx
          .delete(workers)
          .where(eq(workers.id, workers.id));

        await tx
          .delete(profiles)
          .where(eq(profiles.id, profiles.id));
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
    // Make seed idempotent per-record: create workers that are missing and ensure test client exists
    const existingWorkerProfile = await db
      .select()
      .from(workerProfiles)
      .limit(1);

    const now = new Date();
    const hashedPassword = await SecurityUtils.hashPassword("123456");

    // Create missing workers and their profiles
    if (existingWorkerProfile.length === 0) {
      await db.transaction(async (tx) => {
        console.log("👷 Criando workers...");

        const insertedWorkers = await tx
          .insert(workers)
          .values(
            workerSeedData.map((worker) => ({
              publicId: generateId(),
              role: worker.role,
              salary: "0",
              isActive: true,
              isAdmin: worker.role === "ADMIN",
              createdAt: now,
              updatedAt: now,
            })),
          )
          .returning();

        await tx.insert(workerProfiles).values(
          insertedWorkers.map((worker, index) => ({
            workerId: worker.id,
            email: workerSeedData[index].email,
            password: hashedPassword,
            fullName: workerSeedData[index].fullName,
            phone: workerSeedData[index].phone,
            avatarImage: null,
            createdAt: now,
            updatedAt: now,
          })),
        );
      });
    } else {
      // Ensure each expected worker/profile exists (insert missing ones individually)
      console.log("🔍 Verificando workers existentes e inserindo ausentes...");
      for (const seed of workerSeedData) {
        const found = await db
          .select()
          .from(workerProfiles)
          .where(eq(workerProfiles.email, seed.email))
          .limit(1);

        if (!found.length) {
          await db.transaction(async (tx) => {
            const [worker] = await tx
              .insert(workers)
              .values({
                publicId: generateId(),
                role: seed.role,
                salary: "0",
                isActive: true,
                isAdmin: seed.role === "ADMIN",
                createdAt: now,
                updatedAt: now,
              })
              .returning();

            await tx.insert(workerProfiles).values({
              workerId: worker.id,
              email: seed.email,
              password: hashedPassword,
              fullName: seed.fullName,
              phone: seed.phone,
              avatarImage: null,
              createdAt: now,
              updatedAt: now,
            });
          });
          console.log(`+ Inserido worker/profile ${seed.email}`);
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
      await db.transaction(async (tx) => {
        const [client] = await tx
          .insert(clients)
          .values({
            publicId: generateId(),
            email: "cliente@teste.com",
            password: hashedPassword,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        await tx.insert(profiles).values({
          clientId: client.id,
          fullName: "Cliente Teste",
          phone: "11955555555",
          avatarImage: null,
          createdAt: now,
          updatedAt: now,
        });
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
        category: "COFFEE",
        size: "150ml",
      },
      {
        name: "Café Latte",
        description: "Café com leite vaporizado",
        price: "8.00",
        category: "COFFEE",
        size: "300ml",
      },
      {
        name: "Cappuccino",
        description: "Café com leite e espuma cremosa",
        price: "10.00",
        category: "COFFEE",
        size: "300ml",
      },
      {
        name: "Mocha",
        description: "Café com chocolate e leite",
        price: "12.00",
        category: "COFFEE",
        size: "300ml",
      },
      {
        name: "Suco de Laranja",
        description: "Suco natural de laranja",
        price: "7.00",
        category: "DRINKS",
        size: "400ml",
      },
      {
        name: "Água Mineral",
        description: "Água sem gás 500ml",
        price: "3.00",
        category: "DRINKS",
        size: "500ml",
      },
      {
        name: "Croissant",
        description: "Croissant artesanal de manteiga",
        price: "6.00",
        category: "FOOD",
        size: null,
      },
      {
        name: "Bolo de Cenoura",
        description: "Fatia de bolo de cenoura com cobertura de chocolate",
        price: "8.00",
        category: "FOOD",
        size: null,
      },
      {
        name: "Sanduíche Natural",
        description: "Sanduíche integral com frango e salada",
        price: "15.00",
        category: "FOOD",
        size: null,
      },
    ];

    const existingProducts = await db
      .select()
      .from(products)
      .limit(1);

    if (existingProducts.length === 0) {
      console.log("☕ Criando produtos...");
      await db.insert(products).values(
        productSeedData.map((product) => ({
          publicId: generateId(),
          name: product.name,
          description: product.description,
          size: product.size,
          price: product.price,
          category: product.category,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })),
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
          await db.insert(products).values({
            publicId: generateId(),
            name: seed.name,
            description: seed.description,
            size: seed.size,
            price: seed.price,
            category: seed.category,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          });
          console.log(`+ Inserido produto ${seed.name}`);
        }
      }
    }

    // ============================================================
    // Orders seed
    // ============================================================
    const existingOrders = await db.select().from(orders).limit(1);

    if (existingOrders.length === 0) {
      const clientRecord = await db
        .select()
        .from(clients)
        .where(eq(clients.email, "cliente@teste.com"))
        .limit(1);

      const allProducts = await db.select().from(products);

      if (clientRecord.length > 0 && allProducts.length > 0) {
        const testClientId = clientRecord[0].id;

        // Helper to find a product by name
        const findProduct = (name: string) =>
          allProducts.find((p) => p.name === name)!;

        console.log("📦 Criando pedidos de exemplo...");

        const orderSeeds: Array<{
          status: (typeof OrderStatus.VALUES)[number];
          paymentMethod: string | null;
          observation: string | null;
          items: Array<{ productId: number; quantity: number; unitPrice: string }>;
        }> = [
          {
            status: OrderStatus.PENDING,
            paymentMethod: "PIX",
            observation: "Cliente solicita canela extra",
            items: [
              {
                productId: findProduct("Café Latte").id,
                quantity: 2,
                unitPrice: findProduct("Café Latte").price,
              },
              {
                productId: findProduct("Croissant").id,
                quantity: 1,
                unitPrice: findProduct("Croissant").price,
              },
            ],
          },
          {
            status: OrderStatus.IN_PROGRESS,
            paymentMethod: "CARD",
            observation: null,
            items: [
              {
                productId: findProduct("Cappuccino").id,
                quantity: 1,
                unitPrice: findProduct("Cappuccino").price,
              },
            ],
          },
          {
            status: OrderStatus.COMPLETED,
            paymentMethod: "CASH",
            observation: "Mesa 5",
            items: [
              {
                productId: findProduct("Café Expresso").id,
                quantity: 3,
                unitPrice: findProduct("Café Expresso").price,
              },
              {
                productId: findProduct("Bolo de Cenoura").id,
                quantity: 2,
                unitPrice: findProduct("Bolo de Cenoura").price,
              },
              {
                productId: findProduct("Suco de Laranja").id,
                quantity: 1,
                unitPrice: findProduct("Suco de Laranja").price,
              },
            ],
          },
          {
            status: OrderStatus.LATE,
            paymentMethod: "PIX",
            observation: "Pedido atrasado - cliente aguardando",
            items: [
              {
                productId: findProduct("Sanduíche Natural").id,
                quantity: 1,
                unitPrice: findProduct("Sanduíche Natural").price,
              },
              {
                productId: findProduct("Suco de Laranja").id,
                quantity: 1,
                unitPrice: findProduct("Suco de Laranja").price,
              },
            ],
          },
          {
            status: OrderStatus.CANCELLED,
            paymentMethod: null,
            observation: "Cliente desistiu",
            items: [
              {
                productId: findProduct("Mocha").id,
                quantity: 1,
                unitPrice: findProduct("Mocha").price,
              },
            ],
          },
        ];

        for (const seed of orderSeeds) {
          const orderPublicId = generateId();
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
                publicId: orderPublicId,
                code: orderCode,
                clientId: testClientId,
                totalAmount,
                status: seed.status as any,
                observation: seed.observation,
                createdAt: now,
                updatedAt: now,
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
                method: seed.paymentMethod,
                createdAt: now,
                updatedAt: now,
              });
            }

            // Add order history entry
            await tx.insert(orderHistory).values({
              orderId: createdOrder.id,
              changedBy: "cliente@teste.com",
              previousStatus: seed.status as any,
              newStatus: seed.status as any,
              createdAt: now,
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
    console.log("   Admin: admin@blackamber.com / 123456");
    console.log("   Barista: barista@blackamber.com / 123456");
    console.log("   Barman: barman@blackamber.com / 123456");
    console.log("   Waiter: waiter@blackamber.com / 123456");
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
