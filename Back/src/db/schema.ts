import { relations } from "drizzle-orm";
import { WorkerRoles } from "@/core/enuns/workerRole";
import { OrderStatus } from "@/core/enuns/orederStatus";
import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";

//  Enums

export const workerRolesEnum = pgEnum("worker_roles", WorkerRoles.values());
export const orderStatusEnum = pgEnum("order_status", OrderStatus.values());

//  Helpers

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

//  Tables
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  ...timestamps,
});

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  role: workerRolesEnum("role").notNull(),
  salary: numeric("salary", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isAdmin: boolean("is_admin").notNull().default(false),
  ...timestamps,
});

export const workerProfiles = pgTable("worker_profiles", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id")
    .notNull()
    .references(() => workers.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarImage: text("avatar_image"),
  ...timestamps,
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarImage: text("avatar_image"),
  ...timestamps,
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  size: text("size"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull().unique(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull(),
  observation: text("observation"),
  ...timestamps,
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  ...timestamps,
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  ...timestamps,
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

//  Relations
export const clientsRelations = relations(clients, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [clients.id],
    references: [profiles.clientId],
  }),
  orders: many(orders),
}));

export const workersRelations = relations(workers, ({ one }) => ({
  profile: one(workerProfiles, {
    fields: [workers.id],
    references: [workerProfiles.workerId],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, { fields: [orders.clientId], references: [clients.id] }),
  items: many(orderItems),
  payment: one(payments, {
    fields: [orders.id],
    references: [payments.orderId],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
