import { pool } from "../../../core/database/postgres.client.js";
import { OrderStatus } from "../../../core/enums/index.js";
import type { DashboardAnalyticsDTO } from "../dtos/analytics.dto.js";

export class AnalyticsModel {
  static async fetchDashboard(): Promise<DashboardAnalyticsDTO> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    const [
      ordersTodayRes,
      ordersYesterdayRes,
      ordersByStatusRes,
      topProductsRes,
      productsCountRes,
      clientsCountRes,
      workersCountRes,
      lowStockRes,
    ] = await Promise.all([
      pool.query<{ status: string; total_amount: string }>(
        `SELECT status::text AS status, total_amount FROM public.orders WHERE created_at >= $1`,
        [todayStart],
      ),
      pool.query<{ total_amount: string }>(
        `SELECT total_amount FROM public.orders WHERE created_at >= $1 AND created_at < $2`,
        [yesterdayStart, todayStart],
      ),
      pool.query<{ status: string; count: string }>(
        `SELECT status::text AS status, COUNT(*)::text AS count FROM public.orders GROUP BY status`,
      ),
      pool.query<{
        product_id: number;
        product_name: string | null;
        total_sold: string;
        total_revenue: string;
      }>(
        `SELECT
           oi.product_id,
           p.name AS product_name,
           COALESCE(SUM(oi.quantity), 0)::text AS total_sold,
           COALESCE(SUM(oi.unit_price * oi.quantity), 0)::text AS total_revenue
         FROM public.order_items oi
         LEFT JOIN public.products p ON p.id = oi.product_id
         GROUP BY oi.product_id, p.name
         ORDER BY SUM(oi.quantity) DESC
         LIMIT 5`,
      ),
      pool.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.products`),
      pool.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.clients`),
      pool.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.workers`),
      pool.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM public.inventory_items WHERE quantity <= min_quantity`,
      ),
    ]);

    const totalOrdersToday = ordersTodayRes.rows.length;
    const totalRevenueToday = ordersTodayRes.rows.reduce(
      (sum, row) => sum + Number(row.total_amount),
      0,
    );
    const totalRevenueYesterday = ordersYesterdayRes.rows.reduce(
      (sum, row) => sum + Number(row.total_amount),
      0,
    );

    const revenueChange =
      totalRevenueYesterday > 0
        ? ((totalRevenueToday - totalRevenueYesterday) / totalRevenueYesterday) * 100
        : totalRevenueToday > 0
          ? 100
          : 0;

    const pendingOrders = ordersTodayRes.rows.filter(
      (r) => r.status === OrderStatus.CRIADO,
    ).length;
    const inProgressOrders = ordersTodayRes.rows.filter(
      (r) => r.status === OrderStatus.EM_PREPARO,
    ).length;

    return {
      totalOrdersToday,
      totalRevenueToday: Math.round(totalRevenueToday * 100) / 100,
      revenueChange: Math.round(revenueChange * 100) / 100,
      ordersByStatus: ordersByStatusRes.rows.map((r) => ({
        status: r.status,
        count: Number(r.count),
      })),
      topProducts: topProductsRes.rows.map((r) => ({
        productId: Number(r.product_id),
        productName: r.product_name ?? "Produto",
        totalSold: Number(r.total_sold),
        totalRevenue: Number(r.total_revenue),
      })),
      totalProducts: Number(productsCountRes.rows[0]?.total ?? 0),
      totalClients: Number(clientsCountRes.rows[0]?.total ?? 0),
      totalWorkers: Number(workersCountRes.rows[0]?.total ?? 0),
      lowStockItems: Number(lowStockRes.rows[0]?.total ?? 0),
      pendingOrders,
      inProgressOrders,
    };
  }
}
