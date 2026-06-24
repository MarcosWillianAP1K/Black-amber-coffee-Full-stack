import { relations } from "drizzle-orm";
import { WorkerRoles } from "@/core/enuns/workerRole";
import { OrderStatus } from "@/core/enuns/orederStatus";
import { ProductCategory } from "@/core/enuns/proudcCategory";
import { PaymentMethod, PaymentStatus } from "@/core/enuns/payment.types";
import { AttendanceStatus } from "@/core/enuns/attendanceStatus";
import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  pgEnum,
  timestamp,
  date,
  primaryKey,
  uuid,
  unique,
} from "drizzle-orm/pg-core";

//  Enums

export const workerRolesEnum = pgEnum("worker_roles", WorkerRoles.values());
export const orderStatusEnum = pgEnum("order_status", OrderStatus.values());
export const productCategoryEnum = pgEnum("product_category", ProductCategory.values());
export const paymentMethodEnum = pgEnum("payment_method", PaymentMethod.values());
export const paymentStatusEnum = pgEnum("payment_status", PaymentStatus.values());
export const attendanceStatusEnum = pgEnum("attendance_status", AttendanceStatus.values());

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

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").notNull().unique().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: workerRolesEnum("role").notNull(),
  salary: numeric("salary").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").notNull().unique().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").notNull().unique().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  category: productCategoryEnum("category").notNull(),
  price: numeric("price").notNull(),
  imgUrl: text("img_url"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const stocks = pgTable("stocks", {
  productId: integer("product_id")
    .notNull()
    .primaryKey()
    .references(() => products.id),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").notNull().unique().defaultRandom(),
  code: text("code").unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  quantity: numeric("quantity").notNull().default("0"),
  unit: text("unit").notNull(),
  minQuantity: numeric("min_quantity").notNull().default("0"),
  imgUrl: text("img_url"),
  ...timestamps,
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .unique()
    .references(() => clients.id),
  ...timestamps,
});

export const cartItems = pgTable(
  "cart_items",
  {
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
    observation: text("observation"),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.cartId, table.productId] }),
  ],
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").notNull().unique().defaultRandom(),
  code: text("code").notNull().unique(),
  clientId: integer("client_id")
    .references(() => clients.id),
  status: orderStatusEnum("status").notNull().default("criado"),
  totalAmount: numeric("total_amount").notNull(),
  observation: text("observation"),
  updatedBy: integer("updated_by").references(() => workers.id),
  ...timestamps,
});

export const orderItems = pgTable(
  "order_items",
  {
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: numeric("unit_price").notNull(),
    observation: text("observation"),
  },
  (table) => [
    primaryKey({ columns: [table.orderId, table.productId] }),
  ],
);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .unique()
    .references(() => orders.id),
  amount: numeric("amount").notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("pendente"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  ...timestamps,
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  previousStatus: orderStatusEnum("previous_status").notNull(),
  newStatus: orderStatusEnum("new_status").notNull(),
  changedByWorker: integer("changed_by_worker")
    .references(() => workers.id),
  changedAt: timestamp("changed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const attendance = pgTable(
  "attendance",
  {
    workerId: integer("worker_id")
      .notNull()
      .references(() => workers.id),
    workDate: date("work_date").notNull(),
    status: attendanceStatusEnum("status").notNull().default("presente"),
    notes: text("notes"),
    recordedBy: integer("recorded_by")
      .references(() => workers.id),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.workerId, table.workDate] }),
  ],
);

//  Relations

export const clientsRelations = relations(clients, ({ one, many }) => ({
  cart: one(carts, {
    fields: [clients.id],
    references: [carts.clientId],
  }),
  orders: many(orders),
}));

export const workersRelations = relations(workers, ({ many }) => ({
  ordersUpdated: many(orders),
  attendanceRecords: many(attendance),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, { fields: [orders.clientId], references: [clients.id] }),
  updatedByWorker: one(workers, { fields: [orders.updatedBy], references: [workers.id] }),
  items: many(orderItems),
  payment: one(payments, {
    fields: [orders.id],
    references: [payments.orderId],
  }),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  stock: one(stocks, {
    fields: [products.id],
    references: [stocks.productId],
  }),
}));

export const stocksRelations = relations(stocks, ({ one }) => ({
  product: one(products, {
    fields: [stocks.productId],
    references: [products.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
  worker: one(workers, {
    fields: [orderStatusHistory.changedByWorker],
    references: [workers.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  client: one(clients, {
    fields: [carts.clientId],
    references: [clients.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  worker: one(workers, {
    fields: [attendance.workerId],
    references: [workers.id],
  }),
  recorder: one(workers, {
    fields: [attendance.recordedBy],
    references: [workers.id],
  }),
}));