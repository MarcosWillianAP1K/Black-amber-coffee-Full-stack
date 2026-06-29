import { db } from "../../config/database";
import { eq, and, gte, sql, count } from "drizzle-orm";
import {
  orders,
  orderItems,
  products,
  clients,
  workers,
  stocks,
} from "@/db/schema";
import {
  DashboardAnalytics,
  dashboardAnalyticsSchema,
} from "./analytics.schema";
import { OrderStatus } from "../../core/enuns/orederStatus";

export default class AnalyticsService {
  async getDashboard(): Promise<DashboardAnalytics> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      ordersToday,
      ordersYesterday,
      ordersByStatusResult,
      topProductsResult,
      totalProductsResult,
      totalClientsResult,
      totalWorkersResult,
      lowStockResult,
    ] = await Promise.all([
      // Orders today
      db
        .select()
        .from(orders)
        .where(gte(orders.createdAt, todayStart)),

      // Orders yesterday (for comparison)
      db
        .select()
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, yesterdayStart),
            sql`${orders.createdAt} < ${todayStart}`,
          ),
        ),

      // Orders by status
      db
        .select({
          status: orders.status,
          count: count(),
        })
        .from(orders)
        .groupBy(orders.status),

      // Top 5 products by quantity sold (all time)
      db
        .select({
          productId: orderItems.productId,
          productName: products.name,
          totalSold: sql<number>`CAST(SUM(${orderItems.quantity}) AS INT)`,
          totalRevenue:
            sql<number>`CAST(SUM(CAST(${orderItems.unitPrice} AS DECIMAL) * ${orderItems.quantity}) AS DECIMAL(10,2))`,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .groupBy(orderItems.productId, products.name)
        .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
        .limit(5),

      // Total products
      db.select({ value: count() }).from(products),

      // Total clients
      db.select({ value: count() }).from(clients),

      // Total workers
      db.select({ value: count() }).from(workers),

      // Low stock items (quantity <= minQuantity)
      db
        .select({ value: count() })
        .from(stocks)
        .where(sql`${stocks.quantity} <= ${stocks.minQuantity}`),
    ]);

    const totalOrdersToday = ordersToday.length;
    const totalOrdersYesterday = ordersYesterday.length;

    const totalRevenueToday = ordersToday.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const totalRevenueYesterday = ordersYesterday.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    // Revenue change percentage
    const revenueChange =
      totalRevenueYesterday > 0
        ? ((totalRevenueToday - totalRevenueYesterday) / totalRevenueYesterday) * 100
        : totalRevenueToday > 0
          ? 100
          : 0;

    const ordersByStatus = ordersByStatusResult.map((r) => ({
      status: r.status,
      count: Number(r.count),
    }));

    const topProducts = topProductsResult.map((r) => ({
      productId: Number(r.productId),
      productName: r.productName ?? "Unknown",
      totalSold: Number(r.totalSold),
      totalRevenue: Number(r.totalRevenue),
    }));

    // Pending and in-progress counts from today's orders
    const pendingOrders = ordersToday.filter(
      (o) => o.status === OrderStatus.CRIADO,
    ).length;
    const inProgressOrders = ordersToday.filter(
      (o) => o.status === OrderStatus.EM_PREPARO,
    ).length;

    return dashboardAnalyticsSchema.parse({
      totalOrdersToday,
      totalRevenueToday: Math.round(totalRevenueToday * 100) / 100,
      revenueChange: Math.round(revenueChange * 100) / 100,
      ordersByStatus,
      topProducts,
      totalProducts: Number(totalProductsResult[0]?.value ?? 0),
      totalClients: Number(totalClientsResult[0]?.value ?? 0),
      totalWorkers: Number(totalWorkersResult[0]?.value ?? 0),
      lowStockItems: Number(lowStockResult[0]?.value ?? 0),
      pendingOrders,
      inProgressOrders,
    });
  }
}
