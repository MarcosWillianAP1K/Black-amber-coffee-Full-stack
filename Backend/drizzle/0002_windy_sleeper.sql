CREATE TABLE "order_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"changed_by" text NOT NULL,
	"previous_status" "order_status" NOT NULL,
	"new_status" "order_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "order_history" ADD CONSTRAINT "order_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_updated_by_workers_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_code_unique" UNIQUE("code");