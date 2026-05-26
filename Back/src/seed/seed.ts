import { db } from "../config/database";
import { clients, profiles, workers, workerProfiles } from "../db/schema";
import SecurityUtils from "../core/security";
import { generateId } from "../core/gereteId";
import { eq } from "drizzle-orm";

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
        // Delete dependent/profile records first, then parent entities
        await tx
          .delete(workerProfiles)
          .where(eq(workerProfiles.id, workerProfiles.id));
        await tx.delete(workers).where(eq(workers.id, workers.id));

        await tx.delete(profiles).where(eq(profiles.id, profiles.id));
        await tx.delete(clients).where(eq(clients.id, clients.id));
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
