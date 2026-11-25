import { DestakTitle } from "ui-shared/components/ui/DestakTitle";
import { CardAnalytics } from "ui-shared/components/CardAnalytics";
import { ChartAnalytics } from "ui-shared/components/ChartAnalytics";
import { StatusBadge } from "ui-shared/components/ui/StatusBadge";

import { CardOrder } from "../../components/cardOrder/CardOrder";
import { WidgetInventoryAlerts } from "../../components/WidgetInventoryAlerts";
import { WidgetActiveStaff } from "../../components/WidgetActiveStaff";
import { ErrorState } from "../../components/ui/ErrorState";

import { useAnalytics } from "../../hooks/useAnalytics";
import { useOrders } from "../../hooks/useOrders";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { useEmployee } from "../../hooks/useEmployee";
import { useMenuItems } from "../../hooks/useMenuItems";
import { useCustomers } from "../../hooks/useCustomers";

import { Coffee, TrendingUp, Truck, Users, Clock, Box } from "lucide-react";

const ICON_MAP = {
    orders: Coffee,
    sales: TrendingUp,
    deliveries: Truck,
    users: Users,
    hours: Clock,
    stock: Box,
} as const;

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-(--Border)/60 ${className ?? ""}`} />;
}

export function Dashboard() {
    const {
        orders,
        handleAction,
        isLoading: ordersLoading,
        error: ordersError,
        refresh: refreshOrders,
    } = useOrders();
    const { items: inventoryItems, isLoading: inventoryLoading } = useInventoryItems();
    const {
        employees,
        deleteEmployee,
        toggleEmployeeStatus,
        isLoading: employeesLoading,
        error: employeesError,
        refresh: refreshEmployees,
    } = useEmployee();
    const { items: products, isLoading: menuLoading } = useMenuItems();
    const { customers } = useCustomers();

    const { data } = useAnalytics({
        orders,
        employees,
        products,
        inventory: inventoryItems,
    });

    const customerNames = new Map(customers.map((c) => [c.publicId, c.fullName]));

    const priorityOrders = orders
        .filter((order) => order.status === "em_preparo" || order.status === "criado")
        .sort((a, b) => {
            if (a.status === b.status) {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            if (a.status === "em_preparo") return -1;
            if (b.status === "em_preparo") return 1;
            return 0;
        });

    const isLoading = ordersLoading || employeesLoading || menuLoading || inventoryLoading;

    return (
        <div className="w-full flex flex-col gap-6 pb-8">
            <DestakTitle title="Dashboard" subtitle="Visão geral da operação em tempo real" />

            {/* Analytics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <div
                              key={i}
                              className="w-full min-h-29 px-5 py-4 bg-(--Widget-background) rounded-lg border border-(--Border) flex flex-col justify-between gap-3"
                          >
                              <div className="flex items-start justify-between">
                                  <div className="flex flex-col gap-2 flex-1">
                                      <Skeleton className="h-3 w-20" />
                                      <Skeleton className="h-7 w-28" />
                                  </div>
                                  <Skeleton className="w-10 h-10 rounded-lg" />
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
                                  icon={Icon ? <Icon className="w-5 h-5" /> : undefined}
                                  iconBgClassName={card.iconBgClassName}
                              />
                          );
                      })}
            </div>

            {/* Chart */}
            {isLoading ? (
                <div className="w-full h-56 p-5 bg-(--Widget-background) rounded-lg border border-(--Border) flex flex-col gap-4">
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

            {/* Main content grid responsivo */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Pedidos Prioritários */}
                <section className="xl:col-span-7 bg-(--Widget-background) rounded-lg border border-(--Border) p-5 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--Border)/70 pb-3">
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <h2 className="text-(--Primary-off) text-lg sm:text-xl font-primary font-bold">
                                Pedidos Prioritários
                            </h2>
                            <p className="text-(--Text-primary-off) text-xs sm:text-sm">
                                Pedidos aguardando início ou em preparo na bancada
                            </p>
                        </div>
                        <StatusBadge
                            status="Priority"
                            colorMap={{
                                Priority: {
                                    bg: "bg-(--Primary)/15",
                                    text: "text-(--Primary)",
                                },
                            }}
                        >
                            {priorityOrders.length}{" "}
                            {priorityOrders.length === 1 ? "pendente" : "pendentes"}
                        </StatusBadge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[680px] overflow-y-auto pr-1">
                        {ordersLoading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-44 bg-(--Page-background) rounded-xl border border-(--Border)/60 p-4 flex flex-col gap-3"
                                >
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                    <div className="flex-1" />
                                    <Skeleton className="h-9 w-full" />
                                </div>
                            ))
                        ) : ordersError ? (
                            <div className="md:col-span-2">
                                <ErrorState message={ordersError} onRetry={refreshOrders} />
                            </div>
                        ) : priorityOrders.length > 0 ? (
                            priorityOrders.map((order) => (
                                <CardOrder
                                    key={order.id}
                                    order={order}
                                    customerName={
                                        order.clientId ? customerNames.get(String(order.clientId)) : undefined
                                    }
                                    onAction={handleAction}
                                />
                            ))
                        ) : (
                            <div className="md:col-span-2 flex items-center justify-center py-12 text-(--Text-primary-off) text-sm">
                                Nenhum pedido prioritário no momento
                            </div>
                        )}
                    </div>
                </section>

                {/* Side widgets */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                    {inventoryLoading ? (
                        <div className="w-full h-56 bg-(--Widget-background) rounded-lg border border-(--Border) p-5 flex flex-col gap-4">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="flex-1 w-full" />
                        </div>
                    ) : (
                        <WidgetInventoryAlerts items={inventoryItems} />
                    )}

                    {employeesLoading ? (
                        <div className="w-full h-56 bg-(--Widget-background) rounded-lg border border-(--Border) p-5 flex flex-col gap-4">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="flex-1 w-full" />
                        </div>
                    ) : employeesError ? (
                        <div className="w-full bg-(--Widget-background) rounded-lg border border-(--Border) p-5">
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
