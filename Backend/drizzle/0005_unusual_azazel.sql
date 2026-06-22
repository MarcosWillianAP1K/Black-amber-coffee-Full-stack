ALTER TABLE "Inventory" ADD COLUMN IF NOT EXISTS "code" text;
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_public_id_unique" UNIQUE("public_id");
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_code_unique" UNIQUE("code");
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "client_id" DROP NOT NULL;