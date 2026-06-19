import * as z from "zod";

export const dashboardAnalyticsSchema = z.object({
  totalOrdersToday: z.number(),
  totalRevenueToday: z.number(),
  revenueChange: z.number(),
  ordersByStatus: z.array(
    z.object({
      status: z.string(),
      count: z.number(),
    }),
  ),
  topProducts: z.array(
    z.object({
      productId: z.number(),
      productName: z.string(),
      totalSold: z.number(),
      totalRevenue: z.number(),
    }),
  ),
  totalProducts: z.number(),
  totalClients: z.number(),
  totalWorkers: z.number(),
  lowStockItems: z.number(),
  pendingOrders: z.number(),
  inProgressOrders: z.number(),
});

export type DashboardAnalytics = z.infer<typeof dashboardAnalyticsSchema>;
