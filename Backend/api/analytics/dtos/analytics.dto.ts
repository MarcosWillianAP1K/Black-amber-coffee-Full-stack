export interface DashboardAnalyticsDTO {
  totalOrdersToday: number;
  totalRevenueToday: number;
  revenueChange: number;
  ordersByStatus: Array<{ status: string; count: number }>;
  topProducts: Array<{
    productId: number;
    productName: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  totalProducts: number;
  totalClients: number;
  totalWorkers: number;
  lowStockItems: number;
  pendingOrders: number;
  inProgressOrders: number;
}
