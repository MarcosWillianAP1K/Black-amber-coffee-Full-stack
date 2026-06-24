// Shared UI components
import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { CardAnalytics } from "ui-shared/components/CardAnalytics";
import { ChartAnalytics } from "ui-shared/components/ChartAnalytics";
import { StatusBadge } from "ui-shared/components/ui/StatusBadge";

// Admin components
import { CardOrder } from "../../components/cardOrder/CardOrder";
import { WidgetInventoryAlerts } from "../../components/WidgetInventoryAlerts";
import { WidgetActiveStaff } from "../../components/WidgetActiveStaff";
import { ErrorState } from "../../components/ui/ErrorState";

// Hooks
import { useAnalytics } from "../../hooks/useAnalytics";
import { useOrders } from "../../hooks/useOrders";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { useEmployee } from "../../hooks/useEmployee";
import { useMenuItems } from "../../hooks/useMenuItems";

// Icons
import { Coffee, TrendingUp, Truck, Users, Clock, Box } from "lucide-react";

const ICON_MAP = {
    orders: Coffee,
    sales: TrendingUp,
    deliveries: Truck,
    users: Users,
    hours: Clock,
    stock: Box,
} as const;

/** Skeleton pulse component */
function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-(--Border) ${className ?? ""}`} />;
}

export function Dashboard() {
    const { orders, handleAction, isLoading: ordersLoading, error: ordersError, refresh: refreshOrders } = useOrders();
    const { items: inventoryItems, isLoading: inventoryLoading } = useInventoryItems();
    const { employees, deleteEmployee, toggleEmployeeStatus, isLoading: employeesLoading, error: employeesError, refresh: refreshEmployees } = useEmployee();
    const { items: products, isLoading: menuLoading } = useMenuItems();

    const { data } = useAnalytics({
        orders,
        employees,
        products,
        inventory: inventoryItems,
    });

    const priorityOrders = orders
        .filter((order) => order.status === "em_preparo" || order.status === "criado")
        .sort((a, b) => {
            if (a.status === b.status) return 0;
            if (a.status === "em_preparo") return -1;
            if (b.status === "em_preparo") return 1;
            return 0;
        });

    const isLoading = ordersLoading || employeesLoading || menuLoading || inventoryLoading;

    return (
        <div className="w-full h-fit gap-6 flex flex-col">
            <DestakTitle title="Dashboard" subtitle="Welcome to your dashboard" />

            {/* Analytics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="w-full h-29 px-4 py-4 bg-(--Widget-background) rounded-md border border-(--Border) flex flex-col justify-between gap-3">
                              <div className="flex items-start justify-between">
                                  <div className="flex flex-col gap-2 flex-1">
                                      <Skeleton className="h-3 w-20" />
                                      <Skeleton className="h-7 w-28" />
                                  </div>
                                  <Skeleton className="w-10 h-10 rounded-md" />
                              </div>
                              <Skeleton className="h-3 w-32" />
                          </div>
                      ))
                    : data?.cards.map((card) => {
                          const Icon = card.iconKey ? ICON_MAP[card.iconKey] : null;
                          return (
                              <CardAnalytics
                                  key={card.id}
                                  title={card.title}
                                  value={card.value}
                                  delta={card.delta}
                                  deltaLabel={card.deltaLabel}
                                  trend={card.trend}
                                  icon={
                                      Icon ? <Icon className="w-5 h-5 text-(--White)" /> : undefined
                                  }
                                  iconBgClassName={card.iconBgClassName}
                              />
                          );
                      })}
            </div>

            {/* Chart */}
            {isLoading ? (
                <div className="w-full h-48 p-4 bg-(--Widget-background) rounded-md border border-(--Border) flex flex-col gap-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="flex-1 w-full" />
                </div>
            ) : data?.chart && data.chart.data.length > 0 ? (
                <ChartAnalytics
                    title={data.chart.title}
                    data={data.chart.data}
                    labels={data.chart.labels}
                    seriesLabel={data.chart.seriesLabel}
                />
            ) : null}

            {/* Main content */}
            <div className="flex flex-row gap-6">
                {/* Priority orders */}
                <div className="w-full 2xl:flex-2 h-200 bg-(--Widget-background) rounded-md border border-(--Border) p-5 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--Border) pb-3">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-(--Primary-off) text-[22px] font-primary font-bold">
                                Priority Orders
                            </h2>
                            <p className="text-(--Text-gray) text-sm">
                                Late and in-progress orders that need attention
                            </p>
                        </div>
                        <StatusBadge
                            status="Priority"
                            colorMap={{ Priority: { bg: "bg-(--Primary-20)/20", text: "text-(--Primary)" } }}
                        >
                            {priorityOrders.length} urgent
                        </StatusBadge>
                    </div>

                    <div className="flex flex-wrap gap-6 flex-1 overflow-y-auto pr-1">
                        {ordersLoading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="w-72 h-44 bg-(--Page-background) rounded-md border border-(--Border2) p-4 flex flex-col gap-3">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                    <div className="flex-1" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            ))
                        ) : ordersError ? (
                            <div className="w-full">
                                <ErrorState message={ordersError} onRetry={refreshOrders} />
                            </div>
                        ) : priorityOrders.length > 0 ? (
                            priorityOrders.map((order) => (
                                <div key={order.id} className="w-full sm:w-auto">
                                    <CardOrder order={order} onAction={handleAction} />
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center py-10 text-(--Text-gray)">
                                No priority orders right now
                            </div>
                        )}
                    </div>
                </div>

                {/* Side widgets */}
                <div className="w-160 h-100 2xl:flex-1 flex flex-col gap-6">
                    {/* Inventory alerts */}
                    {inventoryLoading ? (
                        <div className="w-full h-95 bg-(--Widget-background) rounded-md border border-(--Border) p-5 flex flex-col gap-4">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="flex-1 w-full" />
                        </div>
                    ) : (
                        <WidgetInventoryAlerts items={inventoryItems} />
                    )}

                    {/* Active staff */}
                    {employeesLoading ? (
                        <div className="w-full h-95 bg-(--Widget-background) rounded-md border border-(--Border) p-5 flex flex-col gap-4">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="flex-1 w-full" />
                        </div>
                    ) : employeesError ? (
                        <div className="w-full h-95 bg-(--Widget-background) rounded-md border border-(--Border) p-5">
                            <ErrorState message={employeesError} onRetry={refreshEmployees} />
                        </div>
                    ) : (
                        <WidgetActiveStaff
                            employees={employees}
                            onDeleteEmployee={deleteEmployee}
                            onBlockEmployee={toggleEmployeeStatus}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}